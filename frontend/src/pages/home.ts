import { showAlert } from "../components/alerts.js";
import * as buttons from "../components/buttons.js"
import { navigate } from "../main.js";
import { getCurrentUser } from "../utils/auth.js";

export async function renderHome() {
	const  appContainer = document.getElementById("app");
	if (!appContainer)
		return ;
	appContainer.innerHTML = '';	

	const playLocalButton = buttons.createPrincipalButton("playLocalButton", "Play Local");
	playLocalButton.addEventListener("click", async () => {
		navigate("/local");
	})

	const playOnlineButton = buttons.createPrincipalButton("playOnlineButton", "Play Online");
	playOnlineButton.addEventListener("click", async () => {		
		if(await getCurrentUser())
			navigate("/online");
		else
		{
			showAlert("Please Login");
		}
	})
	appContainer.appendChild(playLocalButton);
	appContainer.appendChild(playOnlineButton);
}