export class Game {

	constructor(id)
	{
		this.id = id;
		this.players = [null, null];
		this.users = [null, null];
		this.usersId = [null, null];
		this.viewers = [];
		this.canvasHeight = 320;
		this.canvasWidth = 480;
		this.ballRadius = this.canvasHeight / 40;
		this.paddleHeight = this.canvasHeight / 5;
		this.paddleWidth = 3 * this.canvasHeight / 80;		
		this.ballSpeed = 3;
		this.padSpeed = 3;
		this.fq = 10;
		this.dx = this.ballSpeed / 2;
		this.dy = this.ballSpeed / 2;
		this.signX = getRandomSign();
		this.signY = getRandomSign();
		this.lost = false;
		this.paddle1Y = (this.canvasHeight - this.paddleHeight) / 2; 
		this.paddle2Y = (this.canvasHeight - this.paddleHeight) / 2;
		this.padTouch1 = false;
		this.padTouch2 = false;
		this.wallTouch = false;
		this.corner = false;
		this.x = this.canvasWidth / 2;
		this.y = this.canvasHeight / 2;
		this.s1 = 0;
		this.s2 = 0;
		this.winner = "";
		this.wall = 0;
		this.gameState = {
			ball: {x: this.x / this.canvasWidth, y: this.y / this.canvasHeight},
			paddle: {p1: this.paddle1Y / this.canvasHeight, p2: this.paddle2Y / this.canvasHeight},
			score: {p1: this.s1, p2: this.s2},
			winner: this.winner,
			pH: this.paddleHeight / this.canvasHeight,
			wall: this.wall
		};
		this.settings = {
			bR: this.ballRadius / this.canvasHeight,
			pH: this.paddleHeight / this.canvasHeight,
			pW: this.paddleWidth / this.canvasHeight,
			id: this.id
		};
		this.intervalId = null;
		this.startGame = false;
		this.ready = 0;
		this.mode = 1;
		this.limit = 11;
		this.speedy = false;
		this.paddy = false;
		this.wally = false;
		this.mirry = false;
		this.multy = false;
		this.nbrTouch = 0;
		this.maxTouch = 0;
		this.tournamentId = "";
		this.winnerId = "";		
	}

	// get paddles movements from client
	paddlesY(pad1, pad2)
	{
		if (pad2 === "up")
		{
			if(this.paddle2Y - this.padSpeed > 0)
				this.paddle2Y -= this.padSpeed;
			else 
				this.paddle2Y = 0;
		}				
		else if (pad2 === "down")
		{
			if (this.paddle2Y + this.padSpeed + this.paddleHeight < this.canvasHeight)		
				this.paddle2Y += this.padSpeed;
			else 
				this.paddle2Y = this.canvasHeight - this.paddleHeight;
		}
		if (pad1 === "up")
		{
			if (this.paddle1Y - this.padSpeed > 0)	
				this.paddle1Y -= this.padSpeed;
			else 
				this.paddle1Y = 0;
		}
		else if (pad1 === "down")
		{
			if (this.paddle1Y + this.padSpeed + this.paddleHeight < this.canvasHeight)		
				this.paddle1Y += this.padSpeed;	
			else
				this.paddle1Y = this.canvasHeight - this.paddleHeight;
		}
		this.gameState.paddle.p2 = this.paddle2Y / this.canvasHeight;
		this.gameState.paddle.p1 = this.paddle1Y / this.canvasHeight;
	}
	
	check()
	{
		if (this.x + this.ballRadius >= this.canvasWidth)
		{
			this.lost = true;
			this.s1++;
			this.gameState.score.p1 = this.s1;
			if (this.s1 >= this.limit && this.s1 - this.s2 >= 2)
			{
				this.winner = this.users[0]; //"p1";
				if (this.winner === "" || this.winner === null)
					this.winner = "Player1";
				this.winnerId = this.usersId[0];
				this.gameState.winner = this.winner;
				clearInterval(this.intervalId);
			}			
		}
		else if (this.x - this.ballRadius <= 0)
		{
			this.lost = true;
			this.s2++;
			this.gameState.score.p2 = this.s2;
			if (this.s2 >= this.limit && this.s2 - this.s1 >= 2)
			{
				this.winner = this.users[1]; //"p2";
				if (this.winner === "" || this.winner === null)
					this.winner = "Player2";
				this.winnerId = this.usersId[1];
				this.gameState.winner = this.winner;
				clearInterval(this.intervalId);
			}			
		}	
		else if (this.y + this.ballRadius >= this.canvasHeight || this.y - this.ballRadius <= 0)
			this.signY = -this.signY;						
		else if (this.distBallPad2(this.x, this.y) <= 0)
		{			
			if (this.padTouch2 === false)
			{
				this.signX = -this.signX;
				if (this.corner === true)
					this.signY = -this.signY;			
				this.padTouch2 = true;
				this.speed();
				this.padTouch1 = false;
				this.wallTouch = false;				
				this.set_wall();
				this.nbrTouch++;	
			}			
		}		
		else if (this.distBallPad1(this.x, this.y) <= 0)		
		{
			
			if (this.padTouch1 === false)
			{
				this.signX = -this.signX;
				if (this.corner === true)
					this.signY = -this.signY;
				this.padTouch1 = true;
				this.speed();
				this.padTouch2 = false;
				this.wallTouch = false;
				this.set_wall();
				this.nbrTouch++;
			}
		}
		else if (this.wally && this.wall === 1 && this.distBallWall(this.x) <= 0)
		{
			if (this.wallTouch === false)
			{
				this.signX = -this.signX;			
				this.wallTouch = true;
				this.speed();
				this.padTouch1 = false;
				this.padTouch2 = false;
			}			
		}				
	}	
	
	next()
	{
		if (!this.lost && this.winner === "")
		{
			this.x = this.x + this.signX * this.dx;
			this.y = this.y + this.signY * this.dy;			
		}
		else
		{			
			this.x = this.canvasWidth / 2;
			this.y = this.canvasHeight / 2;
			this.lost = false;			
			this.signX = getRandomSign();
			this.signY = getRandomSign();
			this.padTouch2 = false;
			this.padTouch1 = false;
			this.dx = this.ballSpeed / 2;
			this.dy = this.ballSpeed / 2;						
			this.paddleH();			
			this.wall = 0;
			this.gameState.wall = this.wall;
			this.maxTouch=(this.maxTouch<this.nbrTouch)?this.nbrTouch:this.maxTouch;
			this.nbrTouch = 0;
		}	
	}

	play()
	{
		if (this.winner === "")
		{		
			this.check();
			this.next();
			this.gameState.ball.x = this.x / this.canvasWidth;
			this.gameState.ball.y = this.y / this.canvasHeight;
			if (this.mirry)
				this.gameState.ball.x = 1 - (this.x / this.canvasWidth);
		}
		else		
			clearInterval(this.intervalId);		 
		return (this.gameState);
	}	

	set_wall()
	{
		if (this.wally)
		{
			this.wall = getRandomIntInclusive(0, 1);
			this.gameState.wall = this.wall;
		}
	}

	speed()
	{
		if (this.speedy)
		{
			this.dx = this.ballSpeed * getRandom(0.75, 1.75);
			this.dy = this.ballSpeed * getRandom(0.75, 1.75);
		}
		else
		{
			this.dx = this.ballSpeed
			this.dy = this.ballSpeed
		}
	}

	paddleH()
	{
		if (this.paddy && this.paddleHeight > 1 / 0.8)
		{
			this.paddleHeight = this.paddleHeight * 0.8;
			this.gameState.pH = this.paddleHeight / this.canvasHeight;
		}	
	}

	distBallPad2(xB, yB)
	{
		const xP = this.canvasWidth - this.paddleWidth;
		const yP = this.paddle2Y + this.paddleHeight;	

		if (yB >= this.paddle2Y && yB <= yP)	
			return (this.corner = false, xP - (xB + this.ballRadius));	
		if (yB > yP)
			return (this.corner = true, Math.sqrt((xB - xP) * (xB - xP) + (yB - yP) * (yB - yP)) - this.ballRadius);
		if (yB < this.paddle2Y)
			return (this.corner = true, Math.sqrt((xB - xP) * (xB - xP) + (yB - this.paddle2Y) * (yB - this.paddle2Y)) - this.ballRadius);
	}

	distBallPad1(xB, yB)
	{
		const xP = this.paddleWidth;
		const yP = this.paddle1Y + this.paddleHeight;	

		if (yB >= this.paddle1Y && yB <= yP)		
			return (this.corner = false, (xB - this.ballRadius) - xP);	
		if (yB > yP)
			return (this.corner = true, Math.sqrt((xB - xP) * (xB - xP) + (yB - yP) * (yB - yP)) - this.ballRadius);
		if (yB < this.paddle1Y)
			return (this.corner = true, Math.sqrt((xB - xP) * (xB - xP) + (yB - this.paddle1Y) * (yB - this.paddle1Y)) - this.ballRadius);
	}

	distBallWall(xB)
	{
		const xW1 = this.canvasWidth / 2 - this.paddleWidth / 2;
		const xW2 = this.canvasWidth / 2 + this.paddleWidth / 2;
		
		if (this.padTouch1 === true)
			return (xW1 - (xB + this.ballRadius));
		else if (this.padTouch2 === true)
			return ((xB - this.ballRadius) - xW2);
		else 
			return (1);		
	}


	start(startGame)
	{
		this.startGame = startGame;
		if (this.startGame === true && this.ready === 1)
		{			
			this.intervalId = setInterval( () => 
			{				
				const frame = JSON.stringify(this.play());				
				if (this.mode === 2 && this.players[0] && this.players[0].readyState === WebSocket.OPEN)
						this.players[0].send(frame);
				else if (this.mode != 2)
				{
					// players
					for (const clt_skt of this.players)
					{
						if (clt_skt && clt_skt.readyState === WebSocket.OPEN)
							clt_skt.send(frame);
					}
					// viewers
					for (const clt_skt of this.viewers)
					{
						if (clt_skt && clt_skt.readyState === WebSocket.OPEN)
							clt_skt.send(frame);
					}
				} 
			}, this.fq);			
		}
		else 
			clearInterval(this.intervalId);
	}	
}

// Tools

// The maximum is inclusive and the minimum is inclusive
function getRandomIntInclusive(min, max)
{
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);   
}

function getRandomSign()
{
	let s = getRandomIntInclusive(0, 1);
	if (s === 0)
		return (1);
	else 
		return (-1);
}

function getRandom(min, max)
{
   return (Math.random() * (max - min) + min);   
}
