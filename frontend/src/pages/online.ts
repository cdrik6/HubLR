import { authentication } from "../authentication/logIn.js";
import { showAlert } from "../components/alerts.js";
import * as buttons from "../components/buttons.js"
import { navigate } from "../main.js";
import { getCurrentUser } from "../utils/auth.js";

export async function renderCreation() {
	
	if (!(await getCurrentUser())) 
	{
		showAlert("please login");		
		navigate('/');
		return ;
	} 
	
	const  appContainer = document.getElementById("app");
	if (!appContainer)
		return ;
	appContainer.innerHTML = '';
	const playVsButton = buttons.createPrincipalButton("playVsButton", "1 vs 1");
	playVsButton.addEventListener("click", async () => {
		console.log("open online 1v1 game")
		navigate("/online/playervsplayer");
	})

	const playTournamentButton = buttons.createPrincipalButton("playTournamentButton", "Tournament");
	playTournamentButton.addEventListener("click", async () => {
		console.log("open online tournament mode")
		navigate("/online/tournament");		
	})

	const playMultiplayerButton = buttons.createPrincipalButton("playMultiplayerButton", "Multiplayer");
	playMultiplayerButton.addEventListener("click", async () => {
		console.log("open online multiplayer mode")
		navigate("/online/multiplayer");
	})

	appContainer.appendChild(playVsButton);
	appContainer.appendChild(playTournamentButton);
	appContainer.appendChild(playMultiplayerButton);
}

export async function renderOnline() {
	
	if (!(await getCurrentUser())) 
	{
		showAlert("please login");		
		navigate('/');
		return ;
	} 
	
	const  appContainer = document.getElementById("app");
	if (!appContainer)
		return ;
	appContainer.innerHTML = '';
	const createGameButton = buttons.createPrincipalButton("createGameButton", "Create");
	createGameButton.addEventListener("click", async () => {
		console.log("open online 1v1 game")
		navigate('/online/create');
		// history.pushState({}, '', location.pathname);
	})

	const searchGameButton = buttons.createPrincipalButton("searchLobbyButton", "Search");
	searchGameButton.addEventListener("click", async () => {
		console.log("open online tournament mode")
		navigate("/online/lobbies");		
	})
	appContainer.appendChild(createGameButton);
	appContainer.appendChild(searchGameButton);
}