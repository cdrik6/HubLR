import {createTournament} from "../controllers/createTournament.mjs"

import {MAXPLAYERS} from "../controllers/objects/maxPlayers.mjs"
import {MINPLAYERS} from "../controllers/objects/minPlayers.mjs"

const createTournamentOpts = {
	schema: {
		body: {
			type: "object",
			required: ["players"],
			properties: {
				players: {
					type: "array",
					minItems: MINPLAYERS,
					maxItems: MAXPLAYERS,
					items: {
						type: "object",
						required: ["alias"],
						properties: {
							id: {type: "number"},
							alias: {type: "string"}
						}
					}
				}
			}
		},
		response: {
			201: {
				type: "object",
				properties: {
					tournamentId: {type: "string"}
				}
			},
			409: {type: "string"},
			500: {type: "string"}
		}
	},
	handler: createTournament
}

function createTournamentRoute(fastify, options) {
	fastify.post("/", createTournamentOpts)
}

export default createTournamentRoute;