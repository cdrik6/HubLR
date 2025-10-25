import {Lobby} from "./classes/Lobby.mjs";
import {lobbies} from "./objects/lobbies.mjs"
import {MAXPLAYERS} from "./objects/maxPlayers.mjs";
import {MINPLAYERS} from "./objects/minPlayers.mjs";

async function isAuthorized(req) {
	const resAuth = await fetch("http://auth:443/me", {method: "GET", headers: req.headers});
	if (resAuth.status == 401)
		return false;
	if (!resAuth.ok)
		throw new Error("Communication with auth microservice failed");
	const bodyAuth = await resAuth.json();
	return (req.body.host.id == bodyAuth.id)
}

function isPlayerInLobby(lobbies, player) {
	for (const [key, l] of lobbies) {
		if (l.players.map(p => p.id).includes(player.id))
			return true;
	}
	return false;
}

async function createLobby(req, res) {
	try {
		if (!(await isAuthorized(req)))
			return res.code(401).send("\"Error: user is not authorized to access required information")
	}
	catch (e) {
		console.error(`Error: ${e}`);
		return res.code(500).send("\"Error: server encountered issue while completing request\"");
	}

	if ((req.body.settings.type == "multi" && req.body.size != 4)
			|| (req.body.settings.type == "1v1" && req.body.size != 2)
			|| (req.body["size"] > MAXPLAYERS || req.body["size"] < MINPLAYERS))
		return res.code(400).send("\"Error: unacceptable lobby size\"");
	if (isPlayerInLobby(lobbies, req.body["host"]))
		return res.code(409).send("\"Error: host is already in a lobby\"");
	let id = crypto.randomUUID();
	lobbies.set(id, new Lobby(id, req.body["host"], req.body["size"], req.body["settings"]));
	return res.code(201).send({lobbyId: id});
}

export {isPlayerInLobby}
export {createLobby}