import {updateMatch} from "../controllers/updateMatch.mjs"

const updateMatchOpts = {
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
			required: ["winner"],
			properties: {
				winner: {
					type: "object",
					required: ["alias"],
					properties: {
						id: {type: "number"},
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
			500: {type: "string"}
		}
	},
	handler: updateMatch
}

function updateMatchRoute(fastify, options) {
	fastify.patch("/:id/match", updateMatchOpts)
}

export default updateMatchRoute;