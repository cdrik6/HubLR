import {Tournament} from "./classes/Tournament.mjs";
import {tournaments} from "./objects/tournaments.mjs";

function arePlayersEqual(p1, p2) {
	if (p1.id)
		return p1.id == p2.id;
	return false;
}

function isPlayerInTournament(tournaments, players) {
	for (const player of players) {
		if (!player.id)
			continue;
		for (const [key, t] of tournaments) {
			for (const p of t.players) {
				if (arePlayersEqual(player, p)) {
					return true;
				}
			}
		}
	}
	return false;
}

function createTournament(req, res) {
	if (isPlayerInTournament(tournaments, req.body["players"]))
		return res.code(409).send("\"Error: one of the players is already in an ongoing tournament\"");
	let id = crypto.randomUUID()
	tournaments.set(id, new Tournament(id, req.body["players"]));
	
	return res.code(201).send({tournamentId: id});
}

export {createTournament}