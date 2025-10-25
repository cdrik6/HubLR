import { Game } from '../Game.mjs'
import { helloSchema, initSchema, startSchema, paddlesSchema, stateSchema, winnerSchema } from './apiSchema.mjs'
// const apigamesById = new Map();
// let apiId = 0;
import { getId, getMapId } from '../server.mjs'


export default async function pongRoutes(fast, options)
{	
	fast.get('/hello', { schema: helloSchema }, async (request, reply) => {		
		try {
			reply.code(200).send({ message: 'Hello from Pong API!' });
		}
		catch (err)	{
			console.error(err);
			reply.code(500).send({ error: 'Getting hello from pong API failed'});
		}
	});
	
	fast.post('/init', { schema: initSchema }, async (request, reply) => {
		const id = getId();
		try {
			//if (apigamesById.size <= 100)
			if (getMapId().size <= 100)
			{				
				const game = new Game(id);
				// apigamesById.set(id, game);
				getMapId().set(id, game);
				game.ready = 1;
				game.mode = 2;
				// id++;
				reply.code(201).send({ id: game.id, bR: 1/40, pH: 1/5, pW: 3/80 });
			}
			else 
				reply.code(429).send({ error: 'Max number of games reached' });	
		}
		catch (err)	{
			console.error(err);
			reply.code(500).send({ error: 'Initialization of a pong game failed' + id});
		}
	});

	fast.patch('/:id/start', { schema: startSchema }, async (request, reply) => {			
		try {
			const id = request.params.id; 
			const { startGame } = request.body;
			// const game = apigamesById.get(Number(id));
			const game = getMapId().get(Number(id));
			if (!game)
				return (reply.code(404).send({ error: 'Game not found' }));
			if (startGame === true && game.startGame === false && game.gameState.winner === "")
			{
				game.start(startGame);
				// game.intervalId = setInterval( () => { game.play();	}, game.fq);
				reply.code(200).send({ message: "started" });
			}
			else if (startGame === false && game.startGame === true)
			{		
				game.start(startGame);
				// clearInterval(game.intervalId);
				// game.intervalId = null;	
				if (game.gameState.winner === "")			
					reply.code(200).send({ message: "paused" });
				else			
					reply.code(200).send({ message: "Game Over" });			
			}
			else			
				reply.code(200).send({ message: "Already started/paused" });
		}
		catch (err)	{
			console.error(err);
			reply.code(500).send({ error: 'Starting a pong game failed'});
		}
	});
	
	fast.patch('/:id/paddles', { schema: paddlesSchema }, async (request, reply) => {
		try {
			const id = request.params.id;
			const { p1, p2 } = request.body;			
			// const game = apigamesById.get(Number(id));
			const game = getMapId().get(Number(id));
			if (!game)
				return (reply.code(404).send({ error: 'Game not found' }));				
			game.paddlesY(p1, p2);
			reply.code(200).send({ success: true, id: Number(id) });
		}
		catch (err)	{
			console.error(err);
			reply.code(500).send({ error: 'Updating paddles of a pong game failed'});
		}
	});	
	
	fast.get('/:id/state', { schema: stateSchema }, async (request, reply) => {
		try {
			const id = request.params.id;
			// const game = apigamesById.get(Number(id));
			const game = getMapId().get(Number(id));
			if (!game)			
				return (reply.code(404).send({ error: 'Game not found' }));
			reply.code(200).send(game.gameState);
		}
		catch (err)	{
			console.error(err);
			reply.code(500).send({ error: 'Getting the state of a pong game failed'});
		}	
	});	
	
	fast.get('/:id/winner', { schema: winnerSchema },  async (request, reply) => {
		try {
			const id = request.params.id;
			// const game = apigamesById.get(Number(id));
			const game = getMapId().get(Number(id));
			if (!game)			
				return (reply.code(404).send({ error: 'Game not found' }));				
			reply.code(200).send({ winner: game.winner });
		}
		catch (err)	{
			console.error(err);
			reply.code(500).send({ error: 'Getting the winner of a pong game failed'});
		}
	});
}
