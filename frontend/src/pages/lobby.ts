import { showAlert } from "../components/alerts.js";
import { navigate } from "../main.js";
import { getCurrentUser } from "../utils/auth.js";
import { gameLobby, GameSettings, LobbyGameSettings, Player } from "../utils/types.js";
import { updateGameSession } from "./lobbies.js";
import { renderMulti } from "./multiplayer.js";
import { renderPong } from "./pong.js";
import { startTournament } from "./tournament.js";

function playerInput(playerNumber:number) : HTMLDivElement {
	const mainDiv = document.createElement('div');
	mainDiv.classList = 'justify-around';
	const input = document.createElement('h1');
	input.id = 'p' + playerNumber + '-name';
	input.textContent = 'player' + playerNumber;
	input.classList = 'rounded-sm border border-neutral-400 bg-neutral-100 text-neutral-600 py-1 text-center ';
	mainDiv.appendChild(input);

	return (mainDiv);
}

function playerDisplay(playerNumber: number, user: Player ) {
	const display = document.createElement('h1');
	display.id = 'p' + playerNumber + '-name';
	display.classList = 'rounded-sm py-1 text-center text-neutral-700';
	display.textContent = user.alias;
	return (display);
	
}

function settingDisplayDiv(setting: LobbyGameSettings ) : HTMLDivElement {
	
	console.log("setting:", setting);
	const mainDiv = document.createElement('div');
	mainDiv.classList = 'w-1/4 min-w-3xs flex flex-col justify-around items-center h-full p-5 rounded-3xl bg-neutral-200 text-center shadow-2xl';
	const modeDisplay = document.createElement('h1');
	modeDisplay.classList = 'text-4xl text-emerald-500';
	modeDisplay.textContent = setting.type;

	mainDiv.appendChild(modeDisplay);
	const activatedSettingsDiv = document.createElement('div');
	activatedSettingsDiv.classList = 'w-full';
	const optionsTitle = document.createElement('h1');
	optionsTitle.classList = 'text-center w-full underline text-neutral-700';
	optionsTitle.textContent = 'Activated Settings:';

	activatedSettingsDiv.appendChild(optionsTitle);

	const optionsDiv = document.createElement('div');
	optionsDiv.classList = 'text-2xl grid grid-cols-2';

	let flag = false;
	//see if there is a better option
	if (setting.options.paddy)
	{
		const option = document.createElement('h1');
		option.classList = 'py-1 text-center text-neutral-700';
		option.textContent = 'Paddy';
		optionsDiv.appendChild(option);
		flag = true;
	}
	if (setting.options.wally)
	{
		const option = document.createElement('h1');
		option.classList = 'py-1 text-center text-neutral-700';
		option.textContent = 'Wally';
		flag = true;
		optionsDiv.appendChild(option);		
	}
	if (setting.options.mirry)
	{
		const option = document.createElement('h1');
		option.classList = 'py-1 text-center text-neutral-700';
		option.textContent = 'Mirry';
		optionsDiv.appendChild(option);
		flag = true;

	}
	if (setting.options.speedy)
	{
		const option = document.createElement('h1');
		option.classList = 'py-1 text-center text-neutral-700';
		option.textContent = 'Speedy';
		optionsDiv.appendChild(option);
		flag = true;
	}
	activatedSettingsDiv.appendChild(optionsDiv);

	if (flag)
		mainDiv.appendChild(activatedSettingsDiv);
	return (mainDiv);
}

async function checkLobbyStart(lobbyId: string) : Promise<boolean> {
	const responseLobby = await fetch(`/api/lobby/${lobbyId}`, {method:'GET', credentials: 'include'});
	const lobby = await responseLobby.json() as gameLobby;
	return ((lobby.players.length == lobby.size));
}

export async function renderLobby(lobbyId:string) {
	const  appContainer = document.getElementById("app");
	if (!appContainer)
		return ;
	appContainer.innerHTML = '';
	const user = await getCurrentUser();
	if (!user)
	{
		console.log("no user renderLobby");
		appContainer.innerHTML = '<h2>404 Not Found</h2>';
		return ;
	}
	const responseLobby = await fetch(`/api/lobby/${lobbyId}`, {method:'GET', credentials: 'include'});
	const lobby = await responseLobby.json() as gameLobby;
	console.log(lobby)
	// console.log(lobby.players.includes({ id:user.id, alias:user.username}));
	if (!responseLobby.ok || !lobby)// || !lobby.players.includes({ id:user.id, alias:user.username}))
	{
		appContainer.innerHTML = `<h2>404 Not Found</h2><h2>Lobby Not Found</h2>`;
		return ;
	}

	const clt_wskt = new WebSocket(`${location.origin}/api/lobby/ws/${lobbyId}`);
	let ping:number;

	clt_wskt.addEventListener('open', () => {	
		console.log('Connected to WebSocket\n');
		ping = setInterval( () => { clt_wskt.send(JSON.stringify({ ping: "ping" })) }, 30000);
		setInterval( () => { console.log("ping from lobby") }, 30000);
	});	
	
	clt_wskt.addEventListener('error', err => {
			console.error('Error: ' + err + '\n');
	});

	clt_wskt.addEventListener('close', async () => {
		clearInterval(ping);
		console.log('WebSocket closed\n');
		const res = await fetch(`/api/lobby/${lobbyId}`, {credentials: 'include'});
		if (res.status == 404) {
			if (user.id == lobby.host.id) {
				updateGameSession();
				history.replaceState({}, '', '/online/tournament');
				navigate('/online');
			}
			else
				location.reload();
		}
	});

	clt_wskt.addEventListener('message', async (srv_msg) => {
		try	{			
			const data = JSON.parse(srv_msg.data);
			console.log('Received from lobby websocket server: ' + JSON.stringify(data));
			const res = await fetch(`/api/lobby/${lobbyId}`, {credentials: 'include'});
			const body = await res.json() as gameLobby;
			if (data.reload) {
				return location.reload();
			}
			if (!data.sessionId)
			{
				let setting: GameSettings = {
					tournamentId: "",
					local: false,
					multi: (body.settings.type === "multi"),
					options: body.settings.options,
					players: {
						player1: body.players[0],
						player2: body.players[1],
						player3: (body.settings.type === "multi") ? body.players[2] : { id: 0, alias: "" },
						player4: (body.settings.type === "multi") ? body.players[3] : { id: 0, alias: "" }
					},
					viewers: body.players
				}
				if (body.settings.type === "1v1") {
					console.log(setting);		
					await renderPong(setting);
					await new Promise(r => setTimeout(r, 2500));
				}
				else if (body.settings.type === 'multi') {
					await renderMulti(setting);
					await new Promise(r => setTimeout(r, 2500));
				}
				
				// if (user.username === lobby.host.alias)
				// {
				// 	const res = await fetch(`/api/lobby/${lobbyId}`, {
				// 		method: 'PATCH',
				// 		credentials: 'include', 
				// 		headers: { 'Content-Type': 'application/json; charset=UTF-8' },
				// 		body: JSON.stringify({ isOngoing: false })
				// 	});

				// 	// delete the lobby once game over
				// 	// const response = await fetch(`/api/lobby/${lobbyId}`, {
				// 	// 	method: 'DELETE', 
				// 	// 	credentials: 'include',
				// 	// 	headers: { 'Content-Type': 'application/json' },
				// 	// 	body: JSON.stringify({ player: {id: user.id, alias: user.username} })
				// 	// });
				// }		
				// renderLobby(lobbyId);
				
			}
			else {				
				await startTournament(body.players, body.settings.options, false, data.sessionId); 
			}
		}
		catch (e) {
			console.error('Invalid JSON received by lobby: ', srv_msg.data);
		}		
		if (user.username === lobby.host.alias)
		{
			const res = await fetch(`/api/lobby/${lobbyId}`, {
				method: 'PATCH',
				credentials: 'include', 
				headers: { 'Content-Type': 'application/json; charset=UTF-8' },
				body: JSON.stringify({ isOngoing: false })
			})
			// delete the lobby once game over
			// const response = await fetch(`/api/lobby/${lobbyId}`, {
			// 	method: 'DELETE', 
			// 	credentials: 'include',
			// 	headers: { 'Content-Type': 'application/json' },
			// 	body: JSON.stringify({ player: {id: user.id, alias: user.username} })
			// });
		}		
		renderLobby(lobbyId);

	});
	
	// const lobby = {
	// 	size: 2,
	// 	host: "dani-",
	// 	players: [{id:1,alias:"dani-"}],
	// 	onGoing: true,
	// 	settings: {
	// 		mode: "1 vs 1",
	// 		multi: false,
	// 		options: {
	// 			speedy: false,
	// 			paddy: false,
	// 			wally: false,
	// 			mirry: false
	// 		}
	// 	}
	// }

	// updateGameSession(lobbyId);
	console.log(lobby);
	const title = document.createElement('h1');
	title.classList = 'pt-4 text-center text-3xl font-medium text-[#36BFB1] top-0';
	title.textContent = 'Lobby'; //Add Lobby name?

	appContainer.appendChild(title);

	const mainDiv = document.createElement('div');
	mainDiv.classList = 'flex justify-center items-center h-full w-full';

	const displayContainer = document.createElement('div');
	displayContainer.classList = 'flex w-full h-fit p-5 flex-wrap justify-center items-center font-medium gap-9';

	displayContainer.appendChild(settingDisplayDiv(lobby.settings));

	const playersDisplayContainer = document.createElement('div');
	playersDisplayContainer.classList = 'h-full p-5 w-1/2 min-w-3xs flex flex-col justify-center rounded-3xl bg-neutral-200 text-center shadow-2xl'

	const playersDisplayTitle = document.createElement('h1');
	playersDisplayTitle.classList = 'text-4xl text-neutral-700';
	playersDisplayTitle.textContent = 'Players';
	playersDisplayContainer.appendChild(playersDisplayTitle);

	const playerDisplayDiv = document.createElement('div');
	playerDisplayDiv.classList = 'grid grid-cols-1 space-y-2';
	
	for (let index = 0; index < lobby.players.length; index++) {
		playerDisplayDiv.appendChild(playerDisplay(index + 1, lobby.players[index]));
	}

	for (let index = lobby.players.length; index < lobby.size; index++) {
		playerDisplayDiv.appendChild(playerInput(index + 1));
	}

	playersDisplayContainer.appendChild(playerDisplayDiv);

	displayContainer.appendChild(playersDisplayContainer);

	mainDiv.appendChild(displayContainer);

	appContainer.appendChild(mainDiv);

	const buttonDiv = document.createElement('div');
	buttonDiv.classList = 'flex space-x-5 text-neutral-500'
	const deleteButton = document.createElement('button');
	deleteButton.classList = 'text-3xl font-medium bg-neutral-300 p-3 rounded-xl border-2 border-neutral-500 hover:bg-neutral-500 hover:text-white'
	if (user.username === lobby.host.alias)
	{
		const startButton = document.createElement('button');
		startButton.classList = 'text-3xl font-medium bg-neutral-300 p-3 rounded-xl border-2 border-neutral-500 hover:bg-neutral-500 hover:text-white';
		startButton.textContent = 'Start';
		startButton.addEventListener('click', async () => {
			try {				
				if (!await checkLobbyStart(lobbyId))
					return showAlert("Waiting for players to start the session");
				const res = await fetch(`/api/lobby/${lobbyId}`, {
					method:'PATCH',
					credentials:'include',
					headers:{ 'Content-Type': 'application/json; charset=UTF-8' },
					body: JSON.stringify({ isOngoing: true })
				});
				if (!res.ok)
				{
					showAlert("Error starting game session");
					return ;
				}
				clt_wskt.send(JSON.stringify({ message: "start" }));
				console.log("start sent by host");
				
			}
			catch (error) {
				console.log(error);
			}
		})		
		buttonDiv.appendChild(startButton);

		deleteButton.textContent = 'Delete Lobby';
		deleteButton.addEventListener('click', async () => {
			console.log("delete lobby");
			const response = await fetch(`/api/lobby/${lobbyId}`, {
				method:'DELETE', 
				credentials: 'include'
			});
			if (response.ok)
			{
				history.replaceState({}, '', '/online/tournament');
				updateGameSession();
				navigate('/online');
			}
		})
	}
	else
	{		
		deleteButton.textContent = 'Leave Lobby';
		deleteButton.addEventListener('click', async () => {
			console.log('leave lobby')
			const response = await fetch(`/api/lobby/${lobbyId}/player`, {
				method:'DELETE', 
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					player: {id: user.id, alias: user.username},
				}),
			})
			if (response.ok)
			{
				history.replaceState({}, '', '/online/tournament');
				navigate('/online/lobbies', false);
				// updateGameSession();
			}
		});
	}

	buttonDiv.appendChild(deleteButton);
	appContainer.appendChild(buttonDiv);
}