const Logger = require('./Logger');

const logger = new Logger('utils');

const rooms = new Map();

/**
 * ccu threshold for creating new router
 */
let ccuThreshold = process.env.CCU_THRESHOLD?Number(process.env.CCU_THRESHOLD):50;
logger.info("ccuThreshold: ", ccuThreshold)

const workerLoadMan = (function() {
	/**
	 * map<pid: {
	 *   peerCnt: int,
	 *   roomReqCnt: int,
	 *   rooms: map<roomId: roomSize>
	 * }>
	 */
	let _workerLoadMap = new Map(); //TODO: maintenance job for zombie rooms necessary?

	function resetWorkerLoadMap(){
		for (let [pid, workerMeta] of _workerLoadMap.entries()){
			workerMeta.peerCnt = 0;
			workerMeta.roomReqCnt = 0;
			workerMeta.rooms = new Map();
		}
	}

	return {
		set: function(pid, workerMeta){
			_workerLoadMap.set(pid, workerMeta);
		},

		/**
		 * returns _workerLoadMap
		 */
		get: function(){
			return _workerLoadMap;
		},

		/**
		 *
		 * @param {*} pid (string) worker._pid
		 * @param {*} amt (int) amount to add, default=1
		 */
		addPeer: function(pid, amt=1){
			const currentWorkerMeta = _workerLoadMap.get(pid);

			_workerLoadMap.set(pid, {
				peerCnt: currentWorkerMeta.peerCnt + amt,
				roomReqCnt: currentWorkerMeta.roomReqCnt,
				rooms: currentWorkerMeta.rooms
			});
		},

		/**
		 * @param {*} pid (string) worker._pid
		 * @param {*} amt (int) amount to add, default=9999999
		 */
		addRoomReq: function(pid, roomId, amt=9999999){
			// logger.info("addRoomReq, pid: %s", pid)
			//roomReqCnt
			if (!_workerLoadMap.has(pid)) {
				logger.error("addRoomReq -- unexpected worker pid: %s", pid);
				_workerLoadMap.set(pid, { peerCnt: 0, roomReqCnt: 0, rooms: new Map() });
			}
			const workerMeta = _workerLoadMap.get(pid);
			workerMeta.roomReqCnt += amt;

			//rooms
			if (!workerMeta.rooms.has(roomId)) {
				workerMeta.rooms.set(roomId, amt);
			} else {
				const newAmt = workerMeta.rooms.get(roomId) + amt;
				workerMeta.rooms.set(roomId, newAmt);
			}
		},

		getLeastLoadedWorkerIdx: function(mediasoupWorkers, roomId, roomReq){
			let minCnt_room = Number.MAX_VALUE;
			let minCnt_peer = Number.MAX_VALUE;
			let minWorkerIdx_room = -1;
			let minWorkerIdx_peer = -1;

			for (let [pid, workerMeta] of _workerLoadMap.entries()){
				const idx = mediasoupWorkers.map((worker) => worker._pid).indexOf(pid);
				if (idx === -1){ continue; }

				// ignore the amount reserved for requesting room
				let roomReqCnt = workerMeta.rooms.has(roomId) ? workerMeta.roomReqCnt - roomReq : workerMeta.roomReqCnt;

				logger.info(
					"workerMeta.rooms: %s; roomId: %s; has?: %s, roomReqCnt: %s",
					workerMeta.rooms, roomId, workerMeta.rooms.has(roomId), roomReqCnt);

				if (roomReqCnt < minCnt_room){
					minCnt_room = roomReqCnt;
					minWorkerIdx_room = idx;
				}

				if (workerMeta.peerCnt < minCnt_peer){
					minCnt_peer = workerMeta.peerCnt;
					minWorkerIdx_peer = idx;
				}
			}

			logger.info(
				"minCnt_room: %s, workerIdx_room: %s, minCnt_peer: %s, workerIdx_peer: %s",
				minCnt_room, minWorkerIdx_room, minCnt_peer, minWorkerIdx_peer
			);		

			return minCnt_room > minCnt_peer ? [minWorkerIdx_room, minCnt_room] : [minWorkerIdx_peer, minCnt_peer];
		},

		sum: function(){
			let result = 0;
			for (let [pid, workerMeta] of _workerLoadMap.entries()){
				 result += workerMeta.roomReqCnt > workerMeta.peerCnt ? workerMeta.roomReqCnt : workerMeta.peerCnt;
			}
			return result;
		},

		runSurvey: function(){
			resetWorkerLoadMap();

			for (let [id, room] of rooms.entries()){
				for (let peer of room.getPeers()){
					this.addPeer(peer.data.workerPid);
				}

				for (let [worker, routerId] of room._inUseMediasoupWorkers){
					this.addRoomReq(worker._pid, room._roomId, room._roomReq);
				}
			}
			// logger.info("runSurvey -- this._workerLoadMap: %s", JSON.stringify(this._workerLoadMap, stableSortReplacer, 2));
		},
	};
})();

const stableSortReplacer = (key, value) => {
	if (value instanceof Map) {
		const keysToObj = (obj, mapKey) => {
			obj[mapKey] = value.get(mapKey);
			return obj;
		};
		return [...value.keys()].sort().reduce(keysToObj, {});
	} else if (value instanceof Set) {
		return [...value].sort();
	}
	return value;
};

function serializer(replacer, cycleReplacer) {
	var stack = [], keys = []
  
	if (cycleReplacer == null) cycleReplacer = function(key, value) {
	  if (stack[0] === value) return "[Circular ~]"
	  return "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]"
	}
  
	return function(key, value) {
	  if (stack.length > 0) {
		var thisPos = stack.indexOf(this)
		~thisPos ? stack.splice(thisPos + 1) : stack.push(this)
		~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key)
		if (~stack.indexOf(value)) value = cycleReplacer.call(this, key, value)
	  }
	  else stack.push(value)
  
	  return replacer == null ? value : replacer.call(this, key, value)
	}
  }

module.exports = {
	ccuThreshold: ccuThreshold,
	workerLoadMan: workerLoadMan,
	rooms: rooms,
	stableSortReplacer: stableSortReplacer,
	serializer: serializer
};
