import {getLobbies} from "../controllers/getLobbies.mjs"

const getLobbiesOpts = {
	schema: {
		response: {
			200: {
				type: "object",
				properties: {
					lobbies: {type: "array"}
				}
			},
			401: {type: "string"},
			500: {type: "string"}
		}
	},
	handler: getLobbies
}

function getLobbiesRoute(fastify, options) {
	fastify.get("/", getLobbiesOpts);
}

export default getLobbiesRoute;