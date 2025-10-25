import {createLobby} from "../controllers/createLobby.mjs"

const createLobbyOpts = {
	schema: {
		body: {
			type: "object",
			required: ["host", "size", "settings"],
			properties: {
				size: {type: "number"},
				host: {
					type: "object",
					required: ["id", "alias"],
					properties: {
						id: {type: "number", nullable: true},
						alias: {type: "string"}
					}
				},
				settings: {
					type: "object",
					required: ["type", "options"],
					properties: {
						type: {
							type: "string",
							pattern: "^(1v1|tournament|multi)$"
						},
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
				}
			}
		},
		response: {
			201: {
				type: "object",
				properties: {
					lobbyId: {type: "string"}
				}
			},
			409: {type: "string"},
			400: {type: "string"},
			401: {type: "string"},
			500: {type: "string"},
		}
	},
	handler: createLobby
}

function createLobbyRoute(fastify, options) {
	fastify.post("/", createLobbyOpts);
}

export default createLobbyRoute;