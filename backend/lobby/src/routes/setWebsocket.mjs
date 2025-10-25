import {setWebsocket} from "../controllers/setWebsocket.mjs"

const setWebsocketOpts = {
	schema: {
		params: {
			type: "object",
			required: ["id"],
			properties: {
				id: {type: "string"} 
			}
		}
	},
	websocket: true,
	handler: setWebsocket
}

function setWebsocketRoute(fastify, options) {
	fastify.get("/ws/:id", setWebsocketOpts);
}

export default setWebsocketRoute;