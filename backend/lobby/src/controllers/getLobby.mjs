import {lobbies} from "./objects/lobbies.mjs"
import {isAuthorized} from "./getLobbies.mjs";

async function getLobby(req, res) {
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

	let info = {
		id: lobby.id,
		host: lobby.host,
		size: lobby.size,
		players: lobby.players,
		settings: lobby.settings,
		isOngoing: lobby.isOngoing
	};
	if (lobby.isOngoing)
		info.sessionId = lobby.sessionId;
	res.code(200).send(info);
}

export {getLobby}