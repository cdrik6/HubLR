export async function sendRequest(req, reply) {
	const receiver_id = req.params.id;
	const response = await fetch(`http://users:443/friends/request`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json; charset=UTF-8',
		},
		body: JSON.stringify({
			'sender_id': req.user.id,
			'receiver_id': receiver_id,
		}),
	});

	const data = await response.json();
	return (reply.code(response.status).send(data));
}

export async function getFriends(req, reply) {
	if (!req.user || !req.user.id) {
		return reply.code(401).send({ error: 'Invalid user token' });
	}
	console.log(req.user);
	const userId = req.user.id;
	console.log("userId in getFriends", userId);
	const response = await fetch(`http://users:443/friends?id=${userId}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json; charset=UTF-8',
		}});
	// if (response.ok)
	// {
	// 	const friends = {};
	// 	const friendId = await response.json();


	// }
	const data = await response.json();
	return (reply.code(response.status).send(data));
}

export async function getRequests(req, reply) {
	if (!req.user || !req.user.id) {
		return reply.code(401).send({ error: 'Invalid user token' });
	}
	console.log(req.user);
	const userId = req.user.id;
	console.log("userId in getFriends", userId);
	const response = await fetch(`http://users:443/friends/request?id=${userId}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json; charset=UTF-8',
		}});
	const data = await response.json();
	return (reply.code(response.status).send(data));
}

export async function getFriendStatus(req, reply) {
	const sender_id = req.user.id;
	const receiver_id = req.params.id;
	console.log("sender_id:", sender_id);
	console.log("receiver_id:", receiver_id);
	const response = await fetch(`http://users:443/friends/requestStatus?id=${sender_id}&receiver_id=${receiver_id}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json; charset=UTF-8',
		}});
	console.log("status:", response.status);
	const data = await response.json();
	return (reply.code(response.status).send(data));
}

export async function deleteRequest(req, reply) {
	const sender_id = req.user.id;
	const receiver_id = req.params.id;
	console.log("sender_id", sender_id);
	console.log("receiver_id", receiver_id);
	
	const response = await fetch(`http://users:443/friends/request?sender_id=${sender_id}&receiver_id=${receiver_id}`, { method: 'DELETE' });
	
	const data = await response.json();
	return (reply.code(response.status).send(data));
}
