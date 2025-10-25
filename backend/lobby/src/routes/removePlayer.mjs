import {removePlayer} from "../controllers/removePlayer.mjs"

const removePlayerOpts = {
	schema: {
		params: {
			type: "object",
			required: ["id"],
			properties: {
				id: {type: "string"} 
			}
		},
		body: {
			type: "object",
			required: ["player"],
			properties: {
				player: {
					type: "object",
					required: ["id"],
					properties: {
						id: {type: "number", nullable: true},
						alias: {type: "string"}
					}
				}
			}
		},
		response: {
			204: {},
			400: {type: "string"},
			401: {type: "string"},
			404: {type: "string"},
			409: {type: "string"},
			500: {type: "string"}
		}
	},
	handler: removePlayer
}

function removePlayerRoute(fastify, options) {
	fastify.delete("/:id/player", removePlayerOpts);
}

export default removePlayerRoute;