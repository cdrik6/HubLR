export class Game4 {

	constructor(id)
	{
		this.id = id;
		this.players = [null, null, null, null]; // skt1 / skt2 / skt3 / skt4
		this.users = [null, null, null, null]; // p1 / p2 / p3 / p4
		this.usersId = [null, null, null, null]; // id1 / id2 / id3 / id4
		this.canvasHeight = 400;
		this.canvasWidth = 400;
		this.ballRadius = this.canvasHeight / 40;
		this.paddleHeight = this.canvasHeight / 5;
		this.paddleWidth = 3 * this.canvasHeight / 80;
		this.ballSpeed = 3;
		this.padSpeed = 4;
		this.fq = 10;
		this.dx = this.ballSpeed * getRandom(0.1, 0.9);
		this.dy = this.ballSpeed * getRandom(0.1, 0.9);
		this.signX = getRandomSign();
		this.signY = getRandomSign();
		//
		this.lost = false;		
		//
		this.paddle1Y = (this.canvasHeight - this.paddleHeight) / 2; 
		this.paddle2Y = (this.canvasHeight - this.paddleHeight) / 2;
		this.paddle3X = (this.canvasWidth - this.paddleHeight) / 2; 
		this.paddle4X = (this.canvasWidth - this.paddleHeight) / 2;
		//
		this.padTouch1 = false;
		this.padTouch2 = false;
		this.padTouch3 = false;
		this.padTouch4 = false;
		this.wallTouch = false;
		//
		this.corner = false;
		this.x = this.canvasWidth / 2;
		this.y = this.canvasHeight / 2;
		this.s1 = 0;
		this.s2 = 0;
		this.s3 = 0;
		this.s4 = 0;
		this.winner = "";
		this.wall = 0;
		this.gameState = {
			ball: {x: this.x / this.canvasWidth, y: this.y / this.canvasHeight},
			paddle: {p1: this.paddle1Y / this.canvasHeight, p2: this.paddle2Y / this.canvasHeight, p3: this.paddle3X / this.canvasWidth, p4: this.paddle4X / this.canvasWidth},
			score: {p1: this.s1, p2: this.s2, p3: this.s3, p4: this.s4},			
			winner: this.winner,
			pH: this.paddleHeight / this.canvasHeight,
			wall: this.wall
		};
		this.settings = {
			bR: this.ballRadius / this.canvasHeight,
			pH: this.paddleHeight / this.canvasHeight,
			pW: this.paddleWidth / this.canvasHeight
		};
		this.intervalId = null;
		this.startGame = false;
		this.ready = -3;
		this.mode = 4;
		this.limit = 11;
		this.lastPaddle = "";
		this.speedy = false;
		this.paddy = false;
		this.wally = false;
		this.mirry = false;
		this.multy = true;
		this.nbrTouch = 0;
		this.maxTouch = 0;
		this.ps1 = 0;
		this.ps2 = 0;
		this.ps3 = 0;
		this.ps4 = 0;
		this.pingMulti = null;
		this.winnerId = "";
	}	

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

	paddlesX(pad3, pad4)
	{
		if (pad3 === "left")
		{	
			if (this.paddle3X - this.padSpeed > 0)
				this.paddle3X -= this.padSpeed;
			else
			 	this.paddle3X = 0;
		}
		else if (pad3 === "right")
		{
			if (this.paddle3X + this.padSpeed + this.paddleHeight < this.canvasWidth)
				this.paddle3X += this.padSpeed;
			else			
				this.paddle3X = this.canvasWidth - this.paddleHeight;
		}				
		if (pad4 === "left")
		{	
			if (this.paddle4X - this.padSpeed > 0)
				this.paddle4X -= this.padSpeed;
			else 
				this.paddle4X = 0;
		}	
		else if (pad4 === "right")
		{	
			if (this.paddle4X + this.padSpeed + this.paddleHeight < this.canvasWidth)
				this.paddle4X += this.padSpeed;
			else
				this.paddle4X = this.canvasWidth - this.paddleHeight;
		}	
		this.gameState.paddle.p3 = this.paddle3X / this.canvasWidth;
		this.gameState.paddle.p4 = this.paddle4X / this.canvasWidth;
	}
	
	check()
	{
		if (this.x + this.ballRadius >= this.canvasWidth || this.x - this.ballRadius <= 0 
			|| this.y + this.ballRadius >= this.canvasHeight || this.y - this.ballRadius <= 0)
			this.point(this.lastPaddle);
		else if (this.distBallPad4(this.x, this.y) <= 0)		
		{
			this.lastPaddle = "p4";			
			if (this.padTouch4 === false)
			{
				this.signY = -this.signY;
				if (this.corner === true)
					this.signX = -this.signX;
				this.padTouch4 = true;
				this.speed();
				this.padTouch1 = false;
				this.padTouch2 = false;
				this.padTouch3 = false;
				this.wallTouch = false;
				this.set_wall();
				this.nbrTouch++;
			}
		}
		else if (this.distBallPad3(this.x, this.y) <= 0)		
		{
			this.lastPaddle = "p3";
			if (this.padTouch3 === false)
			{
				this.signY = -this.signY;
				if (this.corner === true)
					this.signX = -this.signX;
				this.padTouch3 = true;
				this.speed();
				this.padTouch1 = false;
				this.padTouch2 = false;
				this.padTouch4 = false;
				this.wallTouch = false;
				this.set_wall();
				this.nbrTouch++;
			}
		}
		else if (this.distBallPad2(this.x, this.y) <= 0)
		{
			this.lastPaddle = "p2";			
			if (this.padTouch2 === false)
			{
				this.signX = -this.signX;
				if (this.corner === true)
					this.signY = -this.signY;			
				this.padTouch2 = true;
				this.speed();
				this.padTouch1 = false;
				this.padTouch3 = false;
				this.padTouch4 = false;
				this.wallTouch = false;
				this.set_wall();
				this.nbrTouch++;
			}			
		}		
		else if (this.distBallPad1(this.x, this.y) <= 0)		
		{
			this.lastPaddle = "p1";			
			if (this.padTouch1 === false)
			{
				this.signX = -this.signX;
				if (this.corner === true)
					this.signY = -this.signY;
				this.padTouch1 = true;
				this.speed();
				this.padTouch2 = false;
				this.padTouch3 = false;
				this.padTouch4 = false;
				this.wallTouch = false;
				this.set_wall();
				this.nbrTouch++;
			}
		}
		else if (this.wally && this.wall === 1 && this.isWallTouched(this.x, this.y))
		{
			if (this.wallTouch === false)
			{
				this.signX = -this.signX;
				this.signY = -this.signY;
				this.wallTouch = true;
				this.speed();
				this.padTouch1 = false;
				this.padTouch2 = false;
				this.padTouch3 = false;
				this.padTouch4 = false;
			}			
		}				
		// console.log("lastPaddle = " + this.lastPaddle);
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
			this.padTouch1 = false;
			this.padTouch2 = false;
			this.padTouch3 = false;
			this.padTouch4 = false;
			this.lastPaddle = "";
			this.dx = this.ballSpeed * getRandom(0.1, 1.1);
			this.dy = this.ballSpeed * getRandom(0.1, 1.1);
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
			{
				this.gameState.ball.x = 1 - (this.x / this.canvasWidth);	
				this.gameState.ball.y = 1 - (this.y / this.canvasHeight);
			}
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
			// console.log("wall = " + this.wall);
		}
	}

	speed()
	{
		if (this.speedy)
		{
			this.dx = this.ballSpeed * getRandom(0.5, 1.5);
			this.dy = this.ballSpeed * getRandom(0.5, 1.5);
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

	distBallPad4(xB, yB)
	{
		const xP = this.paddle4X + this.paddleHeight;	
		const yP = this.canvasHeight - this.paddleWidth;

		if (xB >= this.paddle4X && xB <= xP)
			return (this.corner = false, yP - (yB + this.ballRadius));	
		if (xB > xP)
			return (this.corner = true, Math.sqrt((xB - xP) * (xB - xP) + (yB - yP) * (yB - yP)) - this.ballRadius);
		if (xB < this.paddle4X)
			return (this.corner = true, Math.sqrt((yB - yP) * (yB - yP) + (xB - this.paddle4X) * (xB - this.paddle4X)) - this.ballRadius);
	}

	distBallPad3(xB, yB)
	{
		const xP = this.paddle3X + this.paddleHeight;	
		const yP = this.paddleWidth;

		if (xB >= this.paddle3X && xB <= xP)		
			return (this.corner = false, (yB - this.ballRadius) - yP);	
		if (xB > xP)
			return (this.corner = true, Math.sqrt((xB - xP) * (xB - xP) + (yB - yP) * (yB - yP)) - this.ballRadius);
		if (xB < this.paddle3X)
			return (this.corner = true, Math.sqrt((yB - yP) * (yB - yP) + (xB - this.paddle3X) * (xB - this.paddle3X)) - this.ballRadius);
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

	isWallTouched(xB, yB)
	{
		const xB1 = xB - this.ballRadius;
		const xB2 = xB + this.ballRadius;
		const yB3 = yB - this.ballRadius;
		const yB4 = yB + this.ballRadius;		

		const xW1 = this.canvasWidth / 2 - this.paddleWidth / 2;
		const xW2 = this.canvasWidth / 2 + this.paddleWidth / 2;		
		const yW3 = this.canvasHeight / 2 - this.paddleWidth / 2;
		const yW4 = this.canvasHeight / 2 + this.paddleWidth / 2;
		
		if (xW1 <= xB1 && xB1 <= xW2)
			return (true);
		if (xW1 <= xB2 && xB2 <= xW2)
			return (true);
		if (yW3 <= yB3 && yB3 <= yW4)
			return (true);
		if (yW3 <= yB4 && yB4 <= yW4)
			return (true);		
		return (false);		
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
				else
				{
					for (let clt_skt of this.players)
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

	point(lastPaddle)
	{
		this.lost = true;
		if (lastPaddle === "")
			return ;
		if (lastPaddle === "p1")
		{
			this.s1++;			
			// this.ps1++;
			this.gameState.score.p1 = this.s1;			
			if (this.s1 >= this.limit)
			{
				this.winner = this.users[0]; //"p1";
				if (this.winner === "" || this.winner === null)
					this.winner = "Player1";
				this.winnerId = this.usersId[0];
				this.gameState.winner = this.winner;
				clearInterval(this.intervalId);
			}
		}	
		else if (lastPaddle === "p2")
		{
			this.s2++;			
			// this.ps2++;
			this.gameState.score.p2 = this.s2;
			if (this.s2 >= this.limit)
			{
				this.winner = this.users[1]; //"p2";
				if (this.winner === "" || this.winner === null)
					this.winner = "Player2";
				this.winnerId = this.usersId[1];
				this.gameState.winner = this.winner;
				clearInterval(this.intervalId);
			}
		}
		else if (lastPaddle === "p3")
		{
			this.s3++;
			// this.ps3++;
			this.gameState.score.p3 = this.s3;
			if (this.s3 >= this.limit)
			{
				this.winner = this.users[2]; //"p3";
				if (this.winner === "" || this.winner === null)
					this.winner = "Player3";
				this.winnerId = this.usersId[2];
				this.gameState.winner = this.winner;
				clearInterval(this.intervalId);
			}
		}
		else if (lastPaddle === "p4")
		{
			this.s4++;
			// this.ps4++;
			this.gameState.score.p4 = this.s4;
			if (this.s4 >= this.limit)
			{
				this.winner = this.users[3]; //"p4";
				if (this.winner === "" || this.winner === null)
					this.winner = "Player4";
				this.winnerId = this.usersId[3];
				this.gameState.winner = this.winner;
				clearInterval(this.intervalId);
			}
		}		
	}	
}


/***************************************************************************************/
/*************************** Tools *****************************************************/
/***************************************************************************************/

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

// function sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

// reset padTouch crossing the middle --> when touch another pad
// if (this.canvasWidth / 2 - this.ballRadius <= this.x && this.x <= this.canvasWidth / 2 + this.ballRadius)
// {
// 	this.padTouch1 = false;
// 	this.padTouch2 = false;
// }
// if (this.canvasHeight / 2 - this.ballRadius <= this.y && this.y <= this.canvasHeight / 2 + this.ballRadius)
// {
// 	this.padTouch3 = false;
// 	this.padTouch4 = false;
// }	
// reset padTouch crossing the middle 