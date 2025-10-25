import * as buttons from './components/buttons.js';
import { createUserDropdown } from './components/dropdowns.js';
import * as forms from './components/forms.js';
import { renderFriends } from './pages/friends.js';
import { renderHome } from './pages/home.js';
import { renderLocal } from './pages/local.js';
import { renderCreation, renderOnline } from './pages/online.js';
import { renderProfile } from './pages/profile.js';
import { renderSettings } from './pages/settings.js';
import { getCurrentUser } from './utils/auth.js';
import { inLobby, renderLobbies } from './pages/lobbies.js';
import { renderGameCustomization } from './pages/gameCustomization.js';
import { renderLobby } from './pages/lobby.js';
import { showAlert } from './components/alerts.js';

const accountButtons = document.getElementById("account");
const popupContainer = document.getElementById("popup");
const appContainer = document.getElementById("app");
const homeButton = document.getElementById("btn-home");

window.addEventListener('DOMContentLoaded', async () => {
	let loggedUser;
	try {
		loggedUser = await getCurrentUser();
	} catch (error) {
		loggedUser = null;
	}
	if (!accountButtons || !popupContainer)
		return ;
	accountButtons.innerHTML = '';
	if (document.getElementById('log-in-form'))
		document.getElementById('log-in-form')?.remove();
	if (document.getElementById('sign-up-form'))
		document.getElementById('sign-up-form')?.remove();
	if (!loggedUser)
	{
		popupContainer.appendChild(forms.createLogInForm());
		popupContainer.appendChild(forms.createSignUpForm());
		accountButtons.appendChild(buttons.createSignButtons());
	}
	else {		
		accountButtons.appendChild(buttons.createSearchButton());
		accountButtons.appendChild(buttons.createProfileButton(loggedUser.username, `/api/users/public/avatars/${loggedUser.avatarURL}`));
		accountButtons.appendChild(createUserDropdown());		

		if (!location.pathname.match(`^/users/([^/]+)/edit$`))
			popupContainer.innerHTML = '';

		setInterval(() => {
			try {
				fetch('/api/auth/ping', {method:'POST', credentials:'include'});
				console.log("ping send");
			} catch (error) {
				console.log("error in ping:", error);
			}
		}, 10 * 1000);
	}
})

function renderPage(path_page : string) {
	console.log(appContainer);
	if (!appContainer || !popupContainer)
		return ;
	console.log("path page: ", path_page);
	const editMatch = path_page.match(`^/users/([^/]+)/edit$`);
	if (editMatch) {
		const username = editMatch[1];
    	renderSettings(username);
    	return;
	}
	const userMatch = path_page.match(`^\/users\/([^/]+)$`);
  	if (userMatch) {
    	const username = userMatch[1];
    	renderProfile(username);
    	return;
  	}

	const lobbyMatch = path_page.match(`^\/lobbies\/([^/]+)$`);
	if (lobbyMatch) {
		const lobbyID = lobbyMatch[1];
		renderLobby(lobbyID);
		return ;
	}
	switch (path_page) {
		case "/":
			{
				renderHome();
				break;
			}
		case "/friends":
			{
				renderFriends();
				break;
			}
		case "/local":
			{
				renderLocal();
				break;
			}
		case "/local/playervsplayer":
			{
				renderGameCustomization("");
				break;
			}
		case "/local/tournament":
			{
				renderGameCustomization("tournament");
				break;
			}
		case "/online":
			{
				renderOnline();
				break;
			}
		case "/online/lobbies":
			{
				renderLobbies();
				break;
			}
		case "/online/create":
			{
				renderCreation();
				break;
			}
		case "/online/playervsplayer":
			{
				renderGameCustomization("1v1", false);
				break;
			}
		case "/online/multiplayer":
			{
				renderGameCustomization("multi", false);
				break;
			}
		case "/online/tournament":
			{
				renderGameCustomization("tournament", false);
				break;
			}
		default: {
			appContainer.innerHTML = '<h2>404 Not Found</h2>';
		}
	}
}

export function navigate(path_page : string, pushState = true) {
	renderPage(path_page);
	if (pushState)
		history.pushState({}, '', path_page);
	else
		history.replaceState({}, '', path_page);
}

if (homeButton)
	homeButton.addEventListener('click', () => {
		if (!inLobby())
		{
			navigate("/");
			location.reload();
		}
	})

console.log(location.pathname);

window.addEventListener('DOMContentLoaded', async () => {
	renderPage(location.pathname);
})

document.body.addEventListener('click', (event) => {
	console.log(event.target);
});

window.addEventListener('popstate', () => {
	if (inLobby()) {
		showAlert("Button deactivated during a game session");
		history.forward();
		return ;
	}
	navigate(window.location.pathname, false);
	// location.reload();
});
