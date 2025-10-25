import {tournaments} from "./objects/tournaments.mjs";

export async function isAuthorized(req, tournament) {
	const resAuth = await fetch("http://auth:443/me", {method: "GET", headers: req.headers});
	if (resAuth.status == 401)
		return true;
	if (!resAuth.ok) 
		throw new Error("Communication with auth microservice failed");
	const bodyAuth = await resAuth.json();
	for (let p of tournament.players) {
		if (p.id && p.id == bodyAuth.id)
			return true;
	}
	// Amend here to check with Elia
	for (let p of tournament.players) {
		if (p.id)
			return false;
	}
	//
	return true;
}

async function getTournament(req, res) {

	if (!tournaments.has(req.params.id))
		return res.code(404).send("\"Error: no ongoing tournament with given id\"");
	const tournament = tournaments.get(req.params.id);
	try {
		if (!(await isAuthorized(req, tournament)))
			return res.code(401).send("\"Error: user is not authorized to access required information")
	}
	catch (e) {
		console.error(`Error: ${e}`);
		return res.code(500).send("\"Error: server encountered issue while completing request\"");
	}
	return res.code(200).send({
		id: tournament.id,
		size: tournament.size,
		players: tournament.players,
		matches: tournament.matches,
		current: tournament.current,
		winner: tournament.winner
	});
}

export {getTournament}