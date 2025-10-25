import { showAlert } from "../components/alerts.js";
import * as buttons from "../components/buttons.js"
// import { navigate } from "../main.js";
// import { getCurrentUser } from "../utils/auth.js";
import { GameOptions, GameSettings, TournamentSettings } from "../utils/types.js";
import { updateGameSession } from "./lobbies.js";
import { renderPong } from "./pong.js";
import { startTournament } from "./tournament.js";

export async function renderTournamentEnd(tournamentId: string, isLocal: boolean, options: GameOptions) {
	const  appContainer = document.getElementById("app");
	if (!appContainer)
		return ;
	appContainer.innerHTML = '';	

	let data : TournamentSettings | undefined;
	try {
		const tournamentResponse = await fetch(`/api/tournament/${tournamentId}`, {credentials: 'include'});
		if (!tournamentResponse.ok)
		{
			showAlert("Error getting tournament");
			return location.reload();
		}
		data = await tournamentResponse.json() as TournamentSettings;
	} catch (error) {
		console.log(error);
	}
	if (!data)
	{
		showAlert("Error getting Tournament");
		return location.reload();
	}
	const repeteTournament = buttons.createPrincipalButton("repeteTournament", "Replay");
	repeteTournament.addEventListener("click", async () => {
		try {
			const res = await fetch(`/api/tournament/${tournamentId}`, {method:'PATCH', credentials: 'include'})
			if (!res.ok)
				showAlert("Error repeting tournament");
		} catch (error) {
			console.log(error);
		}

		startTournament(data.players, options, isLocal, tournamentId);
	})


	const deleteTournament = buttons.createPrincipalButton("deleteTournament", "Go back");
	deleteTournament.addEventListener("click", async () => {
		try {
			const res = await fetch(`/api/tournament/${tournamentId}`, {method:'DELETE', credentials: 'include'})
			if (!res.ok)
				showAlert("Error deleting tournament");
			updateGameSession();
		} catch (error) {
			console.log(error);
		}
		location.reload();
	})
	appContainer.appendChild(repeteTournament);
	appContainer.appendChild(deleteTournament);
}


export async function renderGameEnd(settings: GameSettings) {
	const  appContainer = document.getElementById("app");
	if (!appContainer)
		return ;
	appContainer.innerHTML = '';	

	const repeteGame = buttons.createPrincipalButton("repeteGame", "Replay");
	repeteGame.addEventListener("click", async () => {
		try {
			await renderPong(settings);
			await new Promise(r => setTimeout(r, 2500));
			renderGameEnd(settings);
		} catch (error) {
			console.log(error);
		}
	})

	const goBack = buttons.createPrincipalButton("goBack", "Back to settings");
	goBack.addEventListener("click", async () => {
		location.reload();
	})
	appContainer.appendChild(repeteGame);
	appContainer.appendChild(goBack);
}