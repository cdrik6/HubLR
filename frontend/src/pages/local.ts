import * as buttons from "../components/buttons.js"
import { navigate } from "../main.js";

export async function renderLocal() {
	const  appContainer = document.getElementById("app");
	if (!appContainer)
		return ;
	appContainer.innerHTML = '';
	const playVsButton = buttons.createPrincipalButton("playVsButton", "1 vs 1");
	playVsButton.addEventListener("click", async () => {
		console.log("open local 1v1 game")
		navigate("/local/playervsplayer");
	})

	const playTournamentButton = buttons.createPrincipalButton("playTournamentButton", "Tournament");
	playTournamentButton.addEventListener("click", async () => {
		console.log("open local tournament mode")
		navigate("/local/tournament");
	})

	appContainer.appendChild(playVsButton);
	appContainer.appendChild(playTournamentButton);
}