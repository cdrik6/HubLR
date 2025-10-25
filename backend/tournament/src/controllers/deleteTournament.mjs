import {Tournament} from "./classes/Tournament.mjs";
import {tournaments} from "./objects/tournaments.mjs";

function deleteTournament(req, res) {
	if (!tournaments.has(req.params.id))
		return res.code(404).send("\"Error: no tournament with given id\"");
	tournaments.delete(req.params.id);
	return res.code(204).send();
}

export {deleteTournament}