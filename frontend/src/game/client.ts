import { getCurrentUser } from '../utils/auth.js';
import { GameSettings as settings } from '../utils/types.js';

// Interfaces
interface GameState {
		ball: { x: number, y:number },
		paddle: { p1: number, p2: number },
		score: { p1: number, p2: number },
		winner: string,
		pH: number,
		wall: number
}

// userId = if connected = identifiant of user (it is NOT signup_username), else null --> not displayed
// alias = if connected = signup_username, else alias chosen --> to be displayed
// id tournament = null if no tournement, else id

export async function playPong(data:settings)
{		
	console.log("playPong");
	const canvas = document.getElementById("canvasGame") as HTMLCanvasElement;
	const output = document.getElementById("output") as HTMLPreElement;
	let ctx = canvas.getContext("2d");
	if (!ctx)
		throw new Error("Error: Failure occured during context creation");
	let ballRadius = 10; // default
	let paddleHeight = 80; // default
	let paddleWidth = 15; // 3 * ballRadius / 2; // default
	let upPressed1 = false;
	let downPressed1 = false;
	let upPressed2 = false;
	let downPressed2 = false;
	let pong: number;
	let paddle = { p1: "", p2: "" };
	let start = { start: "" };
	let end = { end: "" };	
	let mode = {
		tournamentId: "",
		nbPlayers: 2,
		options: { speedy: false, paddy: false, wally: false, mirry: false, multy: false },		
		player1: { id: 0, alias: "" },
		player2: { id: 0, alias: "" },
		player3: { id: 0, alias: "" },
		player4: { id: 0, alias: "" },
		user: { id: 0, alias: "", player: 1 },
		viewer: false
	};
	
	// from settings to mode	
	if (data.tournamentId) mode.tournamentId = data.tournamentId;
	if (data.local === true)
		mode.nbPlayers = 2;
	else
		mode.nbPlayers = 1;
	console.log('nbPlayers = ' + mode.nbPlayers);
	mode.options.speedy = data.options.speedy;
	mode.options.paddy = data.options.paddy;
	mode.options.wally = data.options.wally;
	mode.options.mirry = data.options.mirry;	
	if (data.multi === true)
		mode.options.multy = true;
	else 
		mode.options.multy = false;
	if (data.players.player1.id) mode.player1.id = data.players.player1.id;
	if (data.players.player2.id) mode.player2.id = data.players.player2.id;
	if (data.players.player3.id) mode.player3.id = data.players.player3.id;
	if (data.players.player4.id) mode.player4.id = data.players.player4.id;
	mode.player1.alias = data.players.player1.alias;
	mode.player2.alias = data.players.player2.alias;
	mode.player3.alias = data.players.player3.alias;
	mode.player4.alias = data.players.player4.alias;
	// who is it? --> alias
	const user = await getCurrentUser();
	const username = user?user.username:"";
	const userid = user?user.id:0;
	if (data.local)
		{ mode.user.alias = mode.player1.alias; mode.user.id = mode.player1.id; mode.user.player = 1 }	
	else if (username != "")
	{		
		if (username === mode.player1.alias) { mode.user.alias = mode.player1.alias; mode.user.id = mode.player1.id; mode.user.player = 1 }
		else if (username === mode.player2.alias) { mode.user.alias = mode.player2.alias; mode.user.id = mode.player2.id; mode.user.player = 2 }
		else if (username === mode.player3.alias) { mode.user.alias = mode.player3.alias; mode.user.id = mode.player3.id; mode.user.player = 3 }
		else if (username === mode.player4.alias) { mode.user.alias = mode.player4.alias; mode.user.id = mode.player4.id; mode.user.player = 4 }						
		else if (data.viewers.some(v => v.id === userid && v.alias === username))
		{
			console.log(data.viewers);
			console.log({ id: userid, alias: username });			
			console.log('viewer: ' + username);
			mode.viewer = true;
			mode.user.alias = username;
			mode.user.id = userid;
			mode.user.player = 0; // 0 only for viewers
		}	
	}	
	else		
		return ;


	return new Promise (resolve => {	 
		
		// WebSocket
		const clt_wskt = new WebSocket(`${location.origin}/api/game/pong`);

		clt_wskt.addEventListener('open', () => {	
			console.log('Connected to Game WebSocket\n');	
			pong = setInterval( () => {	clt_wskt.send(JSON.stringify({ ping: "Pong is alive" })); }, 30000);
			if (mode.nbPlayers === 1 && !mode.viewer)
			 	output.textContent += 'You can play with w/s or ↑/↓ keys\n';			
			else if (mode.nbPlayers === 1 && mode.viewer)
				output.textContent += 'Chhhhhut\n';
			clt_wskt.send(JSON.stringify(mode));	
		});

		clt_wskt.addEventListener('error', err => {
			console.error('Error: ' + err + '\n');
		});

		clt_wskt.addEventListener('close', () => {
			clearInterval(pong);
			console.log('Game WebSocket closed\n');		
			resolve("Game Over");
		});

		clt_wskt.addEventListener('message', srv_msg => {
			try	{
				const data = JSON.parse(srv_msg.data);
				if ('ball' in data && 'paddle' in data && 'x' in data.ball && 'y' in data.ball && 'p1' in data.paddle && 'p2' in data.paddle)
				{
					draw(data);
					if ('winner' in data && data.winner != "")
					{						
						output.textContent = 'Game over: ' + data.winner + ' won!';
						clt_wskt.send(JSON.stringify(end));
					}
				}	
				else if ('bR' in data && 'pH' in data && 'pW' in data)
				{				
					ballRadius = data.bR * canvas.height;
					paddleHeight = data.pH * canvas.height;
					paddleWidth = data.pW * canvas.height;			
					output.textContent += 'Game ' + data.id ;
				}			
			}
			catch (e) {
				console.error('Invalid JSON received: ', srv_msg.data);
			}		
		});

		if (!mode.viewer || mode.nbPlayers === 2)
		{
			console.log(mode.user.alias + ": I am a player");
			document.addEventListener("keydown", keyDownHandler, false);
			document.addEventListener("keyup", keyUpHandler, false);
			setTimeout(() => { clt_wskt.send(JSON.stringify(start)) }, 1000);
		}

		function padMovement()
		{
			if (upPressed2 === true)
				paddle.p2 = "up";
			else if (downPressed2 === true)
				paddle.p2 = "down";
			else
				paddle.p2 = "";	
			if (upPressed1 === true)
				paddle.p1 = "up";
			else if (downPressed1 === true)
				paddle.p1 = "down";
			else
				paddle.p1 = "";		
			if (paddle.p1 != "" || paddle.p2 != "")
				clt_wskt.send(JSON.stringify(paddle));
		}

		function keyDownHandler(e:KeyboardEvent)
		{
			if (e.key === "Up" || e.key === "ArrowUp")
				upPressed2 = true;
			else if (e.key === "Down" || e.key === "ArrowDown")
				downPressed2 = true;  
			else if (e.key === "w")
				upPressed1 = true;  
			else if (e.key === "s")
				downPressed1 = true;  
			// else if (e.key === " ")
			// 	clt_wskt.send(JSON.stringify(start));
		}

		function keyUpHandler(e:KeyboardEvent)
		{
			if (e.key === "Up" || e.key === "ArrowUp") 	
				upPressed2 = false;  
			else if (e.key === "Down" || e.key === "ArrowDown")
				downPressed2 = false;  
			else if (e.key === "w")
				upPressed1 = false;	  
			else if (e.key === "s")
				downPressed1 = false;  
		}

		function drawBall(x:number, y:number)
		{	
			ctx?.beginPath();		
			ctx?.arc(x , y, ballRadius, 0, 2 * Math.PI);	
			if (ctx) ctx.fillStyle = "#36BFB1";
			ctx?.fill();	
			ctx?.closePath();
			// console.log("x = " + x + " y = " + y);
		}

		function drawPaddles(paddle1Y:number, paddle2Y:number)
		{
			ctx?.beginPath();
			ctx?.rect(0, paddle1Y, paddleWidth, paddleHeight);
			ctx?.rect(canvas.width - paddleWidth, paddle2Y, paddleWidth, paddleHeight);	
			if (ctx) ctx.fillStyle = "#41d9d9";
			ctx?.fill();
			ctx?.closePath();
			// console.log("P1 = " + paddle1Y + " " + (paddle1Y + paddleHeight) + " P2 = " + paddle2Y + " " + (paddle2Y + paddleHeight) );
		}

		function printScore(s1:number, s2:number)
		{
			const text = " - "
			if (ctx) ctx.font = "30px sans serif";	
			if (ctx) ctx.fillStyle = "#41d9d9";
			let pos = ctx ? canvas.width/2 - ctx?.measureText(text).width/2 : null;
			if (!pos)
				return null;
			ctx?.fillText(text, pos, 40);
			ctx?.fillText(s1.toString(), pos - ctx?.measureText(s1.toString()).width, 40);
			ctx?.fillText(s2.toString(), pos + ctx?.measureText(text).width, 40);
		}

		function drawWall()
		{	
			ctx?.beginPath();		
			ctx?.rect(canvas.width/2 - paddleWidth/2, 0, paddleWidth, canvas.height);
			if (ctx) ctx.fillStyle = "#41d9d9";
			ctx?.fill();	
			ctx?.closePath();	
		}

		function drawlines(paddle1Y:number, paddle2Y:number)
		{
			ctx?.beginPath();
			ctx?.rect(0, paddle1Y, canvas.width, 1);
			ctx?.rect(0, paddle2Y, canvas.width, 1);
			ctx?.rect(0, paddle1Y + paddleHeight, canvas.width, 1);
			ctx?.rect(0, paddle2Y + paddleHeight, canvas.width, 1);	
			if (ctx) ctx.fillStyle = "#41d9d9";
			ctx?.fill();
			ctx?.closePath();	
		}

		function draw(data:GameState)
		{	
			paddleHeight = data.pH * canvas.height;
			ctx?.clearRect(0, 0, canvas.width, canvas.height);	
			printScore(data.score.p1, data.score.p2);	
			drawBall(data.ball.x * canvas.width, data.ball.y * canvas.height);	
			drawPaddles(data.paddle.p1 * canvas.height, data.paddle.p2 * canvas.height);	
			if (mode.options.wally === true && data.wall === 1)
				drawWall();
			// if (mode.options.mirry)
			// 	drawlines(data.paddle.p1 * canvas.height, data.paddle.p2 * canvas.height);
			if (!mode.viewer || mode.nbPlayers === 2)
				padMovement();		
		}
	});	
}
