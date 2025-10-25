import {lobbies} from "./objects/lobbies.mjs"
import {Lobby} from "./classes/Lobby.mjs"
import {isAuthorized} from "./deleteLobby.mjs";

async function startLobby(req, res, lobby) {
	if (lobby.players.length != lobby.size)
		return res.code(409).send("\"Error: lobby lacks players\"");
	try {
		await lobby.start();
		return res.code(200).send({sessionId: lobby.sessionId});
	} catch (e) {
		console.error(`Error: ${e}`);
		return res.code(500).send("\"Error: server encountered issue while completing request\"");
	}
}

async function stopLobby(req, res, lobby) {
	try {
		await lobby.stop();
		return res.code(204).send();
	} catch (e) {
		console.error(`Error: ${e}`);
		return res.code(500).send("\"Error: server encountered issue while completing request\"");
	}
}

async function updateLobby(req, res) {
	if (!lobbies.has(req.params.id))
		return res.code(404).send("\"Error: no lobby with given id\"");
	const lobby = lobbies.get(req.params.id);

	try {
		if (!(await isAuthorized(req, lobbies.get(req.params.id))))
			return res.code(401).send("\"Error: user is not authorized to access required information")
	}
	catch (e) {
		console.error(`Error: ${e}`);
		return res.code(500).send("\"Error: server encountered issue while completing request\"");
	}

	if (lobby.isOngoing == req.body.isOngoing)
		return res.code(409).send("\"Error: lobby is already in requested state\"");
	if (req.body.isOngoing)
		return await startLobby(req, res, lobby);
	return await stopLobby(req, res, lobby);
}

export {updateLobby}