import {deleteTournament} from "../controllers/deleteTournament.mjs"

const deleteTournamentOpts = {
	schema: {
		params: {
			type: "object",
			required: ["id"],
			properties: {
				id: {type: "string"} 
			}
		},
		response: {
			204: {},
			400: {type: "string"},
			404: {type: "string"},
			500: {type: "string"}
		}
	},
	handler: deleteTournament
}

function deleteTournamentRoute(fastify, options) {
	fastify.delete("/:id", deleteTournamentOpts)
}

export default deleteTournamentRoute;