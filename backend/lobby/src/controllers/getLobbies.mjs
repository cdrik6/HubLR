import {lobbies} from "./objects/lobbies.mjs"

export async function isAuthorized(req) {
	const resAuth = await fetch("http://auth:443/me", {method: "GET", headers: req.headers});
	if (resAuth.status == 401)
		return false;
	if (!resAuth.ok)
		throw new Error("Communication with auth microservice failed");
	return true;	
}

async function getLobbies(req, res) {
	try {
		if (!(await isAuthorized(req)))
			return res.code(401).send("\"Error: user is not authorized to access required information")
	}
	catch (e) {
		console.error(`Error: ${e}`);
		return res.code(500).send("\"Error: server encountered issue while completing request\"");
	}
	const lobbiesArray = Array.from(lobbies, a => {
		return {
			id: a[1].id,
			host: a[1].host,
			size: a[1].size,
			players: a[1].players,
			settings: a[1].settings,
			isOngoing: a[1].isOngoing
		}
	});
	return res.code(200).send({lobbies: lobbiesArray});
}

export {getLobbies}