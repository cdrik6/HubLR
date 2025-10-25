import {Lobby} from "./classes/Lobby.mjs"
import {lobbies} from "./objects/lobbies.mjs"

async function getUserId(req) {
	const resAuth = await fetch("http://auth:443/me", {method: "GET", headers: {cookie: req.headers.cookie}});
	if (!resAuth.ok)
		throw new Error("Communication with auth microservice failed");
	const bodyAuth = await resAuth.json();
	return bodyAuth.id;
}

async function setWebsocket(socket, req) {
	socket.on('message', message => {
		console.log("we got message");
		if (message == "ping") {
			socket.send("pong");
		}
	})

	if (!lobbies.has(req.params.id))
		return res.code(404).send("\"Error: no lobby with given id\"");
	const lobby = lobbies.get(req.params.id);

	let userId;
	try {
		userId = await getUserId(req)
	}
	catch (e) {
		console.error(`Error: ${e}`);
		return res.code(500).send("\"Error: server encountered issue while completing request\"");
	}

	lobby.setSocket(userId, socket);
}

export {setWebsocket}
