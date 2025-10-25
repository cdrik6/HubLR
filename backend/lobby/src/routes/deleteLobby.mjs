import {deleteLobby} from "../controllers/deleteLobby.mjs";

const deleteLobbyOpts = {
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
			401: {type: "string"},
			404: {type: "string"},
			500: {type: "string"}
		}
	},
	handler: deleteLobby
}

function deleteLobbyRoute(fastify, options) {
	fastify.delete("/:id", deleteLobbyOpts)
}

export default deleteLobbyRoute;