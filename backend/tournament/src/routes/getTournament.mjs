import { type } from "os";
import {getTournament} from "../controllers/getTournament.mjs"

const getTournamentOpts = {
	schema: {
		params: {
			type: "object",
			required: ["id"],
			properties: {
				id: {type: "string"} 
			}
		},
		response: {
			200: {
				type: "object",
				properties: {
					id: {type: "string"},
					size: {type: "number"},
					players: {
						type: "array",
						items: {
							type: "object",
							properties: {
								id: {type: "number"},
								alias: {type: "string"}
							}
						}
					},
					matches: {type: "array"},
					current: {type: "array", nullable: true},
					winner: {
						type: "object",
						nullable: true,
						properties: {
							id: {type: "number"},
							alias: {type: "string"}
						}
					}
				}
			},
			400: {type: "string"},
			401: {type: "string"},
			404: {type: "string"},
			500: {type: "string"}
		}
	},
	handler: getTournament
}

function getTournamentRoute(fastify, options) {
	fastify.get("/:id", getTournamentOpts)
}

export default getTournamentRoute;