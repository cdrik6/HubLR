import Fastify from 'fastify';
import createTournamentRoute from './routes/createTournament.mjs';
import getTournamentRoute from './routes/getTournament.mjs';
import getMatchRoute from './routes/getMatch.mjs'
import getWinnerRoute from './routes/getWinner.mjs'
import updateMatchRoute from './routes/updateMatch.mjs';
import deleteTournamentRoute from './routes/deleteTournament.mjs';
import resetTournamentRoute from './routes/resetTournament.mjs';

const fastify = Fastify({logger:false});
const PORT = 443;
const HOST = '0.0.0.0';

fastify.register(createTournamentRoute);
fastify.register(getTournamentRoute);
fastify.register(getMatchRoute);
fastify.register(getWinnerRoute);
fastify.register(updateMatchRoute);
fastify.register(deleteTournamentRoute);
fastify.register(resetTournamentRoute);

async function start() {
	try {
		await fastify.listen({port: PORT, host: HOST});
	} catch (e) {
		fastify.log.error(e);
		process.exit(1);
	}
}

start();
