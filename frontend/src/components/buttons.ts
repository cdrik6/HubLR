import { authentication } from "../authentication/logIn.js";
import { registration } from "../authentication/signUp.js";
import { navigate } from "../main.js";
import { inLobby } from "../pages/lobbies.js";
import { showAlert } from "./alerts.js";

export function createSignButtons() : HTMLDivElement
{
	const divElement = document.createElement('div');
	divElement.className = 'flex justify-between mx-3';

	//Sign Up Button
	const signUpButton = document.createElement('button');
	signUpButton.id = "btn-sign-up";
	signUpButton.className = 'text-[#7c7c7c] hover:text-white font-medium w-24 h-16 border border-[#a5a2a2] bg-[#ebebeb] rounded-l-[8px] hover:bg-[#b6b6b6]';
	signUpButton.textContent = "SIGN UP";

	signUpButton.addEventListener('click', () => {
		console.log("Sign up form called");
		if (!inLobby())
			registration();
	})

	//Log In Button
	const logInButton = document.createElement('button');
	logInButton.id = "btn-log-in";
	logInButton.className = 'text-[#7c7c7c] hover:text-white font-medium w-24 h-16 border border-[#a5a2a2] bg-[#ebebeb] rounded-r-[8px] hover:bg-[#b6b6b6]';
	logInButton.textContent = "LOG IN";

	logInButton.addEventListener('click', () => {
		console.log("Log in form called");
		if (!inLobby())
		{
			console.log("authentication: inlobby =", inLobby());
			authentication();
		}
	})

	//Append Elements
	divElement.append(signUpButton, logInButton);
	return (divElement);
}

export function createProfileButton(username: string, avatar: string) : HTMLButtonElement
{
	const button = document.createElement('button');
	button.className = 'group flex items-center space-x-3 px-2 py-2 rounded-full text-gray-600 text-lg font-sans hover:text-[#ffffff] hover:bg-[#c4c2c2]';
	button.id = "profileButton";

	//Username
	const userDisplay = document.createElement('span');
	userDisplay.textContent = username;

	//User Avatar
	const avatarDiv = document.createElement('div');
	const avatarImg = document.createElement('img');
	avatarImg.className = 'w-16 h-16 rounded-full group-hover:brightness-95';
	avatarImg.src = avatar;
	avatarDiv.appendChild(avatarImg);

	//Append Elements
	button.appendChild(userDisplay);
	button.appendChild(avatarDiv);

	button.addEventListener('click', (event) => {
		const dropdown = document.getElementById('userDropdown');
		if (!dropdown)
			{console.log('userDropdown not created'); return}
		dropdown.classList.toggle('hidden');
		console.log('dropdown closed with profile button')
	})

	return (button);
}

export function createPrincipalButton(buttonId : string, buttonContent : string) : HTMLButtonElement
{
	const button = document.createElement('button');
	button.className = 'h-20 w-48 bg-[#36BFB1] text-2xl text-[#014034] hover:bg-[#02735E] hover:text-[#ffffff] border-3 border-[#014034] rounded-lg';
	button.id = buttonId;
	button.textContent = buttonContent;

	return (button);
}

export function createSearchButton() : HTMLFormElement {
	const mainForm = document.createElement('form');
	mainForm.classList = 'flex items-center mx-2.5';
	mainForm.id = 'search-bar';

	const searchButton = document.createElement('button');
	searchButton.type = 'submit';
	searchButton.classList = 'p-2.5 text-sm font-medium text-white bg-neutral-500 rounded-l-lg border border-neutral-bg-neutral-500 hover:bg-neutral-700';

	searchButton.innerHTML = `<svg class="w-4 h-4 m-0.5" fill="none" viewBox="0 0 20 20"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/></svg>`;

	mainForm.appendChild(searchButton);

	const searchInput = document.createElement('input');
	searchInput.type = 'text';
	searchInput.id = 'searchBar';
	searchInput.classList = 'block p-2.5 w-full z-20 text-sm text-gray-900 bg-gray-50 rounded-e-lg border-s-gray-50 border-s-2 border border-gray-300';
	searchInput.required = true;
	searchInput.placeholder = 'Search user...';

	mainForm.appendChild(searchInput);
	mainForm.addEventListener('submit', async (e) => {
		e.preventDefault();
		const search = searchInput.value;
		if (!search || search.length < 5)
			return showAlert("User not found");
		const response = await fetch(`/api/auth/users/${search}`, { method: 'GET', credentials: 'include' })
		const user = await response.json();
		if (!response.ok || !user)
		{
			showAlert("User not found");
			return ;
		}
		navigate(`/users/${search}`);
	});
	return (mainForm);
	
}

// <form class="flex items-center mx-2.5">
// 	<button type="submit" class="p-2.5 text-sm font-medium text-white bg-neutral-500 rounded-l-lg border border-neutral-bg-neutral-500 hover:bg-neutral-700">
// 		<svg class="w-4 h-4 m-0.5" fill="none" viewBox="0 0 20 20">
// 			<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
// 		</svg>
// 		<!-- <span class="sr-only">Search</span> -->
// 	</button>
// 	<input type="search" id="search-dropdown" class="block p-2.5 w-full z-20 text-sm text-gray-900 bg-gray-50 rounded-e-lg border-s-gray-50 border-s-2 border border-gray-300 " placeholder="Search..." required />
// </form>