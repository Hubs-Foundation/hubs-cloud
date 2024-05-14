const EventEmitter = require('events').EventEmitter;
const protoo = require('protoo-server');
const throttle = require('@sitespeed.io/throttle');
const Logger = require('./Logger');
const config = require('../config');
const jwt = require('jsonwebtoken');

const logger = new Logger('Room');

const utils = require('./utils');


/**
 * Room class.
 *
 * This is not a "mediasoup Room" by itself, by a custom class that holds
 * a protoo Room (for signaling with WebSocket clients) and a mediasoup Router
 * (for sending and receiving media to/from those WebSocket peers).
 */
class Room extends EventEmitter
{
	/**
	 * Factory function that creates and returns Room instance.
	 *
	 * @async
	 *
	 * @param {String} roomId - Id of the Room instance.
	 */
	static async create({ mediasoupWorkers, roomId, authKey, roomSize=0 })
	{
		let roomReq = 0
		if (process.env.FORCE_ROOM_REQ) {
			roomReq = Number(process.env.FORCE_ROOM_REQ)
			logger.info("create()[roomId:%s] roomSize: %s, roomReq %s (FORCE_ROOM_REQ)", roomId, roomSize, roomReq);
		} else {
			// "best effort" guessing with pareto distribution / square root law for capacity reservation
			roomReq = Math.floor(Math.sqrt(roomSize));
			logger.info("create()[roomId:%s] roomSize: %s, roomReq %s (pareto)", roomId, roomSize, roomReq);
		}
		const inUseMediasoupWorkers = new Map();
		const mediasoupRouters = new Map();

		// Create a protoo Room instance.
		const protooRoom = new protoo.Room();

		// Router media codecs.
		const { mediaCodecs } = config.mediasoup.routerOptions;

		// Create first mediasoup Router on least loaded worker
		const [workerIdx, peerCnt] = utils.workerLoadMan.getLeastLoadedWorkerIdx(mediasoupWorkers, roomId, roomReq);
		const worker = mediasoupWorkers[workerIdx];
		const router = await worker.createRouter({ mediaCodecs });
		mediasoupRouters.set(router.id, router);
		inUseMediasoupWorkers.set(worker, router.id);

		const arr_unusedMediasoupWorkers = mediasoupWorkers.slice();
		arr_unusedMediasoupWorkers.splice(arr_unusedMediasoupWorkers.indexOf(worker), 1);

		// Create a mediasoup AudioLevelObserver.
		const audioLevelObserver = await router.createAudioLevelObserver(
			{
				maxEntries : 1,
				threshold  : -80,
				interval   : 800
			});

		return new Room(
			{
				roomId,
				roomReq,
				protooRoom,
				mediasoupRouters,
				audioLevelObserver,
				arr_unusedMediasoupWorkers,
				inUseMediasoupWorkers,
				authKey
			});
	}

	constructor({ roomId, roomReq, protooRoom, mediasoupRouters, audioLevelObserver, arr_unusedMediasoupWorkers, inUseMediasoupWorkers, authKey })
	{
		super();
		this.setMaxListeners(Infinity);

		// Room id.
		// @type {String}
		this._roomId = roomId;

		this._roomReq = roomReq;

		// Closed flag.
		// @type {Boolean}
		this._closed = false;

		// protoo Room instance.
		// @type {protoo.Room}
		this._protooRoom = protooRoom;

		// {array} unused mediasoupWorkers for this room
		this._arr_unusedMediasoupWorkers = arr_unusedMediasoupWorkers;

		// {map<worker._pid: routerId>}
		this._inUseMediasoupWorkers = inUseMediasoupWorkers;

		// Map of mediasoup Router instances.
		// {map<routerId: router>}
		this._mediasoupRouters = mediasoupRouters;

		// mediasoup AudioLevelObserver.
		// @type {mediasoup.AudioLevelObserver}
		this._audioLevelObserver = audioLevelObserver;

		// Network throttled.
		// @type {Boolean}
		this._networkThrottled = false;

		this._authKey = authKey;

		// Handle audioLevelObserver.
		this._handleAudioLevelObserver();

		// For debugging.
		global.audioLevelObserver = this._audioLevelObserver;
	}

	/**
	 * Closes the Room instance by closing the protoo Room and the mediasoup Router.
	 */
	close()
	{
		logger.debug('close()');

		this._closed = true;

		// Close the protoo Room.
		this._protooRoom.close();

		// Close the mediasoup Routers.
		for (const router of this._mediasoupRouters.values())
		{
			router.close();
		}

		// Emit 'close' event.
		this.emit('close');

		// Stop network throttling.
		if (this._networkThrottled)
		{
			throttle.stop({})
				.catch(() => {});
		}
	}

	logStatus()
	{
		logger.info(
			'logStatus() [roomId:%s, protoo Peers:%s, mediasoup Transports:%s]',
			this._roomId,
			this._protooRoom.peers.length,
		);
	}

	getCCU() {
		if (!this._protooRoom || !this._protooRoom.peers) return 0;
		return this._protooRoom.peers.length;
	}

	getPeers(){
		if (!this._protooRoom || !this._protooRoom.peers) return [];
		return this._protooRoom.peers;
	}

	/**
	 * Called from server.js upon a protoo WebSocket connection request from a
	 * browser.
	 *
	 * @param {String} peerId - The id of the protoo peer to be created.
	 * @param {Boolean} consume - Whether this peer wants to consume from others.
	 * @param {protoo.WebSocketTransport} protooWebSocketTransport - The associated
	 *   protoo WebSocket transport.
	 */
	async handleProtooConnection({ peerId, consume, protooWebSocketTransport })
	{
		const existingPeer = this._protooRoom.getPeer(peerId);

		if (existingPeer)
		{
			logger.warn(
				'handleProtooConnection() | there is already a protoo Peer with same peerId, closing it [peerId:%s]',
				peerId);

			existingPeer.close();
		}

		let peer;

		// Create a new protoo Peer with the given peerId.
		try
		{
			peer = this._protooRoom.createPeer(peerId, protooWebSocketTransport);
		}
		catch (error)
		{
			logger.error('protooRoom.createPeer() failed:%o', error);
		}

		// Use the peer.data object to store mediasoup related objects.

		// Not joined after a custom protoo 'join' request is later received.
		peer.data.consume = consume;
		peer.data.joined = false;
		peer.data.displayName = undefined;
		peer.data.device = undefined;
		peer.data.rtpCapabilities = undefined;
		peer.data.sctpCapabilities = undefined;

		// Have mediasoup related maps ready even before the Peer joins since we
		// allow creating Transports before joining.
		peer.data.transports = new Map();
		peer.data.producers = new Map();
		peer.data.consumers = new Map();
		peer.data.dataProducers = new Map();
		peer.data.dataConsumers = new Map();
		peer.data.peerIdToConsumerId = new Map();
		peer.data.blockedPeers = new Set();

		const [routerId, workerPid]  = await this._getRouterId();
		peer.data.routerId = routerId;
		peer.data.workerPid = workerPid;


		peer.on('request', (request, accept, reject) =>
		{
			logger.debug(
				'protoo Peer "request" event [method:%s, peerId:%s]',
				request.method, peer.id);

			this._handleProtooRequest(peer, request, accept, reject)
				.catch((error) =>
				{
					logger.error('request failed:%o', error);

					reject(error);
				});
		});

		peer.on('close', () =>
		{
			if (this._closed)
				return;

			logger.debug('protoo Peer "close" event [peerId:%s]', peer.id);

			// If the Peer was joined, notify all Peers.
			if (peer.data.joined)
			{
				for (const otherPeer of this._getJoinedPeers({ excludePeer: peer }))
				{
					otherPeer.notify('peerClosed', { peerId: peer.id })
						.catch(() => {});
				}
			}

			// Iterate and close all mediasoup Transport associated to this Peer, so all
			// its Producers and Consumers will also be closed.
			for (const transport of peer.data.transports.values())
			{
				transport.close();
			}

			// If this is the latest Peer in the room, close the room.
			if (this._protooRoom.peers.length === 0)
			{
				logger.info(
					'last Peer in the room left, closing the room [roomId:%s]',
					this._roomId);

				this.close();
			}
		});
	}

	_handleAudioLevelObserver()
	{
		this._audioLevelObserver.on('volumes', (volumes) =>
		{
			const { producer, volume } = volumes[0];

			// logger.debug(
			// 	'audioLevelObserver "volumes" event [producerId:%s, volume:%s]',
			// 	producer.id, volume);

			// Notify all Peers.
			for (const peer of this._getJoinedPeers())
			{
				peer.notify(
					'activeSpeaker',
					{
						peerId : producer.appData.peerId,
						volume : volume
					})
					.catch(() => {});
			}
		});

		this._audioLevelObserver.on('silence', () =>
		{
			// logger.debug('audioLevelObserver "silence" event');

			// Notify all Peers.
			for (const peer of this._getJoinedPeers())
			{
				peer.notify('activeSpeaker', { peerId: null })
					.catch(() => {});
			}
		});
	}

	async _consumeExistingProducers(peer, joinedPeers) {
		for (const joinedPeer of joinedPeers)
		{
			// Create Consumers for existing Producers.
			for (const producer of joinedPeer.data.producers.values())
			{
				await this._createConsumer(
					{
						consumerPeer : peer,
						producerPeer : joinedPeer,
						producer
					});
			}

			// Create DataConsumers for existing DataProducers.
			for (const dataProducer of joinedPeer.data.dataProducers.values())
			{
				await this._createDataConsumer(
					{
						dataConsumerPeer : peer,
						dataProducerPeer : joinedPeer,
						dataProducer
					});
			}
		}

	}

	/**
	 * Handle protoo requests from browsers.
	 *
	 * @async
	 */
	async _handleProtooRequest(peer, request, accept, reject)
	{
		const router = this._mediasoupRouters.get(peer.data.routerId);

		switch (request.method)
		{
			case 'getRouterRtpCapabilities':
			{
				accept(router.rtpCapabilities);

				break;
			}

			case 'join':
			{
				// Ensure the Peer is not already joined.
				if (peer.data.joined)
					throw new Error('Peer already joined');

				const {
					displayName,
					device,
					rtpCapabilities,
					sctpCapabilities,
					token
				} = request.data;

				// Store client data into the protoo Peer data object.
				peer.data.joined = true;
				peer.data.displayName = displayName;
				peer.data.device = device;
				peer.data.rtpCapabilities = rtpCapabilities;
				peer.data.sctpCapabilities = sctpCapabilities;
				peer.data.token = token;
				
				jwt.verify(peer.data.token, this._authKey, { algorithms: ['RS512'] }, (err, decoded) => {
					if (err) {
						reject(500, err);
						return;
					}

					if (!decoded.join_hub) {
						reject(401);
						return;
					}
				});

				// Tell the new Peer about already joined Peers.
				// And also create Consumers for existing Producers.

				const joinedPeers =
				[
					...this._getJoinedPeers(),
				];

				// Reply now the request with the list of joined peers (all but the new one).
				const peerInfos = joinedPeers
					.filter((joinedPeer) => joinedPeer.id !== peer.id)
					.map((joinedPeer) => ({
						id           : joinedPeer.id,
						displayName  : joinedPeer.data.displayName,
						device       : joinedPeer.data.device,
						hasProducers : joinedPeer.data.producers.size > 0
					}));

				accept({ peers: peerInfos });

				// Mark the new Peer as joined.
				peer.data.joined = true;

				await this._consumeExistingProducers(peer, joinedPeers);

				// Notify the new Peer to all other Peers.
				for (const otherPeer of this._getJoinedPeers({ excludePeer: peer }))
				{
					otherPeer.notify(
						'newPeer',
						{
							id          : peer.id,
							displayName : peer.data.displayName,
							device      : peer.data.device
						})
						.catch(() => {});
				}

				break;
			}

			case 'refreshConsumers':
			{
				// Ensure the Peer is already joined.
				if (!peer.data.joined)
					throw new Error('Peer not joined');

				accept();

				const joinedPeers =
				[
					...this._getJoinedPeers({ excludePeer: peer }),
				];

				await this._consumeExistingProducers(peer, joinedPeers);

				break;
			}

			case 'createWebRtcTransport':
			{
				// NOTE: Don't require that the Peer is joined here, so the client can
				// initiate mediasoup Transports and be ready when he later joins.

				const {
					forceTcp,
					producing,
					consuming,
					sctpCapabilities
				} = request.data;

				const webRtcTransportOptions =
				{
					...config.mediasoup.webRtcTransportOptions,
					enableSctp     : Boolean(sctpCapabilities),
					numSctpStreams : (sctpCapabilities || {}).numStreams,
					appData        : { producing, consuming }
				};

				if (forceTcp)
				{
					webRtcTransportOptions.enableUdp = false;
					webRtcTransportOptions.enableTcp = true;
				}

				const transport = await router.createWebRtcTransport(
					webRtcTransportOptions);

				transport.on('sctpstatechange', (sctpState) =>
				{
					logger.debug('WebRtcTransport "sctpstatechange" event [sctpState:%s]', sctpState);
				});

				transport.on('dtlsstatechange', (dtlsState) =>
				{
					if (dtlsState === 'failed' || dtlsState === 'closed')
						logger.warn('WebRtcTransport "dtlsstatechange" event [dtlsState:%s]', dtlsState);
				});

				// NOTE: For testing.
				// await transport.enableTraceEvent([ 'probation', 'bwe' ]);
				await transport.enableTraceEvent([ 'bwe' ]);

				transport.on('trace', (trace) =>
				{
					logger.debug(
						'transport "trace" event [transportId:%s, trace.type:%s, trace:%o]',
						transport.id, trace.type, trace);

					if (trace.type === 'bwe' && trace.direction === 'out')
					{
						peer.notify(
							'downlinkBwe',
							{
								desiredBitrate          : trace.info.desiredBitrate,
								effectiveDesiredBitrate : trace.info.effectiveDesiredBitrate,
								availableBitrate        : trace.info.availableBitrate
							})
							.catch(() => {});
					}
				});

				// Store the WebRtcTransport into the protoo Peer data Object.
				peer.data.transports.set(transport.id, transport);

				transport.observer.on('close', () => {
					peer.data.transports.delete(transport.id);
				});

				accept(
					{
						id             : transport.id,
						iceParameters  : transport.iceParameters,
						iceCandidates  : transport.iceCandidates,
						dtlsParameters : transport.dtlsParameters,
						sctpParameters : transport.sctpParameters
					});

				const { maxIncomingBitrate } = config.mediasoup.webRtcTransportOptions;

				// If set, apply max incoming bitrate limit.
				if (maxIncomingBitrate)
				{
					try { await transport.setMaxIncomingBitrate(maxIncomingBitrate); }
					catch (error) {}
				}

				break;
			}

			case 'closeWebRtcTransport': {
				const { transportId } = request.data;
				const transport = peer.data.transports.get(transportId);

				if (!transport)
					throw new Error(`transport with id "${transportId}" not found`);

				transport.close();

				accept();

				break;
			}

			case 'connectWebRtcTransport':
			{
				const { transportId, dtlsParameters } = request.data;
				const transport = peer.data.transports.get(transportId);

				if (!transport)
					throw new Error(`transport with id "${transportId}" not found`);

				await transport.connect({ dtlsParameters });

				accept();

				break;
			}

			case 'restartIce':
			{
				const { transportId } = request.data;
				const transport = peer.data.transports.get(transportId);

				if (!transport)
					throw new Error(`transport with id "${transportId}" not found`);

				const iceParameters = await transport.restartIce();

				accept(iceParameters);

				break;
			}

			case 'produce':
			{
				// Ensure the Peer is joined.
				if (!peer.data.joined)
					throw new Error('Peer not yet joined');

				const { transportId, kind, rtpParameters } = request.data;
				let { appData } = request.data;
				const transport = peer.data.transports.get(transportId);

				if (!transport)
					throw new Error(`transport with id "${transportId}" not found`);

				// Add peerId into appData to later get the associated Peer during
				// the 'loudest' event of the audioLevelObserver.
				appData = { ...appData, peerId: peer.id };

				const producer = await transport.produce(
					{
						kind,
						rtpParameters,
						appData
						// keyFrameRequestDelay: 5000
					});

				for (const [ routerId, targetRouter ] of this._mediasoupRouters)
				{
					logger.info("this.routerId: %s, that.routerId: %s", peer.data.routerId, routerId);
					if (routerId === peer.data.routerId){
						logger.info("skip self");
						continue;
					}

					logger.info("piping to (rouerId) %s for (producerId) %s", targetRouter.id, producer.id);
					await router.pipeToRouter({
						producerId : producer.id,
						router     : targetRouter
					});
				}

				// Store the Producer into the protoo Peer data Object.
				peer.data.producers.set(producer.id, producer);

				// Set Producer events.
				producer.on('score', (score) =>
				{
					// logger.debug(
					// 	'producer "score" event [producerId:%s, score:%o]',
					// 	producer.id, score);

					peer.notify('producerScore', { producerId: producer.id, score })
						.catch(() => {});
				});

				producer.on('videoorientationchange', (videoOrientation) =>
				{
					logger.debug(
						'producer "videoorientationchange" event [producerId:%s, videoOrientation:%o]',
						producer.id, videoOrientation);
				});

				// NOTE: For testing.
				// await producer.enableTraceEvent([ 'rtp', 'keyframe', 'nack', 'pli', 'fir' ]);
				// await producer.enableTraceEvent([ 'pli', 'fir' ]);
				// await producer.enableTraceEvent([ 'keyframe' ]);

				producer.on('trace', (trace) =>
				{
					logger.debug(
						'producer "trace" event [producerId:%s, trace.type:%s, trace:%o]',
						producer.id, trace.type, trace);
				});

				accept({ id: producer.id });

				// Optimization: Create a server-side Consumer for each Peer.
				for (const otherPeer of this._getJoinedPeers({ excludePeer: peer }))
				{
					this._createConsumer(
						{
							consumerPeer : otherPeer,
							producerPeer : peer,
							producer
						});
				}

				// Add into the audioLevelObserver.
				if (producer.kind === 'audio')
				{
					this._audioLevelObserver.addProducer({ producerId: producer.id })
						.catch(() => {});
				}

				break;
			}

			case 'closeProducer':
			{
				// Ensure the Peer is joined.
				if (!peer.data.joined)
					throw new Error('Peer not yet joined');

				const { producerId } = request.data;
				const producer = peer.data.producers.get(producerId);

				if (!producer)
					throw new Error(`producer with id "${producerId}" not found`);

				producer.close();

				// Remove from its map.
				peer.data.producers.delete(producer.id);

				accept();

				break;
			}

			case 'pauseProducer':
			{
				// Ensure the Peer is joined.
				if (!peer.data.joined)
					throw new Error('Peer not yet joined');

				const { producerId } = request.data;
				const producer = peer.data.producers.get(producerId);

				if (!producer)
					throw new Error(`producer with id "${producerId}" not found`);

				await producer.pause();

				accept();

				break;
			}

			case 'resumeProducer':
			{
				// Ensure the Peer is joined.
				if (!peer.data.joined)
					throw new Error('Peer not yet joined');

				const { producerId } = request.data;
				const producer = peer.data.producers.get(producerId);

				if (!producer)
					throw new Error(`producer with id "${producerId}" not found`);

				await producer.resume();

				accept();

				break;
			}

			case 'pauseConsumer':
			{
				// Ensure the Peer is joined.
				if (!peer.data.joined)
					throw new Error('Peer not yet joined');

				const { consumerId } = request.data;
				const consumer = peer.data.consumers.get(consumerId);

				if (!consumer)
					throw new Error(`consumer with id "${consumerId}" not found`);

				await consumer.pause();

				accept();

				break;
			}

			case 'resumeConsumer':
			{
				// Ensure the Peer is joined.
				if (!peer.data.joined)
					throw new Error('Peer not yet joined');

				const { consumerId } = request.data;
				const consumer = peer.data.consumers.get(consumerId);

				if (!consumer)
					throw new Error(`consumer with id "${consumerId}" not found`);

				await consumer.resume();

				accept();

				break;
			}

			case 'setConsumerPreferredLayers':
			{
				// Ensure the Peer is joined.
				if (!peer.data.joined)
					throw new Error('Peer not yet joined');

				const { consumerId, spatialLayer, temporalLayer } = request.data;
				const consumer = peer.data.consumers.get(consumerId);

				if (!consumer)
					throw new Error(`consumer with id "${consumerId}" not found`);

				await consumer.setPreferredLayers({ spatialLayer, temporalLayer });

				accept();

				break;
			}

			case 'setConsumerPriority':
			{
				// Ensure the Peer is joined.
				if (!peer.data.joined)
					throw new Error('Peer not yet joined');

				const { consumerId, priority } = request.data;
				const consumer = peer.data.consumers.get(consumerId);

				if (!consumer)
					throw new Error(`consumer with id "${consumerId}" not found`);

				await consumer.setPriority(priority);

				accept();

				break;
			}

			case 'requestConsumerKeyFrame':
			{
				// Ensure the Peer is joined.
				if (!peer.data.joined)
					throw new Error('Peer not yet joined');

				const { consumerId } = request.data;
				const consumer = peer.data.consumers.get(consumerId);

				if (!consumer)
					throw new Error(`consumer with id "${consumerId}" not found`);

				await consumer.requestKeyFrame();

				accept();

				break;
			}

			case 'produceData':
			{
				// Ensure the Peer is joined.
				if (!peer.data.joined)
					throw new Error('Peer not yet joined');

				const {
					transportId,
					sctpStreamParameters,
					label,
					protocol,
					appData
				} = request.data;

				const transport = peer.data.transports.get(transportId);

				if (!transport)
					throw new Error(`transport with id "${transportId}" not found`);

				const dataProducer = await transport.produceData(
					{
						sctpStreamParameters,
						label,
						protocol,
						appData
					});

				// Store the Producer into the protoo Peer data Object.
				peer.data.dataProducers.set(dataProducer.id, dataProducer);

				accept({ id: dataProducer.id });

				switch (dataProducer.label)
				{
					case 'chat':
					{
						// Create a server-side DataConsumer for each Peer.
						for (const otherPeer of this._getJoinedPeers({ excludePeer: peer }))
						{
							this._createDataConsumer(
								{
									dataConsumerPeer : otherPeer,
									dataProducerPeer : peer,
									dataProducer
								});
						}
						break;
					}
				}

				break;
			}

			case 'changeDisplayName':
			{
				// Ensure the Peer is joined.
				if (!peer.data.joined)
					throw new Error('Peer not yet joined');

				const { displayName } = request.data;
				const oldDisplayName = peer.data.displayName;

				// Store the display name into the custom data Object of the protoo
				// Peer.
				peer.data.displayName = displayName;

				// Notify other joined Peers.
				for (const otherPeer of this._getJoinedPeers({ excludePeer: peer }))
				{
					otherPeer.notify(
						'peerDisplayNameChanged',
						{
							peerId : peer.id,
							displayName,
							oldDisplayName
						})
						.catch(() => {});
				}

				accept();

				break;
			}

			case 'getTransportStats':
			{
				const { transportId } = request.data;
				const transport = peer.data.transports.get(transportId);

				if (!transport)
					throw new Error(`transport with id "${transportId}" not found`);

				const stats = await transport.getStats();

				accept(stats);

				break;
			}

			case 'getProducerStats':
			{
				const { producerId } = request.data;
				const producer = peer.data.producers.get(producerId);

				if (!producer)
					throw new Error(`producer with id "${producerId}" not found`);

				const stats = await producer.getStats();

				accept(stats);

				break;
			}

			case 'getConsumerStats':
			{
				const { consumerId } = request.data;
				const consumer = peer.data.consumers.get(consumerId);

				if (!consumer)
					throw new Error(`consumer with id "${consumerId}" not found`);

				const stats = await consumer.getStats();

				accept(stats);

				break;
			}

			case 'getDataProducerStats':
			{
				const { dataProducerId } = request.data;
				const dataProducer = peer.data.dataProducers.get(dataProducerId);

				if (!dataProducer)
					throw new Error(`dataProducer with id "${dataProducerId}" not found`);

				const stats = await dataProducer.getStats();

				accept(stats);

				break;
			}

			case 'getDataConsumerStats':
			{
				const { dataConsumerId } = request.data;
				const dataConsumer = peer.data.dataConsumers.get(dataConsumerId);

				if (!dataConsumer)
					throw new Error(`dataConsumer with id "${dataConsumerId}" not found`);

				const stats = await dataConsumer.getStats();

				accept(stats);

				break;
			}

			case 'applyNetworkThrottle':
			{
				// reject(501, 'do we need this?')
				// return

				const DefaultUplink = 1000000;
				const DefaultDownlink = 1000000;
				const DefaultRtt = 0;

				const { uplink, downlink, rtt, secret } = request.data;

				if (!secret || secret !== process.env.NETWORK_THROTTLE_SECRET)
				{
					reject(403, 'operation NOT allowed, modda fuckaa');

					return;
				}

				try
				{
					await throttle.start(
						{
							up   : uplink || DefaultUplink,
							down : downlink || DefaultDownlink,
							rtt  : rtt || DefaultRtt
						});

					logger.warn(
						'network throttle set [uplink:%s, downlink:%s, rtt:%s]',
						uplink || DefaultUplink,
						downlink || DefaultDownlink,
						rtt || DefaultRtt);

					accept();
				}
				catch (error)
				{
					logger.error('network throttle apply failed: %o', error);

					reject(500, error.toString());
				}

				break;
			}

			case 'resetNetworkThrottle':
			{
				// reject(501, 'do we need this?')
				// return

				const { secret } = request.data;

				if (!secret || secret !== process.env.NETWORK_THROTTLE_SECRET)
				{
					reject(403, 'operation NOT allowed, modda fuckaa');

					return;
				}

				try
				{
					await throttle.stop({});

					logger.warn('network throttle stopped');

					accept();
				}
				catch (error)
				{
					logger.error('network throttle stop failed: %o', error);

					reject(500, error.toString());
				}

				break;
			}

			case 'kick':
			{
				jwt.verify(peer.data.token, this._authKey, { algorithms: ['RS512'] }, (err, decoded) => {
					if (err) {
						reject(500, err);
					} else {
						if (decoded.kick_users) {
							const consumerId = request.data.user_id;
							if (this._protooRoom.hasPeer(consumerId)) {
								this._protooRoom.getPeer(consumerId).close();
							}
							accept();
						} else {
							reject(401);
						}
					}
				});
				break;
			}
			
			case 'block':
			{
				const localPeer = peer;
				const remotePeerId = request.data.whom;

				const localConsumerId = localPeer.data.peerIdToConsumerId.get(remotePeerId);
				const localConsumer = localPeer.data.consumers.get(localConsumerId);
				if (localConsumer) {
					localConsumer.pause();
				}

				localPeer.data.blockedPeers.add(remotePeerId);
					
				if (this._protooRoom.hasPeer(remotePeerId)) {
					const remotePeer = this._protooRoom.getPeer(remotePeerId)
					const remoteConsumerId = remotePeer.data.peerIdToConsumerId.get(localPeer.id);
					const remoteConsumer = remotePeer.data.consumers.get(remoteConsumerId);
					if(remoteConsumer) {
						remoteConsumer.pause();
					}
					remotePeer.notify('peerBlocked', { peerId: localPeer.id }).catch(() => {});
				}
				accept();
				break;
			}

			case 'unblock':
			{
				const localPeer = peer;
				const remotePeerId = request.data.whom;
				
				localPeer.data.blockedPeers.delete(remotePeerId);

				if (this._protooRoom.hasPeer(remotePeerId)) {
					const remotePeer = this._protooRoom.getPeer(remotePeerId);
					if (!remotePeer.data.blockedPeers.has(localPeer.id)) {
						const localConsumer = localPeer.data.consumers.get(localPeer.data.peerIdToConsumerId.get(remotePeerId));
						if (localConsumer) {
							localConsumer.resume();
						}
						const remoteConsumer = remotePeer.data.consumers.get(remotePeer.data.peerIdToConsumerId.get(localPeer.id));
						if (remoteConsumer) {
							remoteConsumer.resume();
						}
						localPeer.notify('peerUnblocked', { peerId: remotePeer.id }).catch(() => {});
						remotePeer.notify('peerUnblocked', { peerId: localPeer.id }).catch(() => {});
					}
				}
				accept();
				break;
			}

			default:
			{
				logger.error('unknown request.method "%s"', request.method);

				reject(500, `unknown request.method "${request.method}"`);
			}
		}
	}

	/**
	 * Helper to get the list of joined protoo peers.
	 */
	_getJoinedPeers({ excludePeer = undefined } = {})
	{
		return this._protooRoom.peers
			.filter((peer) => peer.data.joined && peer !== excludePeer);
	}

	/**
	 * Creates a mediasoup Consumer for the given mediasoup Producer.
	 *
	 * @async
	 */
	async _createConsumer({ consumerPeer, producerPeer, producer })
	{
		// Optimization:
		// - Create the server-side Consumer in paused mode.
		// - Tell its Peer about it and wait for its response.
		// - Upon receipt of the response, resume the server-side Consumer.
		// - If video, this will mean a single key frame requested by the
		//   server-side Consumer (when resuming it).
		// - If audio (or video), it will avoid that RTP packets are received by the
		//   remote endpoint *before* the Consumer is locally created in the endpoint
		//   (and before the local SDP O/A procedure ends). If that happens (RTP
		//   packets are received before the SDP O/A is done) the PeerConnection may
		//   fail to associate the RTP stream.

		// NOTE: Don't create the Consumer if the remote Peer cannot consume it.
		if (
			!consumerPeer.data.rtpCapabilities ||
			!this._mediasoupRouters.get(consumerPeer.data.routerId).canConsume(
				{
					producerId      : producer.id,
					rtpCapabilities : consumerPeer.data.rtpCapabilities
				})
		)
		{
			return;
		}

		// Must take the Transport the remote Peer is using for consuming.
		const transport = Array.from(consumerPeer.data.transports.values())
			.find((t) => t.appData.consuming);

		// This should not happen.
		if (!transport)
		{
			logger.warn('_createConsumer() | Transport for consuming not found');

			return;
		}

		// Create the Consumer in paused mode.
		let consumer;

		try
		{
			consumer = await transport.consume(
				{
					producerId      : producer.id,
					rtpCapabilities : consumerPeer.data.rtpCapabilities,
					paused          : true
				});
		}
		catch (error)
		{
			logger.warn('_createConsumer() | transport.consume():%o', error);

			return;
		}

		// Store the Consumer into the protoo consumerPeer data Object.
		consumerPeer.data.consumers.set(consumer.id, consumer);
		consumerPeer.data.peerIdToConsumerId.set(producerPeer.id, consumer.id);

		// Set Consumer events.
		consumer.on('transportclose', () =>
		{
			// Remove from its map.
			consumerPeer.data.consumers.delete(consumer.id);
			consumerPeer.data.peerIdToConsumerId.delete(producerPeer.id);
		});

		consumer.on('producerclose', () =>
		{
			// Remove from its map.
			consumerPeer.data.consumers.delete(consumer.id);
			consumerPeer.data.peerIdToConsumerId.delete(producerPeer.id);

			consumerPeer.notify('consumerClosed', { consumerId: consumer.id })
				.catch(() => {});
		});

		consumer.on('producerpause', () =>
		{
			consumerPeer.notify('consumerPaused', { consumerId: consumer.id })
				.catch(() => {});
		});

		consumer.on('producerresume', () =>
		{
			consumerPeer.notify('consumerResumed', { consumerId: consumer.id })
				.catch(() => {});
		});

		consumer.on('score', (score) =>
		{
			// logger.debug(
			// 	'consumer "score" event [consumerId:%s, score:%o]',
			// 	consumer.id, score);

			consumerPeer.notify('consumerScore', { consumerId: consumer.id, score })
				.catch(() => {});
		});

		consumer.on('layerschange', (layers) =>
		{
			consumerPeer.notify(
				'consumerLayersChanged',
				{
					consumerId    : consumer.id,
					spatialLayer  : layers ? layers.spatialLayer : null,
					temporalLayer : layers ? layers.temporalLayer : null
				})
				.catch(() => {});
		});

		// NOTE: For testing.
		// await consumer.enableTraceEvent([ 'rtp', 'keyframe', 'nack', 'pli', 'fir' ]);
		// await consumer.enableTraceEvent([ 'pli', 'fir' ]);
		// await consumer.enableTraceEvent([ 'keyframe' ]);

		consumer.on('trace', (trace) =>
		{
			logger.debug(
				'consumer "trace" event [producerId:%s, trace.type:%s, trace:%o]',
				consumer.id, trace.type, trace);
		});

		// Send a protoo request to the remote Peer with Consumer parameters.
		try
		{
			await consumerPeer.request(
				'newConsumer',
				{
					peerId         : producerPeer.id,
					producerId     : producer.id,
					id             : consumer.id,
					kind           : consumer.kind,
					rtpParameters  : consumer.rtpParameters,
					type           : consumer.type,
					appData        : producer.appData,
					producerPaused : consumer.producerPaused
				});

			// Now that we got the positive response from the remote endpoint, resume
			// the Consumer so the remote endpoint will receive the a first RTP packet
			// of this new stream once its PeerConnection is already ready to process
			// and associate it.
			await consumer.resume();

			consumerPeer.notify(
				'consumerScore',
				{
					consumerId : consumer.id,
					score      : consumer.score
				})
				.catch(() => {});
		}
		catch (error)
		{
			logger.warn('_createConsumer() | failed:%o', error);
		}
	}

	/**
	 * Creates a mediasoup DataConsumer for the given mediasoup DataProducer.
	 *
	 * @async
	 */
	async _createDataConsumer(
		{
			dataConsumerPeer,
			dataProducerPeer = null,
			dataProducer
		})
	{
		// NOTE: Don't create the DataConsumer if the remote Peer cannot consume it.
		if (!dataConsumerPeer.data.sctpCapabilities)
			return;

		// Must take the Transport the remote Peer is using for consuming.
		const transport = Array.from(dataConsumerPeer.data.transports.values())
			.find((t) => t.appData.consuming);

		// This should not happen.
		if (!transport)
		{
			logger.warn('_createDataConsumer() | Transport for consuming not found');

			return;
		}

		// Create the DataConsumer.
		let dataConsumer;

		try
		{
			dataConsumer = await transport.consumeData(
				{
					dataProducerId : dataProducer.id
				});
		}
		catch (error)
		{
			logger.warn('_createDataConsumer() | transport.consumeData():%o', error);

			return;
		}

		// Store the DataConsumer into the protoo dataConsumerPeer data Object.
		dataConsumerPeer.data.dataConsumers.set(dataConsumer.id, dataConsumer);

		// Set DataConsumer events.
		dataConsumer.on('transportclose', () =>
		{
			// Remove from its map.
			dataConsumerPeer.data.dataConsumers.delete(dataConsumer.id);
		});

		dataConsumer.on('dataproducerclose', () =>
		{
			// Remove from its map.
			dataConsumerPeer.data.dataConsumers.delete(dataConsumer.id);

			dataConsumerPeer.notify(
				'dataConsumerClosed', { dataConsumerId: dataConsumer.id })
				.catch(() => {});
		});

		// Send a protoo request to the remote Peer with Consumer parameters.
		try
		{
			await dataConsumerPeer.request(
				'newDataConsumer',
				{
					peerId               : dataProducerPeer ? dataProducerPeer.id : null,
					dataProducerId       : dataProducer.id,
					id                   : dataConsumer.id,
					sctpStreamParameters : dataConsumer.sctpStreamParameters,
					label                : dataConsumer.label,
					protocol             : dataConsumer.protocol,
					appData              : dataProducer.appData
				});
		}
		catch (error)
		{
			logger.warn('_createDataConsumer() | failed:%o', error);
		}
	}

	/**
	 * check currently in use mediasoup workers, returns the routerId of the least loaded on
	 * @returns (string) routerId
	 */
	async _getRouterId()
	{
		let worker = {};
		let routerId = "";

		const workers = Array.from(this._inUseMediasoupWorkers.keys());
		const [leastUsedWorkerIdx, peerCnt] = utils.workerLoadMan.getLeastLoadedWorkerIdx(workers, this._roomId, this._roomReq);

		logger.info("_inUseMediasoupWorkers -> leastUsedWorkerIdx: %s, peerCnt: %s", leastUsedWorkerIdx, peerCnt);

		if (peerCnt < utils.ccuThreshold)
		{
			worker = workers[leastUsedWorkerIdx];
			routerId = this._inUseMediasoupWorkers.get(worker);
			return [routerId, worker._pid];
		}
		// in use workers are all maxed out
		else if (this._arr_unusedMediasoupWorkers.length > 0)
		{
			// looking for available worker among unused workers
			const [leastUsedWorkerIdx_unused, peerCnt_unused] = utils.workerLoadMan.getLeastLoadedWorkerIdx(
				this._arr_unusedMediasoupWorkers, this._roomId, this._roomReq);

			logger.info("leastUsedWorkerIdx_unused: %s, peerCnt: %s", leastUsedWorkerIdx_unused, peerCnt_unused);

			if (peerCnt_unused < utils.ccuThreshold)
			{
				worker = this._arr_unusedMediasoupWorkers[leastUsedWorkerIdx_unused];

				const { mediaCodecs } = config.mediasoup.routerOptions;
				const newRouter = await worker.createRouter({ mediaCodecs });
				this._mediasoupRouters.set(newRouter.id, newRouter);
				this._inUseMediasoupWorkers.set(worker, newRouter.id);
				this._arr_unusedMediasoupWorkers.splice(this._arr_unusedMediasoupWorkers.indexOf(worker), 1);

				logger.info("new router (id: %s) created on worker (pid: %s) for room (id: %s)", newRouter.id, worker._pid, this._roomId);
				logger.info("this._mediasoupRouters.size: ", this._mediasoupRouters.size);

				this._pipeProducersToRouter(newRouter.id);

				return [newRouter.id, worker._pid];
			}
		}

		// BAD: everything's maxed out on this server
		// TODO: check other dialogs servers' workers and pipeToRouter_Lan()
		logger.warn("high server load -- all workers maxed out");
		worker = workers[leastUsedWorkerIdx];
		routerId = this._inUseMediasoupWorkers.get(worker);
		return [routerId, worker._pid];
	}

	async _pipeProducersToRouter(routerId)
	{
		const router = this._mediasoupRouters.get(routerId);

		const peersToPipe =
			Object.values(this._protooRoom.peers)
				.filter((peer) => peer.data.routerId !== routerId && peer.data.routerId !== null);

		for (const peer of peersToPipe)
		{
			const srcRouter = this._mediasoupRouters.get(peer.data.routerId);

			for (const producerId of peer.data.producers.keys())
			{
				if (router._producers.has(producerId))
				{
					logger.info("~~~skipping~parenting~router~~~")
					continue;
				}

				await srcRouter.pipeToRouter({
					producerId : producerId,
					router     : router
				});
			}
		}
	}	

}

module.exports = Room;
