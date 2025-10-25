import {Tournament} from "./classes/Tournament.mjs";
import {tournaments} from "./objects/tournaments.mjs";
import {isAuthorized} from "./getTournament.mjs";

async function resetTournament(req, res) {
	if (!tournaments.has(req.params.id))
		return res.code(404).send("\"Error: no tournament with given id\"");
	try {
		if (!(await isAuthorized(req, tournaments.get(req.params.id))))
			return res.code(401).send("\"Error: user is not authorized to access required information")
	}
	catch (e) {
		console.error(`Error: ${e}`);
		return res.code(500).send("\"Error: server encountered issue while completing request\"");
	}
	tournaments.get(req.params.id).reset();
	return res.code(204).send();
}

export {resetTournament}