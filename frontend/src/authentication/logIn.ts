// import { createProfileButton } from "../components/buttons.js";
// import { createUserDropdown } from "../components/dropdowns.js";

import { showAlert } from "../components/alerts.js";
import { navigate } from "../main.js";
import { active2FAForm, create2FALogin } from "./2FA.js";

const errorMessage = document.createElement('h1')
errorMessage.className = 'block text-red-500 text-base font-bold';

const filter = document.getElementById('filter');

function checkInput(form : HTMLFormElement) : boolean {
	const formData = new FormData(form);
	const username = formData.get('username') as string;
	const password = formData.get('password') as string;
	return (username.length <= 7 && username.length >= 3 && password.length >= 6)
}

async function manageSubmit(e : Event) {
	e.preventDefault();

	const form = e.target as HTMLFormElement;

	if (!checkInput(form))
	{
		errorMessage.textContent = "Bad username or password"
		return ;
	}

	const formData = new FormData(form);
	const username = formData.get('username') as string;
	const password = formData.get('password') as string;

	try
	{
		const responseLogin = await fetch('/api/auth/login', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json; charset=UTF-8',
			},
			body: JSON.stringify({
				'username' : username,
				'password' : password,
			}),
		})
		const responseData = await responseLogin.json();
		if (responseLogin.ok)
		{
			if (responseData.status === '2FA')
			{
				const popUpContainer = document.getElementById('popup');
				const newForm = create2FALogin();
				if (!newForm || !popUpContainer)
				{
					showAlert("Error with 2FA form");
					return ;
				}
				form.classList.add('hidden');
				popUpContainer.appendChild(newForm);
				active2FAForm();
				newForm.addEventListener('submit', async (e) => {
					e.preventDefault();
					const input = document.getElementById('tfaInput') as HTMLInputElement;
					if (!input)
					{
						showAlert("error with 2fa submit");
						location.reload();
					}
					const token = input.value.trim();
					const response2FA = await fetch('/api/auth/verify2FA', {
						method: 'POST',
						credentials: 'include',
						headers: {
							'Content-Type': 'application/json; charset=UTF-8',
						},
						body: JSON.stringify({
							id : responseData.id,
							token : token,
						}),
					});

					if (!response2FA.ok)
					{
						const json = await response2FA.json();
						errorMessage.textContent = json.error;
					}
					else
					{
						navigate('/');
						location.reload();
					}
				})
			}
			else
			{
				filter?.classList.add("hidden");
				location.reload();
			}
		}
		else
			errorMessage.textContent = responseData.error;
	}
	catch (error) {
		console.error("error with fetch");
	}
}


export function authentication() {
	const logInForm = document.getElementById("log-in-form");
	const popup = document.getElementById('popup');
	if (!popup || !logInForm)
	{
		showAlert("error creating popup");
		return ;
	}
	logInForm.appendChild(errorMessage);
	errorMessage.textContent = "";
	filter?.classList.remove("hidden");
	logInForm?.classList.remove("hidden");
	
	document.addEventListener('click', (event) => {
	if (!(filter?.classList.contains("hidden")) && !(logInForm?.classList.contains("hidden")) && !logInForm?.contains(event.target as Node) && (event.target as Node) !== document.getElementById('btn-log-in'))
	{
		filter?.classList.add("hidden");
		logInForm?.classList.add("hidden");
		document.getElementById('log-in-form')?.removeEventListener('submit', manageSubmit)
	}});

	document.getElementById('log-in-form')?.addEventListener('submit', manageSubmit)
}
