import { playPong } from '../game/client.js';
import { GameSettings } from '../utils/types.js';

let localId = 1;

// let settings = {
// 	tournamentId: "t123",
// 	local: false,
// 	multi: false,
// 	options: { speedy: false, paddy: false, wally: false, mirry: false },
// 	players : {
// 		player1: { id: 1, alias: "atari1" },
// 		player2: { id: 2, alias: "atari2" },
// 		player3: { id: 0, alias: "atari" },
// 		player4: { id: 0, alias: "lenovo" }
//  	}
// }

// async function gameSettingsCreation() {
	
// 	const result = {};
// 	return (result);
// }

// function mergeOptions(defaultOptions, options, allowedKeys) {
//     const filtered = Object.keys(options)
//         .filter(key => allowedKeys.includes(key))
//         .reduce((obj, key) => {
//             obj[key] = options[key];
//             return obj;
//         }, {});
    
//     return { ...defaultOptions, ...filtered };
// }

// const defaultOptions = {
//     method: 'GET',
//     headers: { 'Content-Type': 'application/json' },
//     body: null
// };

// const options = {
//     method: 'POST',
//     users: ['Daniel', 'Ana'], // 🚫 
//     body: JSON.stringify({ id: 1 })
// };

// const allowedKeys = ['method', 'headers', 'body'];

// const config = mergeOptions(defaultOptions, options, allowedKeys);

// console.log(config);

// // {
// //   method: 'POST',
// //   headers: { 'Content-Type': 'application/json' },
// //   body: '{"id":1}'
// // }


function playerKey(up:string, down:string) : HTMLDivElement {
	const mainDiv = document.createElement('div');
	mainDiv.classList = "font-normal text-center text-[#41D9D9] text-6xl space-y-32 w-full max-w-[100px]";

	const upKey = document.createElement('h1');
	upKey.textContent = up;

	const downKey = document.createElement('h1');
	downKey.textContent = down;

	mainDiv.appendChild(upKey);
	mainDiv.appendChild(downKey);

	return (mainDiv);
}

function playerNameDisplay(id:string, name:string = "Player_Name") : HTMLHeadingElement {
	const playerDisplay = document.createElement('h1');
	playerDisplay.id = id;
	playerDisplay.textContent = name;
	playerDisplay.classList = 'text-[#36BFB1]'
	return (playerDisplay);
}

 export async function renderPong(settings: GameSettings) {	

	// if (settings.players.player1.alias === "")
	// {
	// 	settings.players.player1.alias = "local" + localId + "_P1";
	// 	localId++;
	// }
	// if (settings.players.player2.alias === "")
	// {
	// 	settings.players.player2.alias = "local" + localId + "_P2";
	// 	localId++;
	// }
	
	const appContainer = document.getElementById("app");
	if (!appContainer)
		return ;
	appContainer.innerHTML = '';
	const mainDiv = document.createElement('div');
	mainDiv.classList = "space-y-5";

	// Player Names
	const playerNameDiv = document.createElement('div');
	playerNameDiv.classList = "flex justify-between items-center-safe max-w-[1350px] min-w-[600px] mx-14 text-center text-4xl";
	playerNameDiv.appendChild(playerNameDisplay("Player1NameDisplay", settings.players.player1.alias));
	playerNameDiv.appendChild(playerNameDisplay("Player2NameDisplay", settings.players.player2.alias));

	// Players Keys and Game Canvas
	const gameDiv = document.createElement('div');
	gameDiv.classList = "flex justify-center items-center gap-6 w-full h-full px-4";	
	if (settings.local === true)
		gameDiv.appendChild(playerKey("w", "s"));			
	const canvas = document.createElement('canvas');
	canvas.id = 'canvasGame';
	canvas.classList = "border border-2 border-[#41D9D9]";	
	canvas.width = 600;
	canvas.height = 400;	
	gameDiv.appendChild(canvas);	
	if (settings.local === true)
		gameDiv.appendChild(playerKey("↑", "↓"));
	
	const output = document.createElement('pre');
	output.id = "output";	
	output.classList = "flex justify-center text-center text-[#36BFB1] font-medium";		
	// output.textContent = 'Press space to start\n';
	// if (settings.local === false)
	// 	output.textContent += 'You can play with w/s or ↑/↓ keys\n';	
	
	
	mainDiv.appendChild(playerNameDiv);
	mainDiv.appendChild(gameDiv);
	mainDiv.appendChild(output);
	appContainer.appendChild(mainDiv);	

	
	
	return (playPong(settings));	 	
}
