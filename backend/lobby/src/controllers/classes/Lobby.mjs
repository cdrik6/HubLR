export class Lobby {
	#id;
	#host;
	#size;
	#players = [];
	#settings;
	#isOngoing = false;
	#sessionId = null;
	#sockets = new Map();

	constructor(id, host, size, settings) {
		this.#id = id;
		this.#host = host;
		this.#size = size;
		this.#settings = settings;
		this.#players.push(host);
	}

	get id() {return this.#id}
	get host() {return this.#host}
	get size() {return this.#size}
	get players() {return this.#players}
	get settings() {return this.#settings}
	get isOngoing() {return this.#isOngoing}
	get sessionId() {return this.#sessionId}

	add(player) {
		this.#players.push(player);
	}

	#deleteSocket(userId) {
		this.#sockets.get(userId).close();
		this.#sockets.delete(userId);
	}

	deleteSockets() {
		for (let [userId, socket] of this.#sockets) {
			this.#deleteSocket(userId);
		}
	}

	remove(player) {
		this.#deleteSocket(player.id);
		this.#players.splice(this.#players.map(e => e.id).indexOf(player.id), 1);
	}

	setSocket(userId, socket) {
		this.#sockets.set(userId, socket);
	}
	
	#sendSessionId() {
		for (let [userId, socket] of this.#sockets) {
			socket.send(JSON.stringify({sessionId: this.#sessionId}))
		}
	}

	sendReload() {
		for (let [userId, socket] of this.#sockets) {
			socket.send(JSON.stringify({reload: true}))
		}
	}

	async #startTournament() {
		const res = await fetch(`http://tournament:443/`, {
			method: "POST",
			headers: {
				"content-type":"application/json"
			},
			body: JSON.stringify({
				players: this.#players
			})
		})
		if (!res.ok)
			throw new Error("Communication with tournament microservice failed");
		const body = await res.json();
		this.#sessionId = body.tournamentId;
	}

	async start() {
		if (this.#settings.type == "tournament")
			await this.#startTournament();
		this.#isOngoing = true;
		this.#sendSessionId();
	}

	async #stopTournament() {
		const res = await fetch(`http://tournament:443/${this.#sessionId}`, {method: "DELETE"});
		if (!res.ok)
			throw new Error("Communication with tournament microservice failed");
	}

	async stop() {
		if (this.#settings.type == "tournament")
			await this.#stopTournament();
		this.#sessionId = null;
		this.#isOngoing = false;
	}

}