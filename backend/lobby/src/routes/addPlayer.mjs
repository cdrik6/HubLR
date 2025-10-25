import {addPlayer} from "../controllers/addPlayer.mjs"

const addPlayerOpts = {
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
					required: ["id", "alias"],
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
	handler: addPlayer
}

function addPlayerRoute(fastify, options) {
	fastify.post("/:id/player", addPlayerOpts);
}

export default addPlayerRoute;