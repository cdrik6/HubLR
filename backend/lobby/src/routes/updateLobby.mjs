import {updateLobby} from "../controllers/updateLobby.mjs"

const updateLobbyOpts = {
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
			required: ["isOngoing"],
			properties: {
				isOngoing: {type: "boolean"}
			}
		},
		response: {
			200: {
				type: "object",
				properties: {
					sessionId: {type: "string"}
				}
			},
			204: {},
			400: {type: "string"},
			401: {type: "string"},
			404: {type: "string"},
			409: {type: "string"},
			500: {type: "string"}
		}
	},
	handler: updateLobby
}

function updateLobbyRoute(fastify, options) {
	fastify.patch("/:id", updateLobbyOpts)
}

export default updateLobbyRoute;