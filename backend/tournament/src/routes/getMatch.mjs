import {getMatch} from "../controllers/getMatch.mjs"

const getMatchOpts = {
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
					players: {
						type: "array",
						nullable: true,
						minItems: 2,
						maxItems: 2,
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
			400: {type: "string"},
			401: {type: "string"},
			404: {type: "string"},
			500: {type: "string"}
		}
	},
	handler: getMatch
}

function getMatchRoute(fastify, options) {
	fastify.get("/:id/match", getMatchOpts)
}

export default getMatchRoute;