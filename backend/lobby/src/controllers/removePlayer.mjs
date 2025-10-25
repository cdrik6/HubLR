import {lobbies} from "./objects/lobbies.mjs"
import {isAuthorized} from "./addPlayer.mjs";

async function removePlayer(req, res) {
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

	if (!(lobby.players.map(p => p.id).includes(req.body.player.id)))
		return res.code(409).send("\"Error: player isn't part of lobby\"");
	if (req.body.player.id == lobby.host.id)
		return res.code(409).send("\"Error: cannot remove host from lobby\"");
	lobby.remove(req.body.player);
	if (!lobby.isOngoing)
		lobby.sendReload();
	res.code(204).send();
}

export {removePlayer}