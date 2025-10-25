import { playMulti } from '../game/client4.js'
import { GameSettings } from '../utils/types.js';

function playerNameDisplay(id:string, name:string = "Player_Name") : HTMLHeadingElement {
	const playerDisplay = document.createElement('h1');
	playerDisplay.id = id;
	playerDisplay.textContent = name;
	return (playerDisplay);
}

// function playerKey(up:string, down:string) : HTMLDivElement {
// 	const mainDiv = document.createElement('div');
// 	mainDiv.classList = "font-normal text-center text-gray-300 text-6xl space-y-32 w-full max-w-[100px]";

// 	const upKey = document.createElement('h1');
// 	upKey.textContent = up;

// 	const downKey = document.createElement('h1');
// 	downKey.textContent = down;

// 	mainDiv.appendChild(upKey);
// 	mainDiv.appendChild(downKey);

// 	return (mainDiv);
// }

// let settings = {
// 	tournamentId: "",
// 	local: false,
// 	multi: true,
// 	options: { speedy: false, paddy: false, wally: true, mirry: false },		
// 	players : {
// 		player1: { id: 0, alias: "multi1" },
// 		player2: { id: 0, alias: "multi2" },
// 		player3: { id: 0, alias: "multi3" },
// 		player4: { id: 0, alias: "multi4" }
//  	}
// }

// export async function renderMulti() {
export async function renderMulti(settings: GameSettings) {
	const appContainer = document.getElementById("app");
	if (!appContainer)
		return ;
	appContainer.innerHTML = '';
	const mainDiv = document.createElement('div');
	mainDiv.classList = "space-y-5 text-[#36BFB1]";

	// // Player Names
	// const playerNameDiv = document.createElement('div');
	// playerNameDiv.classList = "flex justify-between items-center-safe max-w-[1350px] min-w-[600px] mx-14 text-center text-4xl";
	// playerNameDiv.appendChild(playerNameDisplay("Player1NameDisplay", "P1"));	
	// playerNameDiv.appendChild(playerNameDisplay("Player2NameDisplay", "P2"));
	const player3NameDiv = document.createElement('div');
	const player3NameH1 = document.createElement('h1');
	player3NameH1.textContent = settings.players.player3.alias; //"P3";
	player3NameDiv.classList = "flex justify-center";		
	player3NameDiv.appendChild(player3NameH1)
	const player4NameDiv = document.createElement('div');
	const player4NameH1 = document.createElement('h1');
	player4NameH1.textContent = settings.players.player4.alias;
	player4NameDiv.classList = "flex justify-center";
	player4NameDiv.appendChild(player4NameH1)

	// Players Keys and Game Canvas
	const gameDiv = document.createElement('div');
	gameDiv.classList = "flex justify-center items-center gap-6 w-full px-4";	
	
	// gameDiv.appendChild(playerKey("w", "s"));	
	const player1NameH1 = document.createElement('h1');
	player1NameH1.textContent = settings.players.player1.alias; // "P1";	
	gameDiv.appendChild(player1NameH1)
	
	const canvas4 = document.createElement('canvas');
	canvas4.id = 'canvasGame4';
	canvas4.classList = "border border-2 border-[#41D9D9]";	
	canvas4.width = 600;
	canvas4.height = 600;	
	gameDiv.appendChild(canvas4);			
	
	const player2NameH1 = document.createElement('h1');
	player2NameH1.textContent = settings.players.player2.alias; //"P2";
	gameDiv.appendChild(player2NameH1)
	
	const gameover4 = document.createElement('pre');	
	gameover4.id = "gameover4";	
	gameover4.className = "flex justify-center text-center text-[#36BFB1] font-medium";	//"flex justify-center";	
	// gameover4.textContent = 'Press space to start\n';	
	
	const output4 = document.createElement('table');
	output4.id = "output4";	
	output4.className = "text-center border border-[#41D9D9] border-collapse w-full";

	const outTr0 = document.createElement('tr');	
	const outP1 = document.createElement('td');
	outP1.className = "border border-[#41D9D9]";
	outP1.textContent = settings.players.player1.alias;
	outTr0.appendChild(outP1);
	const outP2 = document.createElement('td');
	outP2.className = "border border-[#41D9D9]";
	outP2.textContent = settings.players.player2.alias;
	outTr0.appendChild(outP2);
	const outP3 = document.createElement('td');
	outP3.className = "border border-[#41D9D9]";
	outP3.textContent = settings.players.player3.alias;
	outTr0.appendChild(outP3);
	const outP4 = document.createElement('td');
	outP4.className = "border border-[#41D9D9]";
	outP4.textContent = settings.players.player4.alias;
	outTr0.appendChild(outP4);
	output4.appendChild(outTr0);

	const outTr = document.createElement('tr');	
	const outS1 = document.createElement('td');
	outS1.className = "border border-[#41D9D9]";
	outS1.textContent = "0";
	outTr.appendChild(outS1);
	const outS2 = document.createElement('td');
	outS2.className = "border border-[#41D9D9]";
	outS2.textContent = "0";
	outTr.appendChild(outS2);
	const outS3 = document.createElement('td');
	outS3.className = "border border-[#41D9D9]";
	outS3.textContent = "0";
	outTr.appendChild(outS3);
	const outS4 = document.createElement('td');
	outS4.className = "border border-[#41D9D9]";
	outS4.textContent = "0";
	outTr.appendChild(outS4);
	output4.appendChild(outTr);	
	
	const wrap_output4 = document.createElement('div');
	wrap_output4.className = "mt-5";
	wrap_output4.appendChild(output4);
	mainDiv.appendChild(wrap_output4);
	// mainDiv.appendChild(output4);
	
	mainDiv.appendChild(player3NameDiv);
	mainDiv.appendChild(gameDiv);
	mainDiv.appendChild(player4NameDiv);
	mainDiv.appendChild(gameover4);
	appContainer.appendChild(mainDiv);	
	
	return (playMulti(settings));	
}
