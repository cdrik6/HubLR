import { showAlert } from "../components/alerts.js";
import { navigate } from "../main.js";
import { getCurrentUser } from "../utils/auth.js";
import { gameLobby, userType } from "../utils/types.js";

let lobbyActive : null | string = null;

export function inLobby() : boolean {
	console.log("in lobby:", (lobbyActive !== null));

	console.log("lobbyActive:", lobbyActive);
	return (lobbyActive !== null);
}

function showAlertEvent() {
	showAlert("Button deactivated during a game session");
}

export function updateGameSession(lobbyId: null | string = null){
	const home = document.getElementById('btn-home');
	const account = document.getElementById('account');
	const profile = document.getElementById('profileButton');
	const searchBar = document.getElementById('search-bar');
	if (lobbyId !== null)
	{
		if (home) {
			home.setAttribute("disabled", 'true');
			// home.addEventListener('click', showAlertEvent);
		}
		if (account) {
			account.setAttribute("disabled", 'true')
			// account.addEventListener('click', showAlertEvent);
		}
		if (profile) {
			profile.setAttribute("disabled", 'true')
			// profile.addEventListener('click', showAlertEvent);
		}
		if (searchBar) {
			searchBar.setAttribute("disabled", 'true')
			// searchBar.addEventListener('click', showAlertEvent);
		}
	}
	else
	{
		if (home) {
			home.removeAttribute("disabled")
			home.removeEventListener('click', showAlertEvent);
		}
		if (account) {
			account.removeAttribute("disabled")
			account.removeEventListener('click', showAlertEvent);
		}
		if (profile) {
			profile.removeAttribute("disabled")
			// profile.removeEventListener('click', showAlertEvent);
		}
		if (searchBar) {
			searchBar.removeAttribute("disabled")
			searchBar.removeEventListener('click', showAlertEvent);
		}
	}
	lobbyActive = lobbyId;
}


function createLobbyDisplay(lobby: gameLobby, user: userType) : HTMLDivElement {
	const mainDiv = document.createElement('div');
	mainDiv.classList = 'm-1.5 group flex flex-col items-center bg-neutral-300 p-3.5 rounded-2xl hover:bg-neutral-500 h-40 min-w-40';

	const lobbyName = document.createElement('h2');
	lobbyName.classList = 'text-2xl font-medium group-hover:text-white text-neutral-600';
	
	lobbyName.textContent = lobby.host.alias;
	mainDiv.appendChild(lobbyName);
	
	const totalPlayersDiv = document.createElement('div');
	totalPlayersDiv.classList = 'flex text-2xl font-medium group-hover:text-white space-x-2.5';
	const connectedPlayersTotal = document.createElement('h2');
	connectedPlayersTotal.classList = 'text-2xl font-medium group-hover:text-white text-neutral-600';
	connectedPlayersTotal.textContent = String(lobby.players.length);
	
	totalPlayersDiv.appendChild(connectedPlayersTotal);

	const barText = document.createElement('h2');
	barText.classList = 'group-hover:text-white text-neutral-600';
	barText.textContent = '/';
	
	totalPlayersDiv.appendChild(barText);

	const playersTotal = document.createElement('h2');
	playersTotal.classList = 'group-hover:text-white text-neutral-600';
	playersTotal.textContent = String(lobby.size);
	
	totalPlayersDiv.appendChild(playersTotal);

	mainDiv.appendChild(totalPlayersDiv);

	const lobbyMode = document.createElement('h2');
	lobbyMode.classList = 'text-xl font-medium group-hover:text-white text-neutral-600';
	lobbyMode.textContent = lobby.settings.type;//lobby.mode;
	mainDiv.appendChild(lobbyMode);

	const settings = {
		paddy:false,
		wally:false,
		mirry:false,
		speedy:false,
	}
	// lobby.settings

	const settingsDiv = document.createElement('div');
	settingsDiv.classList = 'grid grid-cols-2 justify-center items-center w-full text-center text-sm font-medium group-hover:text-white';
	if (lobby.settings.options.paddy)
	{
		const paddySet = document.createElement('h2');
		paddySet.textContent = 'paddy';
		settingsDiv.appendChild(paddySet);
	}
	if (lobby.settings.options.wally)
	{
		const wallySet = document.createElement('h2');
		wallySet.textContent = 'wally';
		settingsDiv.appendChild(wallySet);
	}
	if (lobby.settings.options.mirry)
	{
		const mirrySet = document.createElement('h2');
		mirrySet.textContent = 'mirry';
		settingsDiv.appendChild(mirrySet);
	}
	if (lobby.settings.options.speedy)
	{
		const speedySet = document.createElement('h2');
		speedySet.textContent = 'speedy';
		settingsDiv.appendChild(speedySet);
	}

	mainDiv.appendChild(settingsDiv);

	const isPlayerInLobby = lobby.players.map(p => p.id).includes(user.id)

	if (!lobby.isOngoing || isPlayerInLobby)
	{
		console.log("call to lobby")
		mainDiv.addEventListener('click', async () => {
			if (isPlayerInLobby) {
				return navigate(`/lobbies/${lobby.id}`, false);
			}
			const response = await fetch(`/api/lobby/${lobby.id}/player`, {method:'POST', 
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					player: { id:user.id, alias:user.username},
				}),})
			if (response.ok)
			{
				// updateGameSession(`${lobby.id}`);
				navigate(`/lobbies/${lobby.id}`, false);
			}
		})
	}

	return (mainDiv);
}

export async function renderLobbies() {
	const  appContainer = document.getElementById("app");
	if (!appContainer)
		return ;
	appContainer.innerHTML = '';
	const user = await getCurrentUser();
	if (!user)
	{
		appContainer.innerHTML = '<h2>404 Not Found</h2>';
		return ;
	}
	lobbyActive = null;
	const mainDiv = document.createElement('div');
	mainDiv.classList = 'flex-1 m-4 space-y-8';
	const title = document.createElement('h1');
	title.classList = 'text-center text-3xl text-[#36BFB1] font-medium';
	title.textContent = 'Lobbies';
	mainDiv.appendChild(title);

	const lobbiesDiv = document.createElement('div');
	lobbiesDiv.classList = 'flex flex-wrap';

	try {
		const response = await fetch('/api/lobby/', { method : 'GET', credentials : 'include' });
		if (response.ok)
		{
			const data = await response.json();
			const lobbies = data.lobbies;
			console.log(lobbies);
			if (lobbies.length < 1)
				lobbiesDiv.innerHTML = `No Lobby found. Go create one!`;
			else if (await isAlreadyInALobby(lobbies, user, lobbiesDiv))
			{
				console.log("Display only the lobby where the user is");
			}
			else
			{
				lobbies.forEach(async (lobby : gameLobby) => {
					console.log(lobby);
					lobbiesDiv.appendChild(createLobbyDisplay(lobby, user));
				});
			}
		}
	}
	catch (err) {
		console.log(err)
	}

	mainDiv.appendChild(lobbiesDiv);
	appContainer.appendChild(mainDiv);
}

function isAlreadyInALobby(lobbies:any, user: userType, lobbiesDiv: HTMLDivElement): boolean
{	
	for (const lobby of lobbies) 
	{
		console.log(lobby);
		if (lobby.players.map((p:any) => p.id).includes(user.id))
		{
			
			lobbiesDiv.appendChild(createLobbyDisplay(lobby, user));			
			console.log("user = " + user.username);
			return (true);
		}
	};	
	console.log("here");
	return (false);
}