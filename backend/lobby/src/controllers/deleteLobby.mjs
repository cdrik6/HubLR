import {lobbies} from "./objects/lobbies.mjs"

export async function isAuthorized(req, lobby) {
	const resAuth = await fetch("http://auth:443/me", {method: "GET", headers: req.headers});
	if (resAuth.status == 401)
		return false;
	if (!resAuth.ok)
		throw new Error("Communication with auth microservice failed");
	const bodyAuth = await resAuth.json();
	return (lobby.host.id == bodyAuth.id);
}

async function deleteLobby(req, res) {
	if (!lobbies.has(req.params.id))
		return res.code(404).send("\"Error: no lobby with given id\"");

	try {
		if (!(await isAuthorized(req, lobbies.get(req.params.id))))
			return res.code(401).send("\"Error: user is not authorized to access required information")
	}
	catch (e) {
		console.error(`Error: ${e}`);
		return res.code(500).send("\"Error: server encountered issue while completing request\"");
	}
	const lobby = lobbies.get(req.params.id);
	lobby.deleteSockets();
	if (lobby.isOngoing)
		await lobby.stop();
	lobbies.delete(req.params.id);
	return res.code(204).send();
}

export {deleteLobby}