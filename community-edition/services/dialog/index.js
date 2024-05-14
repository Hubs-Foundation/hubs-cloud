#!/usr/bin/env node

// Based upon mediasoup-demo server
// https://github.com/versatica/mediasoup-demo/tree/v3/server

process.title = 'dialog';
process.env.DEBUG = process.env.DEBUG || '*INFO* *WARN* *ERROR*';

const config = require('./config');

/* eslint-disable no-console */
console.log('process.env.DEBUG:', process.env.DEBUG);
console.log('config.js:\n%s', JSON.stringify(config, null, '  '));
/* eslint-enable no-console */

const fs = require('fs');
const https = require('https');
const http = require('http');
const url = require('url');
const protoo = require('protoo-server');
const mediasoup = require('mediasoup');
const express = require('express');
const bodyParser = require('body-parser');
const { AwaitQueue } = require('awaitqueue');
const Logger = require('./lib/Logger');
const Room = require('./lib/Room');
const interactiveServer = require('./lib/interactiveServer');
const interactiveClient = require('./lib/interactiveClient');
const util = require('util');
const readFile = util.promisify(fs.readFile);

const utils = require('./lib/utils');

const os = require('os');

const logger = new Logger();
const queue = new AwaitQueue();
const rooms = utils.rooms;

let httpsServer;

let expressApp;
let expressAdminApp;
let protooWebSocketServer;

const mediasoupWorkers = [];

let authKey;

run();

async function run()
{
	await interactiveServer();

	if (process.env.INTERACTIVE === 'true' || process.env.INTERACTIVE === '1')
		await interactiveClient();

	await runMediasoupWorkers();
	await createExpressApp();
	await createAdminExpressApp();
	await runHttpsServer();
	try {
		authKey = await readFile(config.authKey, 'utf8');
	} catch (error) {
		logger.error("authKey not set; jwt verification will not work.", error);
	}
	await runProtooWebSocketServer();


	// Log rooms status every X seconds.
	setInterval(() =>
	{
		for (const room of rooms.values())
		{
			room.logStatus();
		}
	}, 900000);
}

async function runMediasoupWorkers()
{
	const { numWorkers } = config.mediasoup;

	logger.info('running %d mediasoup Workers...', numWorkers);

	for (let i = 0; i < numWorkers; ++i)
	{
		const worker = await mediasoup.createWorker(
			{
				logLevel   : config.mediasoup.workerSettings.logLevel,
				logTags    : config.mediasoup.workerSettings.logTags,
				rtcMinPort : Number(config.mediasoup.workerSettings.rtcMinPort),
				rtcMaxPort : Number(config.mediasoup.workerSettings.rtcMaxPort)
			});

		worker.on('died', () =>
		{
			logger.error(
				'mediasoup Worker died, exiting  in 2 seconds... [pid:%d]', worker.pid);

			setTimeout(() => process.exit(1), 2000);
		});

		mediasoupWorkers.push(worker);
		utils.workerLoadMan.set(worker._pid, { peerCnt: 0, roomReqCnt: 0, rooms: new Map() });
	}

	utils.workerLoadMan.runSurvey();

	setInterval(async () => { 
		const startTimestampNs = process.hrtime.bigint();
		utils.workerLoadMan.runSurvey();
		const elapsedMs = Number(process.hrtime.bigint() - startTimestampNs) / 1000000;
		if (elapsedMs > 0.1) { logger.warn('runSurvey() took: %s ms', elapsedMs); }
	}, 5000);
}

async function createExpressApp()
{
	logger.info('creating Express app...');

	expressApp = express();
	expressApp.use(bodyParser.json());

	expressApp.param(
		'roomId', (req, res, next, roomId) =>
		{
			if (!rooms.has(roomId))
			{
				const error = new Error(`room with id "${roomId}" not found`);

				error.status = 404;
				throw error;
			}

			req.room = rooms.get(roomId);

			next();
		});

	/**
	 * Error handler.
	 */
	expressApp.use(
		(error, req, res, next) =>
		{
			if (error)
			{
				logger.warn('Express app %s', String(error));

				error.status = error.status || (error.name === 'TypeError' ? 400 : 500);

				res.statusMessage = error.message;
				res.status(error.status).send(String(error));
			}
			else
			{
				next();
			}
		});
}

async function createAdminExpressApp()
{
	logger.info('creating Admin Express app...');

	expressAdminApp = express();
	expressAdminApp.use(bodyParser.json());

	/**
	 * Temporary deprecated API to emulate Janus endpoint to get CCU by reticulum.
	 */
	expressAdminApp.post(
		'/admin', (req, res) =>
		{
			const sessions = [];

			for (const room in rooms.values()) {
				for (let i = 0; i < room.getCCU(); i++) {
					sessions.push({});
				}
			}

			res.status(200).json({ sessions });
		});

	/**
	 * meta API to report current capacity 
	 */
	expressAdminApp.get(
		'/meta', (req, res) =>
		{
			res.status(200).json({
				cap: utils.workerLoadMan.sum(),
				// ip: process.env.MEDIASOUP_ANNOUNCED_IP
			});
		});

	/**
	 * full report
	 */
	expressAdminApp.get(
		'/report', (req, res) =>
		{
			const report = new Map(utils.workerLoadMan.get());
			report.set('_hostname', os.hostname());
			report.set('_capacity', utils.workerLoadMan.sum());
			res.set({ 'Content-Type': 'application/json' })
				.status(200)
				.send(JSON.stringify(report, utils.stableSortReplacer, 2));
		});
		/**
		 * dump room
		 */
		expressAdminApp.get(
			'/report/rooms/:roomId', (req, res) =>
			{
				const room = rooms.get(req.params.roomId);
				console.log(room)
				res.set({ 'Content-Type': 'application/json' })
					.status(200)
					.send(room);
				});
			/**
			 * dump peer
			 */
			expressAdminApp.get(
				'/report/peers/:peerId', (req, res) =>
				{
					const peerId = req.params.peerId
					let room = {}
					for (const [k,v] of rooms.entries()){
						if (v._protooRoom.hasPeer(peerId)){
							room =v
						}
					}

					const peer = room._protooRoom.getPeer(peerId);
					console.log(peer)
					res.set({ 'Content-Type': 'application/json' })
						.status(200)
						.send(peer._data);
					});

	/**
	 * Error handler.
	 */
	expressAdminApp.use(
		(error, req, res, next) =>
		{
			if (error)
			{
				logger.warn('Express app %s', String(error));

				error.status = error.status || (error.name === 'TypeError' ? 400 : 500);

				res.statusMessage = error.message;
				res.status(error.status).send(String(error));
			}
			else
			{
				next();
			}
		});
}

/**
 * Create a Node.js HTTPS server. It listens in the IP and port given in the
 * configuration file and reuses the Express application as request listener.
 */
async function runHttpsServer()
{
	logger.info('running an HTTPS server...');

	// HTTPS server for the protoo WebSocket server.
	const tls =
	{
		cert : fs.readFileSync(config.https.tls.cert),
		key  : fs.readFileSync(config.https.tls.key)
	};

	httpsServer = https.createServer(tls, expressApp);

	await new Promise((resolve) =>
	{
		httpsServer.listen(
			Number(config.https.listenPort), config.https.listenIp, resolve);
	});

	// TODO remove, alt server needed to spoof janus API.
	logger.info('running an Admin HTTP server...');

	adminHttpServer = http.createServer(expressAdminApp);

	await new Promise((resolve) =>
	{
		adminHttpServer.listen(
			Number(config.adminHttp.listenPort), config.adminHttp.listenIp, resolve);
	});
}


/**
 * Create a protoo WebSocketServer to allow WebSocket connections from browsers.
 */
async function runProtooWebSocketServer()
{
	logger.info('running protoo WebSocketServer...');

	// Create the protoo WebSocket server.
	protooWebSocketServer = new protoo.WebSocketServer(httpsServer,
		{
			maxReceivedFrameSize     : 960000, // 960 KBytes.
			maxReceivedMessageSize   : 960000,
			fragmentOutgoingMessages : true,
			fragmentationThreshold   : 960000
		});

	// Handle connections from clients.
	protooWebSocketServer.on('connectionrequest', (info, accept, reject) =>
	{
		// The client indicates the roomId and peerId in the URL query.
		const u = url.parse(info.request.url, true);
		const roomId = u.query['roomId'];
		const peerId = u.query['peerId'];
		if (!roomId || !peerId)
		{
			reject(400, 'Connection request without roomId and/or peerId');

			return;
		}

		logger.info(
			'protoo connection request [roomId:%s, peerId:%s, address:%s, origin:%s]',
			roomId, peerId, info.socket.remoteAddress, info.origin);
		const roomSize = info.request.headers['x-ret-max-room-size'];
		logger.info('roomId: %s, x-ret-max-room-size: %s', roomId, roomSize);

		// Serialize this code into the queue to avoid that two peers connecting at
		// the same time with the same roomId create two separate rooms with same
		// roomId.
		queue.push(async () =>
		{
			const room = await getOrCreateRoom({ roomId, roomSize });

			// Accept the protoo WebSocket connection.
			const protooWebSocketTransport = accept();

			room.handleProtooConnection({ peerId, protooWebSocketTransport });
		})
			.catch((error) =>
			{
				logger.error('room creation or room joining failed:%o', error);

				reject(error);
			});
	});
}

async function getOrCreateRoom({ roomId, roomSize=0 })
{
	let room = rooms.get(roomId);

	// If the Room does not exist create a new one.
	if (!room)
	{
		logger.info('creating a new Room [roomId:%s]', roomId);

		room = await Room.create({ mediasoupWorkers, roomId, authKey, roomSize });

		rooms.set(roomId, room);
		room.on('close', () => rooms.delete(roomId));
	}

	return room;
}
