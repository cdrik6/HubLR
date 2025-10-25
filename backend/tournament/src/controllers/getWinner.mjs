import {Tournament} from "./classes/Tournament.mjs";
import {tournaments} from "./objects/tournaments.mjs";
import {isAuthorized} from "./getTournament.mjs";

async function getWinner(req, res) {
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
	return res.code(200).send({winner: tournament.winner});
}

export {getWinner}