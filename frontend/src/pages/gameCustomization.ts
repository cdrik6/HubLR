import { showAlert } from '../components/alerts.js';
import { navigate } from '../main.js';
import { getCurrentUser } from '../utils/auth.js';
import { userType } from '../utils/types.js';
import { Player } from '../utils/types.js';
import { renderGameEnd } from './afterGameMenu.js';
import { updateGameSession } from './lobbies.js';
import { renderPong } from './pong.js';
import {startTournament} from './tournament.js';

function addGameOption(optionName: string) : HTMLDivElement {
	const mainDiv = document.createElement('div');
	mainDiv.classList = 'mb-4 text-2xl';
	const optionInput = document.createElement('input');
	optionInput.id = optionName + '-checkbox';
	optionInput.type = 'checkbox';
	optionInput.value = '';
	optionInput.classList = 'h-4 w-10 rounded-sm border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500';

	const optionLabel = document.createElement('label');
	optionLabel.htmlFor = optionName + '-checkbox';
	optionLabel.classList = 'ms-0.5 font-medium text-neutral-700';
	optionLabel.textContent = optionName;
	mainDiv.appendChild(optionInput);
	mainDiv.appendChild(optionLabel);
	return (mainDiv);
}

function addPlayerInput(number:number) : HTMLDivElement {
	const mainDiv = document.createElement('div');
	mainDiv.classList = 'text-center py-1';
	mainDiv.id = 'p' + number + '-div';
	const errorMessage = document.createElement('h1');
	errorMessage.classList = 'text-red-400'
	
	const input = document.createElement('input');
	input.id = 'p' + number + '-name';
	input.placeholder = 'player' + number;
	input.classList = 'bg-neutral-100 border border-neutral-400 rounded-sm placeholder:text-neutral-500 text-neutral-700';
	input.defaultValue = 'player' + number;

	input.addEventListener('input', () => {
		const set = new Set([" ", "\t", "\n", "\r"]);
		const username = input.value;
		errorMessage.textContent = '';

		if (!username || username.length > 8)
		{
			errorMessage.textContent = "Invalid username (max : 8 characters)";
			if (mainDiv)
				mainDiv.appendChild(errorMessage);
			return;
		}
		if (([...username].some((char) => set.has(char))))
		{
			errorMessage.textContent = "Invalid username (no spaces allowed in 'username')";
			if (mainDiv)
				mainDiv.appendChild(errorMessage);
			return;
		}
	})
	mainDiv.appendChild(input);
	return (mainDiv);
}

let totalOfPlayers = 3;

function tournamentOption(user: userType | null, isLocal = true) : HTMLDivElement {
	const mainDiv = document.createElement('div');
	mainDiv.classList = "py-5 mx-5 my-3 w-2xl space-y-16 rounded-3xl bg-neutral-200 shadow-2xl text-center";
	
	const playerDivTitle = document.createElement('h1');
	playerDivTitle .classList = 'text-4xl text-neutral-700';
	playerDivTitle.textContent = 'Players';
	
	mainDiv.appendChild(playerDivTitle);

	const playerDisplayDiv = document.createElement('div');
	playerDisplayDiv.classList = 'flex flex-col items-center gap-12';

	const playersTotalDiv = document.createElement('div');
	playersTotalDiv.classList = 'flex items-center space-x-7';
	
	const playersTotalDisplay = document.createElement('h1');
	playersTotalDisplay.id = 'totalOfPlayers';
	playersTotalDisplay.classList = 'text-3xl font-medium text-neutral-700';
	playersTotalDisplay.textContent = '3';

	playersTotalDiv.appendChild(playersTotalDisplay);

	const divButton = document.createElement('div');
	divButton.classList = 'flex space-x-1';
	const addPlayerButton = document.createElement('button');
	addPlayerButton.id = 'addPlayer';
	addPlayerButton.classList = 'rounded-l-2xl bg-neutral-500 px-3.5 py-1 text-3xl text-neutral-50 hover:bg-neutral-400 hover:text-neutral-200';
	addPlayerButton.textContent = '+';
	addPlayerButton.addEventListener('click', async (e)=> {
		e.preventDefault();
		if (totalOfPlayers < 16)
		{
			totalOfPlayers++;
			if (isLocal)
				playersNameDiv.appendChild(addPlayerInput(totalOfPlayers));
			playersTotalDisplay.textContent = String(totalOfPlayers);
			console.log("Player input added");
		}
		else
			console.log("Max of players is 16");
	})

	divButton.appendChild(addPlayerButton);

	const removePlayerButton = document.createElement('button');
	removePlayerButton.id = 'removePlayer';
	removePlayerButton.classList = 'rounded-r-2xl bg-neutral-500 px-3.5 py-1 text-3xl text-neutral-50 hover:bg-neutral-400 hover:text-neutral-200';
	removePlayerButton.textContent = '-';

	removePlayerButton.addEventListener('click', async (e) => {
		e.preventDefault();
		if (totalOfPlayers > 3)
		{
			if (isLocal)
			{
				const input = document.getElementById('p' + totalOfPlayers + '-div');
				if (!input)
					return ;
				input.remove();
			}
			totalOfPlayers--;
			playersTotalDisplay.textContent = String(totalOfPlayers);
		}
	})

	divButton.appendChild(removePlayerButton);

	playersTotalDiv.appendChild(divButton);

	playerDisplayDiv.appendChild(playersTotalDiv);


	if (!isLocal)
	{
		console.log("tournament online")
		mainDiv.appendChild(playerDisplayDiv);
		return (mainDiv);
	}
	
	const playersNameDiv = document.createElement('div');
	playersNameDiv.classList = 'h-fit grid grid-cols-1 space-y-2';
	let index = 0
	if (user)
	{
		const host = document.createElement('h1');
		host.classList = 'text-center placeholder:text-neutral-500 py-1';
		host.textContent = user.username;
		host.id = 'p1-name';
		playersNameDiv.appendChild(host);
		index++;
	}
	for (; index < totalOfPlayers; index++) {
		playersNameDiv.appendChild(addPlayerInput(index + 1));
	}
	playerDisplayDiv.appendChild(playersNameDiv);

	mainDiv.appendChild(playerDisplayDiv);

	return (mainDiv);
}

function multiOption() : HTMLDivElement {
	const mainDiv = document.createElement('div');
	mainDiv.classList = "py-5 mx-5 my-3 w-2xl space-y-16 rounded-3xl bg-neutral-200 shadow-2xl text-center";
	
	const playerDivTitle = document.createElement('h1');
	playerDivTitle .classList = 'text-4xl text-neutral-700';
	playerDivTitle.textContent = 'Players';
	
	mainDiv.appendChild(playerDivTitle);

	const playerDisplayDiv = document.createElement('div');
	playerDisplayDiv.classList = 'flex flex-col items-center gap-12';

	const playersTotalDiv = document.createElement('div');
	playersTotalDiv.classList = 'flex justify-center items-center';
	
	const playersTotalDisplay = document.createElement('h1');
	playersTotalDisplay.classList = 'text-3xl font-medium text-neutral-700';
	playersTotalDisplay.textContent = '4';

	mainDiv.appendChild(playersTotalDisplay);
	
	return (mainDiv);
}

function checkPlayerNames(user : userType | null) : boolean {
	const playersName = new Set();
	const set = new Set([" ", "\t", "\n", "\r"]);
	let index = 0;
	if (user)
	{
		playersName.add(user.username);
		index++;
	}
	for (; index < totalOfPlayers; index++) {
		const element = document.getElementById("p" + (index + 1) + "-name") as HTMLInputElement;
		const playerName = element.value;
	
		if (!playerName || playerName.length > 8)
		{
			showAlert("Invalid player's name found (max : 8 characters)");
			return (false);
		}
		if (([...playerName].some((char) => set.has(char))))
		{
			showAlert("Invalid player's name found (no spaces allowed in player's name)");
			return (false);
		}

		if (playersName.has(playerName))
		{
			showAlert("All players need to have different names");
			return (false);
		}
		playersName.add(playerName);
	}
	console.log("playersName", playersName);
	return (true);
}

export async function renderGameCustomization(gameMode:string, isLocal = true) {
	const  appContainer = document.getElementById("app");
	if (!appContainer)
		return ;
	appContainer.innerHTML = '';
	const user = await getCurrentUser();
	if (!isLocal && !user)
	{
		appContainer.innerHTML = '<h2>404 Not Found</h2>';
		return ;
	}

	const containerDiv = document.createElement('div');
	containerDiv.classList = 'flex w-full flex-col items-center justify-between';

	const mainDiv = document.createElement('div');
	mainDiv.classList = "flex flex-wrap justify-center items-center flex-1 space-x-4 w-full font-medium "

	//Game Customizations
	const gameCustomizationDiv = document.createElement('div');
	gameCustomizationDiv.classList = "py-5 mx-5 my-3 w-2xl space-y-16 rounded-3xl bg-neutral-200 shadow-2xl text-center";

	const customizationTitle = document.createElement('h1')
	customizationTitle.classList = 'text-4xl text-neutral-700';
	customizationTitle.textContent = 'Game customization';
	gameCustomizationDiv.appendChild(customizationTitle);

	const gameOptionsDiv = document.createElement('div');
	gameOptionsDiv.classList = 'mb-4 text-2xl';

	gameOptionsDiv.appendChild(addGameOption('Speedy'));
	gameOptionsDiv.appendChild(addGameOption('Paddy'));
	gameOptionsDiv.appendChild(addGameOption('Wally'));
	gameOptionsDiv.appendChild(addGameOption('Mirry'));

	gameCustomizationDiv.appendChild(gameOptionsDiv);

	mainDiv.appendChild(gameCustomizationDiv);

	//Players Names
	if (gameMode.match("tournament"))
	{
		console.log("tournament call");
		totalOfPlayers = 3;
		mainDiv.appendChild(tournamentOption(user, isLocal));
	}
	else if (gameMode.match("multi") && !isLocal)
	{
		console.log("multi call");
		totalOfPlayers = 4;
		// mainDiv.appendChild(multiOption());
	}
	else
	{
		console.log("1v1 call");
		totalOfPlayers = 2;
	}

	const createButton = document.createElement('button');
	createButton.id = 'createButton';
	createButton.classList = 'rounded-md border-2 border-neutral-600 bg-neutral-400 px-3.5 py-2.5 text-4xl text-neutral-700 hover:bg-neutral-600 hover:text-neutral-200';
	createButton.textContent = 'Create';
	createButton.addEventListener('click', async ()=>{

		console.log("start match");
		const options = {
			speedy: (document.getElementById('Speedy-checkbox') as HTMLInputElement).checked,
			paddy: (document.getElementById('Paddy-checkbox') as HTMLInputElement).checked,
			wally: (document.getElementById('Wally-checkbox') as HTMLInputElement).checked,
			mirry: (document.getElementById('Mirry-checkbox') as HTMLInputElement).checked
		};
		console.log(options);
		console.log(isLocal);
		if (isLocal && gameMode.match("tournament") && checkPlayerNames(user))
		{
			const size = Number(document.getElementById('totalOfPlayers')!.textContent);
			let players = [] as Array<Player>;
			let alias;
			let i = 1;
			if (user)
			{
				players.push({alias: user.username})
				i++;
			}
			for (; i <= size; i++) {
				alias = (document.getElementById(`p${i}-name`) as HTMLInputElement).value.trim();
				if (alias == '')
					return (console.log("Error: Players list contains empty player"));
				if (players.map(e => e.alias).includes(alias))
					return (console.log("Error: Players list contains same player alias several times"));
				players.push({alias: alias})
			}
			return startTournament(players, options);
		}
		const isMulti = gameMode.match("multi")
		
		
		
		let settings  = {
			tournamentId: "",
			local: isLocal,
			multi: (!isLocal && !(!isMulti)),
			options: options,
			players : {
				player1: {alias: ((isLocal) ? "Player1" : user!.username)},
				player2: {alias: ((isLocal) ? "Player2" : "")},
				player3: {alias: ""},
				player4: {alias: ""}
			},
			viewers: [] // or [{id: 0, alias: ""}]
		}
		console.log(settings);
		if (!isLocal) {
			try {
				console.log(totalOfPlayers);
				const response = await fetch('/api/lobby/', 
				{
					method:'POST',
					credentials: 'include',
					headers: { 'Content-Type': 'application/json; charset=UTF-8',},
					body: JSON.stringify({
						host: { id: user?.id , alias: user?.username},
						size: totalOfPlayers,
						settings: {type:gameMode, options:settings.options}
					}),
				})
				if (response.ok)
				{
					const lobbyId = await response.json();
					console.log(lobbyId);
					updateGameSession(lobbyId.lobbyId);
					navigate(`/lobbies/${lobbyId.lobbyId}`, false);
				}
				else
					showAlert("Error creating a lobby");
			} catch (error) {
				showAlert("Error creating a lobby");
			}
		}
		else 
		{
			await renderPong(settings);
			await new Promise(r => setTimeout(r, 2500));
			renderGameEnd(settings);
		}
		// if (isMulti && ) renderMulti();
		
	})

	containerDiv.appendChild(mainDiv);
	containerDiv.appendChild(createButton);
	appContainer.appendChild(containerDiv);

}