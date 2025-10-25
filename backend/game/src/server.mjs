import fastify from 'fastify';
import { WebSocketServer } from 'ws';
import http from 'http';
const fast = fastify({ logger: true });
const PORT = 443;
const HOST = '0.0.0.0';

import { Game } from './Game.mjs'
import { Game4 } from './Game4.mjs'
const gamesById = new Map();
const gamesByClient = new Map();
const gamesByAlias = new Map();
const gamesByTid = new Map();
const firstId = 100;
let g_id = firstId; // 0-99 first virtual games, 1-100 in stats, then real games id from 101
let localId = 1;

export function getId()
{	
	return (g_id++);
}

export function getMapId()
{	
	return (gamesById);
}

// For the API, ensures routes are registered before the server is ready
import pongRoutes from './routes/pongAPI.mjs';
await fast.register(pongRoutes);

// async function getUserId(req) {
// 	const resAuth = await fetch("http://auth:443/me", {method: "GET", headers: {cookie: req.headers.cookie}});
// 	if (!resAuth.ok)
// 		throw new Error("Communication with auth microservice failed");
// 	const bodyAuth = await resAuth.json();
// 	return bodyAuth.id;
// }

// Both Fastify and WebSocket share the same port and server instance
fast.ready().then(() => {     	
	
	const server = http.createServer((req, res) => {		
        fast.routing(req, res);
    });	
    
    // bind websocketserver to the http server
    const srv_wskt = new WebSocketServer({ server, path:'/pong' });    
	
    srv_wskt.on('connection', (clt_skt) => {		

		clt_skt.on('open', () => {
			console.log('Server: Client connected');			
		});		
		
		clt_skt.on('error', () => {
			console.log('Server: Error');		
		});
		
		clt_skt.on('message', async (clt_msg) => {           
            console.log('Server received:', clt_msg.toString());            
			const data = JSON.parse(clt_msg);
            try {					
				if ('nbPlayers' in data && 'options'in data && 'user'in data)
					ModeInData(clt_skt, data);				
				else if ('p1' in data && 'p2' in data)				
					PaddleInData(clt_skt, data);				
				else if ('start' in data)									
					StartInData(clt_skt);
				else if ('end' in data)									
					await EndInData(clt_skt, false);					
            }
            catch (e) {
                console.error('Invalid JSON from client');
            }
        });                

		clt_skt.on('close', (code, reason) => {
			console.log("Server: Client disconnected (" + code + "): " + reason + "\n");
			const game = gamesByClient.get(clt_skt);
			if (game)
			{
				// console.log("T id in disconnected: " + game.tournamentId);
				if (game.tournamentId != "" && game.mode === 1)
				{
					if (game.players[0] === clt_skt)
					{
						console.log("Server: Client " + game.users[0] + " disconnected in game: " + game.id + " " + reason + "\n");						
						game.s2 = Math.max(11, game.s1 + 2);						
					}	
					else
					{
						console.log("Server: Client " + game.users[1] + " disconnected in game: " + game.id + " " + reason + "\n");						
						game.s1 = Math.max(11, game.s2 + 2);						
					}	
				}
				console.log("Server: Client disconnected in game: " + game.id + " " + reason + "\n");
				gamesByClient.delete(clt_skt);
			}
		});

	});	

	try	{
		server.listen({ port: PORT, host: HOST });
		console.log("Pong server listening on port: " + PORT);
	}
	catch (err) {
		console.error("Error starting Pong server: ", err);
		process.exit(1); 
	}	
});

setInterval( () => { serverChecker(); }, 15 * 1000);

//
async function ModeInData(clt_skt, data)
{ 	
	if (data.user.alias === "")
	{
		data.user.alias = "local" + localId;
		localId++;
	}	
	if ((data.nbPlayers === 1 || data.nbPlayers === 2 || data.nbPlayers === 4) && data.user.alias != "")
	{		
		// const temp = gamesByAlias.get(data.user.alias)
		const temp = gamesByClient.get(clt_skt);
		if (temp)
		{						
			console.log('Go to BTG');
			if (temp.mode === 2)				
				await EndInData(temp.players[0], false);				
			else
				BackToGame(clt_skt, data, temp);
		}	
		else
		{
			console.log('Go to new game');
			if (data.nbPlayers === 2)
				ModeLocal(clt_skt, data);	
			else
				ModeRemote(clt_skt, data);			
		}
	}
	else
	{
		if (clt_skt && clt_skt.readyState === WebSocket.OPEN)
			clt_skt.close(1000, "Closed, wrong mode!");
	}
}

function ModeLocal(clt_skt, data)
{	
	const id = getId();
	const game = new Game(id);	
	gamesById.set(id, game);
	gamesByClient.set(clt_skt, game);
	gamesByAlias.set(data.user.alias, game);
	console.log('Server: New game (' + game.id + ') with 2 local players created');
	//id++;							
	game.players[0] = clt_skt;
	game.players[1] = clt_skt;
	game.users[0] = data.player1.alias; // + "_P1";
	game.users[1] = data.player2.alias; // + "_P2";
	game.usersId[0] = data.player1.id;
	game.usersId[1] = data.player2.id;
	game.ready = 1;
	game.mode = 2;
	game.speedy = data.options.speedy;
	game.paddy = data.options.paddy;
	game.wally = data.options.wally;
	game.mirry = data.options.mirry;
	game.multy = data.options.multy;
	if (data.tournamentId) game.tournamentId = data.tournamentId;
	clt_skt.send(JSON.stringify(game.settings))
	console.log(game.settings);
	//
	setTimeout(() => { pongStartChecker(game); }, 10 * 1000);
}

function BackToGame(clt_skt, data, temp)
{
	console.log('temp mode: ' + temp.mode);
	if (temp.mode === 2)
	{
		gamesByClient.delete(temp.players[0]);
		if (temp.players[0] && temp.players[0].readyState === WebSocket.OPEN)
			temp.players[0].close(1000, "Bye2: ws of user: " + temp.users[0] + " is now closed");
		temp.players[0] = clt_skt;
		temp.players[1] = clt_skt;
	}
	else if (temp.mode === 1)
	{
		if (data.user.alias === temp.users[0])
		{
			gamesByClient.delete(temp.players[0]);
			if (temp.players[0] && temp.players[0].readyState === WebSocket.OPEN)
				temp.players[0].close(1000, "Bye1: ws of user: " + temp.users[0] + " is now closed");
			temp.players[0] = clt_skt;
		}	
		else if (data.user.alias === temp.users[1])
		{
			gamesByClient.delete(temp.players[1]);
			if (temp.players[1] && temp.players[1].readyState === WebSocket.OPEN)
				temp.players[1].close(1000, "Bye1: ws of user: " + temp.users[1] + " is now closed");
			temp.players[1] = clt_skt;
		}
	}
	else if (temp.mode === 4)
	{
		if (data.user.alias === temp.users[0])
		{
			gamesByClient.delete(temp.players[0]);
			if (temp.players[0] && temp.players[0].readyState === WebSocket.OPEN)
				temp.players[0].close(1000, "Bye4: ws of user: " + temp.users[0] + " is now closed");
			temp.players[0] = clt_skt;
		}	
		else if (data.user.alias === temp.users[1])
		{
			gamesByClient.delete(temp.players[1]);
			if (temp.players[1] && temp.players[1].readyState === WebSocket.OPEN)
				temp.players[1].close(1000, "Bye4: ws of user: " + temp.users[1] + " is now closed");
			temp.players[1] = clt_skt;
		}
		else if (data.user.alias === temp.users[2])
		{
			gamesByClient.delete(temp.players[2]);
			if (temp.players[2] && temp.players[2].readyState === WebSocket.OPEN)
				temp.players[2].close(1000, "Bye4: ws of user: " + temp.users[2] + " is now closed");
			temp.players[2] = clt_skt;		
		}
		else if (data.user.alias === temp.users[3])
		{
			gamesByClient.delete(temp.players[3]);
			if (temp.players[3] && temp.players[3].readyState === WebSocket.OPEN )
				temp.players[3].close(1000, "Bye4: ws of user: " + temp.users[3] + " is now closed");
			temp.players[3] = clt_skt;		
		}
	}		
	gamesByClient.set(clt_skt, temp);	
	clt_skt.send(JSON.stringify(temp.settings))
	console.log(temp.settings);
}

async function ModeRemote(clt_skt, data)
{		
	let newGame = true;
	if (g_id > firstId) // at least one game created
	{
		if (data.nbPlayers === 1)
			newGame = await JoinGame(clt_skt, data, newGame);
		else if (data.nbPlayers === 4)
			newGame = await JoinGame4(clt_skt, data, newGame);
	}
	if (g_id === firstId || newGame === true)
	{
		if (data.nbPlayers === 1)
			NewGame(clt_skt, data);
		else if (data.nbPlayers === 4)
			NewGame4(clt_skt, data);
	}	
}

function JoinGame(clt_skt, data, newGame)
{	
	const k = data.user.player;			
	for (const game of gamesById.values())
	{		
		if ((game.ready === 0 || game.ready === -1 || k === 0) && game.mode === 1)
		{			
			if (k === 0 && data.tournamentId != "")
			{				
				// const game = gamesByTid.get(data.tournamentId);
				if (game.tournamentId === data.tournamentId)
				{
					game.viewers.push(clt_skt);
					newGame = false;
					break;
				}	
			}
			else if (k === 0 && data.tournamentId === "")
			{
				console.log("Error: no tournament but a viewer");
			}
			else if (game.users[k - 1] === data.user.alias && game.usersId[k - 1] === data.user.id)
			{			
				game.ready++; // game.ready = 1;
				game.players[k - 1] = clt_skt;
				if (game.ready === 1)
					console.log('Server: game: ' + game.id + ' found 2nd player: ' + data.user.alias);
				else if (game.ready === 0)
					console.log('Server: game: ' + game.id + ' found 1st player: ' + data.user.alias);
				gamesByClient.set(clt_skt, game);
				gamesByAlias.set(data.user.alias, game);
				newGame = false;
				clt_skt.send(JSON.stringify(game.settings))
				console.log(game.settings);
				break;
			}	
		}
	}
	return (newGame);
}

function JoinGame4(clt_skt, data, newGame)
{
	const k = data.user.player;
	for (const game of gamesById.values())
	{		
		if (game.ready < 1 && game.mode === 4)
		{
			// game.players[game.ready + 3] = clt_skt;
			// game.users[game.ready + 3] = data.alias;			
			if (k != 0 && game.users[k - 1] === data.user.alias && game.usersId[k - 1] === data.user.id)
			{			
				game.players[k - 1] = clt_skt;
				game.ready++;
				console.log('Server: game4: ' + game.id + ' found player: ' + Number(game.ready + 3) + ': ' + data.user.alias);
				gamesByClient.set(clt_skt, game);
				gamesByAlias.set(data.user.alias, game);
				newGame = false;
				clt_skt.send(JSON.stringify(game.settings))
				console.log(game.settings);
				break;
			}	
		}									
	}
	return (newGame);
}

function NewGame(clt_skt, data)
{
	const id = getId();
	const game = new Game(id);
	gamesById.set(id, game);	
	if (data.tournamentId != "")
	{
		gamesByTid.set(data.tournamentId, game);
		game.tournamentId = data.tournamentId;
	}
	game.mode = 1;
	game.users[0] = data.player1.alias;
	game.users[1] = data.player2.alias;	
	game.usersId[0] = data.player1.id;
	game.usersId[1] = data.player2.id;
	game.speedy = data.options.speedy;
	game.paddy = data.options.paddy;
	game.wally = data.options.wally;
	game.mirry = data.options.mirry;
	game.multy = data.options.multy;	
	if (data.user.player != 0) // player
	{		
		game.ready = 0;
		gamesByAlias.set(data.user.alias, game);
		gamesByClient.set(clt_skt, game);		
		if (data.user.player === 1)
			game.players[0] = clt_skt;
		else		
			game.players[1] = clt_skt;		
		console.log('Server: New game (' + id + ') created by player: ' + data.user.alias);
	}
	else if (data.user.player === 0) // viewer
	{
		game.ready = -1;
		game.viewers.push(clt_skt);
		console.log('Server: New game (' + id + ') created by viewer: ' + data.user.alias);
	}		
	// id++;
	clt_skt.send(JSON.stringify(game.settings))
	console.log(game.settings);
	//	
	setTimeout(() => { pongStartChecker(game); }, 10 * 1000);
}

function NewGame4(clt_skt, data)
{
	const id = getId();	
	const game = new Game4(id);
	// getId(2); // reserve id for stats
	gamesById.set(id, game);
	gamesByClient.set(clt_skt, game);
	console.log('Server: New game4 (' + id + ') with 1 player: ' + data.user.alias);
	gamesByAlias.set(data.user.alias, game);		
	game.users[0] = data.player1.alias;
	game.users[1] = data.player2.alias;
	game.users[2] = data.player3.alias;
	game.users[3] = data.player4.alias;
	game.usersId[0] = data.player1.id;
	game.usersId[1] = data.player2.id;
	game.usersId[2] = data.player3.id;
	game.usersId[3] = data.player4.id;
	if (data.user.player === 1)
		game.players[0] = clt_skt;
	else if (data.user.player === 2)
		game.players[1] = clt_skt;
	else if (data.user.player === 3)
		game.players[2] = clt_skt;
	else if (data.user.player === 4)
		game.players[3] = clt_skt;	
	game.ready = -2;
	game.mode = 4;
	game.speedy = data.options.speedy;
	game.paddy = data.options.paddy;
	game.wally = data.options.wally;
	game.mirry = data.options.mirry;
	game.multy = data.options.multy;	
	//id = id + 3;
	clt_skt.send(JSON.stringify(game.settings))
	console.log(game.settings);
}

function PaddleInData(clt_skt, data)
{
	const game = gamesByClient.get(clt_skt);					
	if (game)
	{
		console.log('gameid: ' + game.id);
		if (game.mode === 2)			
			game.paddlesY(data.p1, data.p2);		
		else if (game.mode === 1)
		{
			if (game.players[0] === clt_skt)
			{
				// game.paddlesY(data.p1, "");
				if (data.p1 != "")
					game.paddlesY(data.p1, "");
				else if (data.p2 != "")
					game.paddlesY(data.p2, "");
			}
			else if (game.players[1] === clt_skt)
			{
				// game.paddlesY("", data.p2);
				if (data.p2 != "")
					game.paddlesY("", data.p2);
				else if (data.p1 != "")
					game.paddlesY("", data.p1);
			}
		}
		else 
		{
			if (game.players[0] === clt_skt)
			{
				// game.paddlesY(data.p1, "");
				if (data.p1 != "")
					game.paddlesY(data.p1, "");
				else if (data.p2 != "")
					game.paddlesY(data.p2, "");
			}	
			else if (game.players[1] === clt_skt)
			{
				// game.paddlesY("", data.p2);
				if (data.p2 != "")
					game.paddlesY("", data.p2);
				else if (data.p1 != "")
					game.paddlesY("", data.p1);
			}
			else if (game.players[2] === clt_skt)
			{
				// game.paddlesX(data.p3, "");
				if (data.p3 != "")
					game.paddlesX(data.p3, "");
				else if (data.p4 != "")
					game.paddlesX(data.p4, "");
			}
			else if (game.players[3] === clt_skt)
			{
				// game.paddlesX("", data.p4);
				if (data.p4 != "")
					game.paddlesX("", data.p4);
				else if (data.p3 != "")
					game.paddlesX("", data.p3);
			}
		}
	}
}

function StartInData(clt_skt)
{
	const game = gamesByClient.get(clt_skt);					
	if (game)
		console.log("game id start/pause: " + game.id);
	if (game && game.ready === 1 && !game.startGame)
	{
		// if (game.startGame === true)
		// {
		// 	game.start(false);
		// }
		// else 
		game.start(true);
		//
		if (game.mode === 4)
		{	
			game.pingMulti = setInterval( () => { 
				game.ps1 = game.s1;
				game.ps2 = game.s2;
				game.ps3 = game.s3;
				game.ps4 = game.s4;				
				setTimeout(() => { multiChecker(game); }, 90 * 1000);
			}, 95 * 1000);
		}	
	}	
}

async function EndInData(clt_skt, isCancel)
{
	// let userId;
	// try {
	// 	userId = await getUserId(req);
	// }
	// catch (e) {
	// 	console.log(e);
	// 	throw Error(e);
	// }	

	//if (game && (game.mode != 1 || userId == game.usersId[0]))
	const game = gamesByClient.get(clt_skt);
	if (!game)	
		console.log("no game to end");		
	if (game)
	{
		//
		let i = 0;	
		if (game.mode === 1 && game.players[0] && game.players[0].readyState != WebSocket.OPEN)
			i = 1;	
		if (game.mode === 4)
		{	
			while (i < 4)
			{
				if (game.players[i] && game.players[i].readyState === WebSocket.OPEN)
					break
				i++;
			}
		}
		console.log("ws " + i + " is alive: " + game.users[i]);
		
		//
		console.log("game id ending: " + game.id);			
		console.log("tournamentId: " + game.tournamentId);
		if (game.mode === 2)
		{
			if (game.tournamentId != "") await backToTournament(game)
			if (game.players[0] && game.players[0].readyState === WebSocket.OPEN)
				game.players[0].close(1000, "Game over");
			gamesByClient.delete(game.players[0]);
			gamesByClient.delete(game.players[1]);
			gamesByAlias.delete(game.users[0]);
			gamesByAlias.delete(game.users[1]);
			gamesById.delete(game.id);
			console.log('Server: Local Game ' + game.id + ' deleted');
		}
		else if (game.mode === 1 && (game.players[i] === clt_skt || isCancel === true))
		{			
				if (game.tournamentId != "")
			{				
				await backToTournament(game)
				for (const clt_skt of game.viewers)
				{
					if (clt_skt && clt_skt.readyState === WebSocket.OPEN)
						clt_skt.close(1000, "Game Over");
				}				
				gamesByTid.delete(game.tournamentId);
			}
			if (!isCancel)			
				await insertStats(game);
			if (game.players[0] && game.players[0].readyState === WebSocket.OPEN)
				game.players[0].close(1000, "P1 Game Over");
			if (game.players[1] && game.players[1].readyState === WebSocket.OPEN)
				game.players[1].close(1000, "P2 Game Over");
			gamesByClient.delete(game.players[0]);
			gamesByClient.delete(game.players[1]);
			gamesByAlias.delete(game.users[0]);
			gamesByAlias.delete(game.users[1]);
			gamesById.delete(game.id);
			console.log('Server: Online Game ' + game.id + ' deleted');
		} 
		else if (game.mode === 4 && (game.players[i] === clt_skt || isCancel === true))
		{
			clearInterval(game.pingMulti);
			if (!isCancel)
				await insertAllMulti(game);
			if (game.players[0] && game.players[0].readyState === WebSocket.OPEN)
				game.players[0].close(1000, "P1 Game Over");
			if (game.players[1] && game.players[1].readyState === WebSocket.OPEN)
				game.players[1].close(1000, "P2 Game Over");	
			if (game.players[2] && game.players[2].readyState === WebSocket.OPEN)
				game.players[2].close(1000, "P3 Game Over");
			if (game.players[3] && game.players[3].readyState === WebSocket.OPEN)
				game.players[3].close(1000, "P4 Game Over");
			gamesByClient.delete(game.players[0]);
			gamesByClient.delete(game.players[1]);
			gamesByClient.delete(game.players[2]);
			gamesByClient.delete(game.players[3]);
			gamesByAlias.delete(game.users[0]);
			gamesByAlias.delete(game.users[1]);
			gamesByAlias.delete(game.users[2]);
			gamesByAlias.delete(game.users[3]);
			gamesById.delete(game.id);
			console.log('Server: Multiplayer Game ' + game.id + ' deleted');
		}
	}
}

async function serverChecker()
{
	console.log("Server checker:");
	for (const game of gamesById.values())
	{
		console.log("id: " + game.id);
		console.log("mode: " + game.mode);
		if (game.players[0])
			console.log("alias1: " + game.users[0]);
		if (game.players[1])
			console.log("alias2: " + game.users[1]);
		if (game.mode === 4)
		{
			if (game.players[2])
				console.log("alias3: " + game.users[2]);
			if (game.players[3])
				console.log("alias4: " + game.users[3]);
		}
		console.log("startGame: " + game.startGame);
		console.log("ready: " + game.ready);
		console.log("x: " + game.x);
		console.log("y: " + game.y);
		console.log("s1: " + game.s1);
		console.log("s2: " + game.s2);
		console.log("winner: " + game.winner);
		// Stop setInterval JIC of gameover well done but not deleted yet
		if (game.winner != "")
		{
			if (game.intervalId)
			{	
				console.log("Server checker closing intervalId of: " + game.id);
				clearInterval(game.intervalId);
				game.intervalId = null;
			}
		}	
	}
}

async function multiChecker(game)
{
	console.log("Multiplayer checker");
	if (game && game.mode === 4 && game.ready === 1)
	{
		console.log("id: " + game.id);
		if (game.s1 === game.ps1 && game.s2 === game.ps2 && game.s3 === game.ps3 && game.s4 === game.ps4)
		{
			clearInterval(game.intervalId);
			game.gameState.winner = "Equality! No one";
			game.winnerId = 0;
			for (let clt_skt of game.players)
			{
				if (clt_skt && clt_skt.readyState === WebSocket.OPEN)
					clt_skt.send(JSON.stringify(game.gameState));
			}				
			console.log("Closing Multiplayer: " + game.id);			
			clearInterval(game.pingMulti);
			await EndInData(game.players[0], true);
		}
	}
}

async function pongStartChecker(game)
{	
	if (game && (game.mode === 1 || game.mode === 2) && (game.ready === 0 || game.ready === -1))
	{			
		console.log("Pong start checker of " + game.id);
		clearInterval(game.intervalId); // JIC		
		if (game.players[0])
		{
			game.gameState.winner = game.users[0];
			game.winner = game.users[0];
			game.winnerId = game.usersId[0];
		}
		else if (game.players[1])	
		{
			game.gameState.winner = game.users[1];
			game.winner = game.users[1];
			game.winnerId = game.usersId[1];
		}						
		console.log("Closing Pong 1v1: " + game.id);		
		if (game.players[0])
			await EndInData(game.players[0], true);
		else if (game.players[1])
			await EndInData(game.players[1], true);
	}
}

async function insertStats(game)
{	
	try {
		const res = await fetch("http://stats:443/insert", {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					gameid: game.id,
					userid1: game.usersId[0],
					userid2: game.usersId[1],
					player1: game.users[0],
					player2: game.users[1],
					winner: game.winner,
					winnerid: game.winnerId,
					score1: game.s1,
					score2: game.s2,
					maxtouch: game.maxTouch,
					speedy: game.speedy,
					paddy: game.paddy,
					wally: game.wally,
					mirry: game.mirry,
					multy: game.multy
				})
		})
		if (!res.ok) { throw new Error(`HTTP error status: ${res.status}`); }
		const data = await res.json();
		console.log(data);
	}
	catch(err) { console.error(err); };		
}

async function insertAllMulti(game)
{	
	if (game.winner === game.users[0])
	{	
		await insertMulti(game, game.id, game.usersId[0], game.usersId[1], game.users[0], game.users[1], game.s1, game.s2);
		await insertMulti(game, game.id, game.usersId[0], game.usersId[2], game.users[0], game.users[2], game.s1, game.s3);
		await insertMulti(game, game.id, game.usersId[0], game.usersId[3], game.users[0], game.users[3], game.s1, game.s4);
		console.log("case 1");	
	}	
	else if (game.winner === game.users[1])
	{	
		await insertMulti(game, game.id, game.usersId[1], game.usersId[0], game.users[1], game.users[0], game.s2, game.s1);
		await insertMulti(game, game.id, game.usersId[1], game.usersId[2], game.users[1], game.users[2], game.s2, game.s3);
		await insertMulti(game, game.id, game.usersId[1], game.usersId[3], game.users[1], game.users[3], game.s2, game.s4);
		console.log("case 2");	
	}
	else if (game.winner === game.users[2])
	{	
		await insertMulti(game, game.id, game.usersId[2], game.usersId[0], game.users[2], game.users[0], game.s3, game.s1);
		await insertMulti(game, game.id, game.usersId[2], game.usersId[1], game.users[2], game.users[1], game.s3, game.s2);
		await insertMulti(game, game.id, game.usersId[2], game.usersId[3], game.users[2], game.users[3], game.s3, game.s4);
		console.log("case 3");	
	}
	else if (game.winner === game.users[3])
	{	
		await insertMulti(game, game.id, game.usersId[3], game.usersId[0], game.users[3], game.users[0], game.s4, game.s1);
		await insertMulti(game, game.id, game.usersId[3], game.usersId[1], game.users[3], game.users[1], game.s4, game.s2);
		await insertMulti(game, game.id, game.usersId[3], game.usersId[2], game.users[3], game.users[2], game.s4, game.s3);
		console.log("case 4");	
	}
	else
		console.log("No data to insert from multiplayer game: " + game.id);	
}

async function insertMulti(game, gameid, id1, id2, p1, p2, s1, s2)
{	
	try {
		const res = await fetch("http://stats:443/insert", {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					gameid: gameid,
					userid1: id1,
					userid2: id2,
					player1: p1,
					player2: p2,
					winner: p1, //game.winner,
					winnerid: id1, //game.winnerid,
					score1: s1,
					score2: s2,
					maxtouch: game.maxTouch,
					speedy: game.speedy,
					paddy: game.paddy,
					wally: game.wally,
					mirry: game.mirry,
					multy: game.multy
				})
		})
		if (!res.ok) { throw new Error(`HTTP error status: ${res.status}`); }		
		const data = await res.json();		
		console.log(data);
	}
	catch (err) { console.error(err); }	
}

async function backToTournament(game)
{		
	if (game.tournamentId != "")		
	{
		console.log("Doing backToT");
		const res = await fetch(`http://tournament:443/${game.tournamentId}/match`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({								
					winner: { id: game.winnerId, alias: game.winner } 
				})
		})
		if (!res.ok) { throw new Error(`HTTP error status: ${res.status}`); }
		console.log(res.status);
	}	
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/*
Note : WebSocket States
CONNECTING (0) -> Connecting in progress
OPEN (1)       -> Ready to send/receive data
CLOSING (2)    -> Close initiated, not done yet
CLOSED (3)     -> Fully closed
*/
