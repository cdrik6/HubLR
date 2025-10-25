import {getLobby} from "../controllers/getLobby.mjs"
import {MAXPLAYERS} from "../controllers/objects/maxPlayers.mjs"

const getLobbyOpts = {
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
					host: {
						type: "object",
						required: ["id", "alias"],
						properties: {
							id: {type: "number", nullable: true},
							alias: {type: "string"}
						}
					},
					size: {type: "number"},
					players: {
						type: "array",
						minItems: 1,
						maxItems: MAXPLAYERS,
						items: {
							type: "object",
							required: ["id", "alias"],
							properties: {
								id: {type: "number", nullable: true},
								alias: {type: "string"}
							}
						}
					},
					settings: {
						type: "object",
						required: ["type", "options"],
						properties: {
							type: {type: "string"}, //1v1 - multi - tournament
							options: {
								type: "object",
								required: ["speedy" , "paddy", "wally", "mirry"],
								properties: {
									speedy: {type: "boolean"},
									paddy: {type: "boolean"},
									wally: {type: "boolean"},
									mirry: {type: "boolean"}
								}
							}
						}
					},
					isOngoing: {type: "boolean"}
				}
			},
			400: {type: "string"},
			401: {type: "string"},			400: {type: "string"},

			404: {type: "string"},
			500: {type: "string"}
		}
	},
	handler: getLobby
}

function getLobbyRoute(fastify, options) {
	fastify.get("/:id", getLobbyOpts)
}

export default getLobbyRoute;