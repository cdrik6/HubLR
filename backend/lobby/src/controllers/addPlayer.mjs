import {Lobby} from "./classes/Lobby.mjs"
import {lobbies} from "./objects/lobbies.mjs"
import {isPlayerInLobby} from "./createLobby.mjs";

export async function isAuthorized(req) {
	const resAuth = await fetch("http://auth:443/me", {method: "GET", headers: req.headers});
	if (resAuth.status == 401)
		return false;
	if (!resAuth.ok)
		throw new Error("Communication with auth microservice failed");
	const bodyAuth = await resAuth.json();
	return (bodyAuth.id == req.body.player.id)
}

async function addPlayer(req, res) {
	if (!lobbies.has(req.params.id))
		return res.code(404).send("\"Error: no lobby with given id\"");
	const lobby = lobbies.get(req.params.id);

	try {
		if (!(await isAuthorized(req)))
			return res.code(401).send("\"Error: user is not authorized to access required information")
	}
	catch (e) {
		console.error(`Error: ${e}`);
		return res.code(500).send("\"Error: server encountered issue while completing request\"");
	}

	if (lobby.isOngoing)
		return res.code(409).send("\"Error: lobby has an ongoing gaming session\"");
	//
	if (lobby.players.map(p => p.id).includes(req.body.player.id))
		{ lobby.sendReload(); return res.code(204).send(); }
		//return res.code(409).send("\"Error: player is already in the lobby\"");	
	if (isPlayerInLobby(lobbies, req.body.player))
		{ lobby.sendReload(); return res.code(204).send(); }
		//return res.code(409).send("\"Error: player is already in a lobby\"");	
	if (lobby.players.length == lobby.size)
		{ lobby.sendReload(); return res.code(204).send(); }
		//return res.code(409).send("\"Error: lobby is full\"");
	//
	lobby.add(req.body.player);
	lobby.sendReload();
	res.code(204).send();
}

export {addPlayer}