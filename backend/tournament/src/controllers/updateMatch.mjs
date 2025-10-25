import {Tournament} from "./classes/Tournament.mjs";
import {tournaments} from "./objects/tournaments.mjs";

function updateMatch(req, res) {
	if (!tournaments.has(req.params.id))
		return res.code(404).send("\"Error: no ongoing tournament with given id\"");
	tournaments.get(req.params.id).update(req.body["winner"]);
	return res.code(204).send();
}

export {updateMatch}