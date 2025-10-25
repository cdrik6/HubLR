import { getCurrentUser } from '../utils/auth.js';
import { GameSettings as settings } from '../utils/types.js';

// Interfaces
interface GameState {
	ball: {x: number, y: number},
	paddle: {p1: number, p2: number, p3: number, p4: number},
	score: {p1: number, p2: number, p3: number, p4: number},
	winner: string,
	pH: number,
	wall: number
}

// interface settings {
// 		tournamentId: string,
// 		local: boolean,
// 		multi: boolean,
// 		options: { speedy: boolean, paddy: boolean, wally: boolean, mirry: boolean },		
// 		players : {
// 			player1: { id: number, alias: string },
// 			player2: { id: number, alias: string },
// 			player3: { id: number, alias: string },
// 			player4: { id: number, alias: string }
// 	 	}		
// }

export async function playMulti(data:settings)
{
	if (!data.multi || data.local)
		return ;

	const canvas4 = document.getElementById("canvasGame4") as HTMLCanvasElement | null;
	if (!canvas4) throw new Error("canvasGame4 not found");
	const output4 = document.getElementById("output4") as HTMLTableElement | null;
	if (!output4) throw new Error("output4 table not found");
	const gameover4 = document.getElementById("gameover4") as HTMLPreElement | null;
	if (!gameover4) throw new Error("gameover4 not found");
	let ctx = canvas4.getContext("2d");
	if (!ctx)
		throw new Error("Error: Failure occured during context creation");
	let ballRadius = 10; // default
	let paddleHeight = 80; // default
	let paddleWidth = 15; // 3 * ballRadius / 2; // default
	let upPressed1 = false;
	let downPressed1 = false;
	let upPressed2 = false;
	let downPressed2 = false;
	let leftPressed3 = false;
	let rightPressed3 = false;
	let leftPressed4 = false;
	let rightPressed4 = false;
	let ping: number;
	let paddle = { p1: "", p2: "", p3: "", p4: "" };
	let start = { start: "" };
	let end = { end: "" };	
	// let mode = { nbPlayers: 4, tournamentId: "", alias: "", userId: "", speedy: false, paddy: false, wally: false, mirry: false, multy: true };
	let mode = {
		tournamentId: "",
		nbPlayers: 4,
		options: { speedy: false, paddy: false, wally: false, mirry: false, multy: true },
		player1: { id: 0, alias: "" },
		player2: { id: 0, alias: "" },
		player3: { id: 0, alias: "" },
		player4: { id: 0, alias: "" },
		user: { id: 0, alias: "", player: 1 }
	};

	// from settings to mode	
	if (data.tournamentId) mode.tournamentId = data.tournamentId;	
	mode.nbPlayers = 4;	// if (data.local === false && data.multi === true)	
	mode.options.multy = true; // if (data.multi === true)
	console.log('nbPlayers = ' + mode.nbPlayers);
	mode.options.speedy = data.options.speedy;
	mode.options.paddy = data.options.paddy;
	mode.options.wally = data.options.wally;
	mode.options.mirry = data.options.mirry;		
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
	if (username != "")
	{
		if (username === mode.player1.alias) { mode.user.alias = mode.player1.alias; mode.user.id = mode.player1.id; mode.user.player = 1 }
		else if (username === mode.player2.alias) { mode.user.alias = mode.player2.alias; mode.user.id = mode.player2.id; mode.user.player = 2 }
		else if (username === mode.player3.alias) { mode.user.alias = mode.player3.alias; mode.user.id = mode.player3.id; mode.user.player = 3 }
		else if (username === mode.player4.alias) { mode.user.alias = mode.player4.alias; mode.user.id = mode.player4.id; mode.user.player = 4 }
	}
	else
		{ mode.user.alias = mode.player1.alias; mode.user.id = mode.player1.id; mode.user.player = 1 }	
	
	return new Promise (resolve => {	 

		// WebSocket
		const clt_wskt = new WebSocket(`${location.origin}/api/game/pong`);

		clt_wskt.addEventListener('open', () => {	
			console.log('Connected to WebSocket\n');
			ping = setInterval( () => {	clt_wskt.send(JSON.stringify({ ping: "Pong4 is alive" })); }, 30000);
			if (mode.user.player === 1 || mode.user.player === 2)
				gameover4.textContent += 'You can play with ↑/↓ keys';
			else 
				gameover4.textContent += 'You can play with ←/→ keys';
			clt_wskt.send(JSON.stringify(mode));
		});

		clt_wskt.addEventListener('error', err => {
			console.error('Error: ' + err + '\n');
		});

		clt_wskt.addEventListener('close', () => {
			clearInterval(ping);
			console.log('WebSocket closed\n');
			resolve("Game Over 4");
		});

		clt_wskt.addEventListener('message', srv_msg => {
			try
			{
				const data = JSON.parse(srv_msg.data);		
				if ('ball' in data && 'paddle' in data  && 'x' in data.ball && 'y' in data.ball && 'p1' in data.paddle
					&& 'p2' in data.paddle && 'p3' in data.paddle && 'p4' in data.paddle)
				{
					draw(data);			
					if ('winner' in data && data.winner != "")
					{
						gameover4.textContent = 'Game over: ' + data.winner + ' won!';
						if (data.winner != "Equality! No one")
							clt_wskt.send(JSON.stringify(end));
					}
				}	
				else if ('bR' in data && 'pH' in data && 'pW' in data)
				{				
					ballRadius = data.bR * canvas4.height;
					paddleHeight = data.pH * canvas4.height;
					paddleWidth = data.pW * canvas4.height;			
				}		
			}
			catch (e) {
				console.error('Invalid JSON received: ', srv_msg.data);
			}		
		});

		document.addEventListener("keydown", keyDownHandler, false);
		document.addEventListener("keyup", keyUpHandler, false);
		setTimeout(() => { clt_wskt.send(JSON.stringify(start)) }, 1000);

		function padMovement()
		{
			if (upPressed2 === true)
				paddle.p2 = "up";
			else if (downPressed2 === true)
				paddle.p2 = "down";
			else
				paddle.p2 = "";	
			//
			if (upPressed1 === true)
				paddle.p1 = "up";
			else if (downPressed1 === true)
				paddle.p1 = "down";
			else
				paddle.p1 = "";
			//
			if (leftPressed3 === true)
				paddle.p3 = "left";
			else if (rightPressed3 === true)
				paddle.p3 = "right";
			else
				paddle.p3 = "";
			//
			if (leftPressed4 === true)
				paddle.p4 = "left";
			else if (rightPressed4 === true)
				paddle.p4 = "right";
			else
				paddle.p4 = "";	
			//
			if (paddle.p1 != "" || paddle.p2 != "" || paddle.p3 != "" || paddle.p4 != "")
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
			else if (e.key === "left" || e.key === "ArrowLeft")
				leftPressed3 = true;
			else if (e.key === "right" || e.key === "ArrowRight")
				rightPressed3 = true;  
			else if (e.key === "a")
				leftPressed4 = true;  
			else if (e.key === "d")
				rightPressed4 = true;  
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
			else if (e.key === "left" || e.key === "ArrowLeft")
				leftPressed3 = false;
			else if (e.key === "right" || e.key === "ArrowRight")
				rightPressed3 = false;  
			else if (e.key === "a")
				leftPressed4 = false;  
			else if (e.key === "d")
				rightPressed4 = false;   
		}

		function drawBall(x:number, y:number)
		{	
			ctx?.beginPath();		
			ctx?.arc(x , y, ballRadius, 0, 2 * Math.PI);	
			if (ctx) ctx.fillStyle = "#36BFB1"; //"rgba(255, 0, 0, 1)";
			ctx?.fill();	
			ctx?.closePath();
			// console.log("x = " + x + " y = " + y);
		}

		function drawPaddles(paddle1Y:number, paddle2Y:number, paddle3X:number, paddle4X:number)
		{
			if (canvas4)
			{
				ctx?.beginPath();
				ctx?.rect(0, paddle1Y, paddleWidth, paddleHeight);
				ctx?.rect(canvas4.width - paddleWidth, paddle2Y, paddleWidth, paddleHeight);
				ctx?.rect(paddle3X, 0, paddleHeight, paddleWidth);
				ctx?.rect(paddle4X, canvas4.height - paddleWidth, paddleHeight, paddleWidth);	
				if (ctx) ctx.fillStyle = "#41d9d9"; //"rgba(0, 0, 0, 1)";
				ctx?.fill();
				ctx?.closePath();	
			}
		}

		function printScore(s1:number, s2:number, s3:number, s4:number)
		{
			if (output4)
			{
				// output4.textContent = "P1: " + s1 + " - P2: " + s2 + " - P3: " + s3 + " - P4: " + s4; 
				output4.rows[0].cells[0].textContent = mode.player1.alias;
				output4.rows[0].cells[1].textContent = mode.player2.alias;
				output4.rows[0].cells[2].textContent = mode.player3.alias;
				output4.rows[0].cells[3].textContent = mode.player4.alias;		
				//
				const scores = [s1,s2,s3,s4];
				const maxScore = Math.max(s1,s2,s3,s4);
				for (let i = 0; i < 4; i++) {
					output4.rows[0].cells[i].classList.remove("bg-pink-500");
					output4.rows[1].cells[i].textContent = String(scores[i]);
					if (scores[i] === maxScore && scores[i] != 0)
						output4.rows[0].cells[i].classList.add("bg-pink-500");		
				}
			}		
		}

		function drawWall()
		{	
			if (canvas4)
			{
				ctx?.beginPath();
				ctx?.rect(canvas4.width/2 - paddleWidth/2, 0, paddleWidth, canvas4.height);			
				ctx?.rect(0, canvas4.height/2 - paddleWidth/2, canvas4.width, paddleWidth);
				if (ctx) ctx.fillStyle = "#41d9d9"; // "rgba(0, 0, 0, 1)";
				ctx?.fill();	
				ctx?.closePath();	
			}
		}

		function drawlines(paddle1Y:number, paddle2Y:number, paddle3X:number, paddle4X:number)
		{
			if (canvas4)
			{
				ctx?.beginPath();
				ctx?.rect(0, paddle1Y, canvas4.width, 1);
				ctx?.rect(0, paddle2Y, canvas4.width, 1);
				ctx?.rect(0, paddle1Y + paddleHeight - 1, canvas4.width, 1);	
				ctx?.rect(0, paddle2Y + paddleHeight - 1, canvas4.width, 1);
				ctx?.rect(paddle3X, 0, 1, canvas4.height);
				ctx?.rect(paddle4X, 0, 1, canvas4.height);
				ctx?.rect(paddle3X + paddleHeight - 1, 0, 1, canvas4.height);
				ctx?.rect(paddle4X + paddleHeight - 1, 0, 1, canvas4.height);
				if (ctx) ctx.fillStyle = "#41d9d9"; //"rgba(0, 0, 0, 1)";
				ctx?.fill();
				ctx?.closePath();	
			}
		}

		function draw(data: GameState)
		{
			if (canvas4)
			{
				paddleHeight = data.pH * canvas4.height;
				ctx?.clearRect(0, 0, canvas4.width, canvas4.height);	
				printScore(data.score.p1, data.score.p2, data.score.p3, data.score.p4);	
				drawBall(data.ball.x * canvas4.width, data.ball.y * canvas4.height);		
				drawPaddles(data.paddle.p1 * canvas4.height, data.paddle.p2 * canvas4.height, data.paddle.p3 * canvas4.width, data.paddle.p4 * canvas4.width);
				if (mode.options.wally === true && data.wall === 1)
					drawWall();
				// if (mode.options.mirry)
				// 	drawlines(data.paddle.p1 * canvas4.height, data.paddle.p2 * canvas4.height, data.paddle.p3 * canvas4.width, data.paddle.p4 * canvas4.width);
				padMovement();
			}	
		}
	});
}
