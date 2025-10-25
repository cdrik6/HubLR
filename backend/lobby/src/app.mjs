import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';

import setWebsocketRoute from './routes/setWebsocket.mjs';
import createLobbyRoute from './routes/createLobby.mjs'
import getLobbiesRoute from './routes/getLobbies.mjs'
import getLobbyRoute from './routes/getLobby.mjs'
import updateLobbyRoute from './routes/updateLobby.mjs';
import deleteLobbyRoute from './routes/deleteLobby.mjs';
import addPlayerRoute from './routes/addPlayer.mjs'
import removePlayerRoute from './routes/removePlayer.mjs'

const fastify = Fastify({logger:false});
const PORT = 443;
const HOST = '0.0.0.0';

fastify.register(fastifyWebsocket);

fastify.register(setWebsocketRoute);
fastify.register(createLobbyRoute);
fastify.register(getLobbiesRoute);
fastify.register(getLobbyRoute);
fastify.register(updateLobbyRoute);
fastify.register(deleteLobbyRoute);
fastify.register(addPlayerRoute);
fastify.register(removePlayerRoute);

async function start() {
	try {
		await fastify.listen({port: PORT, host: HOST});
	} catch (e) {
		fastify.log.error(e);
		process.exit(1);
	}
}

start();
