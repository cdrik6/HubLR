import { showAlert } from "../components/alerts.js";

export function create2FAForm(active: boolean): HTMLDivElement {
	const form = document.createElement('div');
	form.className = 'bg-gray-200 rounded-lg shadow-md p-6 w-fit space-y-4 flex flex-col items-center justify-center hidden';
	form.id = '2fa-form';

	//Current Password

	const title = document.createElement('h1');
	title.classList = 'block mb-2 text-base font-bold text-gray-700';
	title.textContent = 'Two Factor Authentication';

	form.appendChild(title);

	const currentPasswordDiv = document.createElement('div');
	
	const currentPasswordTitle = document.createElement('h1');
	currentPasswordTitle.className = 'block mb-2 text-base font-bold text-gray-700';
	currentPasswordTitle.textContent = 'Password';
	
	const currentPassword = document.createElement('input');
	currentPassword.className = 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 text-sm rounded-lg block w-full p-2.5';
	currentPassword.required = true;
	currentPassword.placeholder = '*******';
	currentPassword.type = 'password';
	currentPassword.name = 'password';
	currentPassword.id = 'password2FA'

	currentPasswordDiv.appendChild(currentPasswordTitle);
	currentPasswordDiv.appendChild(currentPassword);

	
	const cancelButton = document.createElement('button');
	cancelButton.className = 'bg-gray-300 text-gray-500 font-bold w-24 h-10 rounded-lg border-2 border-gray-400 hover:bg-gray-400 hover:text-white';
	cancelButton.textContent = "Cancel"
	cancelButton.id = 'cancel2FAButton';
	cancelButton.addEventListener('click', ()=>{
		const filter = document.getElementById('filter');
		if (!filter) return ;
		console.log("canceling 2FA form");
		filter.classList.add("hidden");
		form.classList.add("hidden");
	})
	
	const sendButton = document.createElement('button');
	sendButton.className = 'bg-red-300 text-white font-bold w-24 h-10 rounded-lg border-2 border-red-400 hover:bg-red-400 hover:text-white';
	sendButton.id = 'ConfirmTFAButton';

	console.log("active",active);
	if (active)
	{
		sendButton.textContent = "Deactivate";
		sendButton.addEventListener('click', remove2FA);
		// desactivate 2FA
	}
	else
	{
		sendButton.textContent = "Activate";
		sendButton.addEventListener('click', register2FA);
	}
	
	const buttonsDiv = document.createElement('div');
	buttonsDiv.appendChild(cancelButton);
	buttonsDiv.appendChild(sendButton);


	form.appendChild(currentPasswordDiv);
	form.appendChild(buttonsDiv);

	return (form);
}

const errorMessage = document.createElement('h1');
errorMessage.className = 'block text-red-500 text-base font-bold';

async function remove2FA(e: Event)
{
	e.preventDefault();

	console.log("in remove 2fa");
	const form = document.getElementById('2fa-form');
	const input = document.getElementById('password2FA') as HTMLInputElement;
	
	if (!form || !input)
	{
		showAlert("Error with the form of 2FA");
		return ;
	}
	
	form.appendChild(errorMessage);
	const password = input.value;
	if (!password || password.length < 6)
	{
		errorMessage.textContent = 'Bad password';
		return;
	}
	const response = await fetch('/api/auth/deactivate2FA', { 
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			password: password,
		}),
	});
	if (response.ok)
	{
		location.reload();
		return ;
	}
	const res = await response.json();
	errorMessage.textContent = res.error;

}

async function register2FA(e: Event)
{
	e.preventDefault();

	console.log("register 2fa");
	const form = document.getElementById('2fa-form');
	const input = document.getElementById('password2FA') as HTMLInputElement;
	
	if (!form || !input)
	{
		showAlert("Error with the form of 2FA");
		return ;
	}
	
	form.appendChild(errorMessage);
	const password = input.value;
	if (!password || password.length < 6)
	{
		errorMessage.textContent = 'Bad password';
		return;
	}
	const response = await fetch('/api/auth/register2FA', { 
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			password: password,
		}),
	});
	if (response.ok)
	{
		location.reload();
		return ;
	}
	const res = await response.json();
	errorMessage.textContent = res.error;

}

export function active2FAForm() {
	const filter = document.getElementById('filter');
	const form = document.getElementById("2fa-form");
	const popup = document.getElementById('popup');
	if (!filter || !popup || !form)
	{
		console.log("error creating popup");
		return ;
	}
	console.log("opening form");
	// form.appendChild(deleteErrorMessage);
	// deleteErrorMessage.textContent = "";
	filter.classList.remove("hidden");
	form.classList.remove("hidden");

	document.addEventListener('click', (event) => {
	if (!(filter.classList.contains("hidden")) && !(form.classList.contains("hidden"))
		&& !form.contains(event.target as Node)
		&& (event.target as Node) !== document.getElementById('TFAButton'))
	{
		console.log("closing form");
		filter.classList.add("hidden");
		form.classList.add("hidden");
		// form.removeEventListener('submit', deleteAccount);
	}});
}

const errorMessageLog = document.createElement('h1')
errorMessageLog.className = 'block text-red-500 text-base font-bold';


export function create2FALogin(): HTMLFormElement 
{
	console.log("creating log in form");
	const form = document.createElement('form');
	form.className = 'bg-gray-200 rounded-lg shadow-md p-6 w-80 space-y-4 hidden';
	form.id = '2fa-form';

	const tfaDiv = document.createElement('div');
	
	const tfaTitle = document.createElement('h1');
	tfaTitle.className = 'block mb-2 text-base font-bold text-gray-700';
	tfaTitle.textContent = 'Two-Factor Authentication';
	
	const tfa = document.createElement('input');
	tfa.className = 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 text-sm rounded-lg block w-full p-2.5';
	tfa.required = true;
	tfa.placeholder = 'Secret Code';
	tfa.type = 'text';
	tfa.name = 'tfa';
	tfa.id = 'tfaInput';
	
	tfaDiv.append(tfaTitle, tfa);
	const submit = document.createElement('button');
	submit.className = 'bg-gray-300 text-gray-500 font-bold w-24 h-10 rounded-lg border-2 border-gray-400 hover:bg-gray-400 hover:text-white';
	submit.textContent = "Log in"
	
	form.appendChild(tfaDiv);
	form.appendChild(submit);
	
	form.addEventListener('submit', async () => {
		console.log("2fa send")
	})
	return (form);
}

