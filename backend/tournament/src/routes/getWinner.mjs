import {getWinner} from "../controllers/getWinner.mjs"

const getWinnerOpts = {
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
					winner: {
						type: "object",
						nullable: true,
						required: ["alias"],
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
	handler: getWinner
}

function getWinnerRoute(fastify, options) {
	fastify.get("/:id/winner", getWinnerOpts)
}

export default getWinnerRoute;