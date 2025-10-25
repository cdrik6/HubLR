import { createProfileButton } from "../components/buttons.js";
import { createUserDropdown } from "../components/dropdowns.js";
import { getCurrentUser } from "../utils/auth.js";

const errorMessage = document.createElement('h1');
errorMessage.className = 'block text-red-500 text-base font-bold';

const filter = document.getElementById('filter');

function checkInput(form : HTMLFormElement) : boolean {
	const pattern = new RegExp("[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?");
	
	const formData = new FormData(form);
	const username = formData.get('username') as string;
	const email = formData.get('email') as string;
	const password = formData.get('password') as string;

	console.log(email);
	if (!pattern.test(email))
		errorMessage.textContent = "Invalid email address";
	else if (username.length > 7 || username.length < 5)
		errorMessage.textContent = "Invalid username (between 5 and 7 characters)";
	else if (password.length < 6)
		errorMessage.textContent = "Invalid password (minimum 6 characters)";
	else
		return (true);
	return (false);
}

async function manageSubmit(e : Event) {
	e.preventDefault();

	console.log("in manage submit registration")
	const form = e.target as HTMLFormElement;

	if (!checkInput(form))
	{
		console.log("bad form input")
		// errorMessage.textContent = "Bad username or password"
		return ;
	}

	const formData = new FormData(form);
	const username = formData.get('username') as string;
	const email = formData.get('email') as string;
	const password = formData.get('password') as string;
	try {
		const response = await fetch('/api/auth/register', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json; charset=UTF-8',
			},
			body: JSON.stringify({
				'username' : username,
				'email' : email,
				'password' : password,
			}),
		})
		if (response.ok)
		{
			console.log("everything good registration")
			filter?.classList.add("hidden");
			location.reload();
		}
		else {
			console.log("bad response signUp.ts")
			const json = await response.json();
			errorMessage.textContent = json.error;
			console.log(json.error);
		}
	} catch (error) {
		console.error("error with fetch");
	}
}
	
export function registration() {
	console.log("in registration function");
	const signUpForm = document.getElementById("sign-up-form");
	const popup = document.getElementById('popup');
	signUpForm?.appendChild(errorMessage);
	if (!popup)
	{
		console.log("error creating popup");
		return ;
	}
	errorMessage.textContent = "";
	filter?.classList.remove("hidden");
	signUpForm?.classList.remove("hidden");
	
	document.addEventListener('click', (event) => {
	if (!(filter?.classList.contains("hidden")) && !(signUpForm?.classList.contains("hidden"))
		&& !signUpForm?.contains(event.target as Node)
		&& (event.target as Node) !== document.getElementById('btn-sign-up'))
	{
		console.log("closing pop up : sign up form");
		filter?.classList.add("hidden");
		signUpForm?.classList.add("hidden");
		document.getElementById('sign-up-form')?.removeEventListener('submit', manageSubmit)
		console.log(popup);
	}});
	document.getElementById('sign-up-form')?.addEventListener('submit', manageSubmit)
}