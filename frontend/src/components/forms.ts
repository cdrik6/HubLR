import { deleteAccount } from "../authentication/profileSettings.js";

export function createLogInForm(): HTMLFormElement 
{
	console.log("creating log in form");
	const form = document.createElement('form');
	form.className = 'bg-gray-200 rounded-lg shadow-md p-6 w-80 space-y-4 hidden';
	form.id = 'log-in-form';

	//Username
	const usernameDiv = document.createElement('div');
	
	const usernameTitle = document.createElement('h1');
	usernameTitle.className = 'block mb-2 text-base font-bold text-gray-700';
	usernameTitle.textContent = 'Username';
	
	const username = document.createElement('input');
	username.className = 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 text-sm rounded-lg block w-full p-2.5';
	username.required = true;
	username.placeholder = 'Username';
	username.type = 'text';
	username.name = 'username';

	usernameDiv.append(usernameTitle, username);
	
	//Password
	const passwordDiv = document.createElement('div');

	const passwordTitle = document.createElement('h1');
	passwordTitle.className = 'block mb-2 text-base font-bold text-gray-700';
	passwordTitle.textContent = 'Password';

	const password = document.createElement('input');
	password.className = 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 text-sm rounded-lg block w-full p-2.5';
	password.required = true;
	password.placeholder = '*******';
	password.type = 'password';
	password.name = 'password';

	passwordDiv.append(passwordTitle, password);

	//Submit button
	const submit = document.createElement('button');
	submit.className = 'bg-gray-300 text-gray-500 font-bold w-24 h-10 rounded-lg border-2 border-gray-400 hover:bg-gray-400 hover:text-white';
	submit.textContent = "Log in"

	form.addEventListener('submit', () => {
		console.log('submit')
	})

	form.appendChild(usernameDiv);
	form.appendChild(passwordDiv);
	form.appendChild(submit);
	return (form);
}

export function createSignUpForm(): HTMLFormElement 
{
	const form = document.createElement('form');
	form.className = 'bg-gray-200 rounded-lg shadow-md p-6 w-80 space-y-4 hidden';
	form.id = 'sign-up-form';

	//Username
	const usernameDiv = document.createElement('div');
	
	const usernameTitle = document.createElement('h1');
	usernameTitle.className = 'block mb-2 text-base font-bold text-gray-700';
	usernameTitle.textContent = 'Username';
	
	const username = document.createElement('input');
	username.className = 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 text-sm rounded-lg block w-full p-2.5';
	username.required = true;
	username.placeholder = 'Username';
	username.type = 'text';
	username.name = 'username';

	usernameDiv.append(usernameTitle, username);

	//Email
	const emailDiv = document.createElement('div');
	
	const emailTitle = document.createElement('h1');
	emailTitle.className = 'block mb-2 text-base font-bold text-gray-700';
	emailTitle.textContent = 'Email';
	
	const email = document.createElement('input');
	email.className = 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 text-sm rounded-lg block w-full p-2.5';
	email.required = true;
	email.placeholder = 'name@example.com';
	email.type = 'text';
	email.name = 'email';

	emailDiv.append(emailTitle, email);

	//Password
	const passwordDiv = document.createElement('div');

	const passwordTitle = document.createElement('h1');
	passwordTitle.className = 'block mb-2 text-base font-bold text-gray-700';
	passwordTitle.textContent = 'Password';

	const password = document.createElement('input');
	password.className = 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 text-sm rounded-lg block w-full p-2.5';
	password.required = true;
	password.placeholder = '*******';
	password.type = 'password';
	password.name = 'password';

	passwordDiv.append(passwordTitle, password);

	//Submit button
	const submit = document.createElement('button');
	submit.className = 'bg-gray-300 text-gray-500 font-bold w-24 h-10 rounded-lg border-2 border-gray-400 hover:bg-gray-400 hover:text-white';
	submit.textContent = "Register"

	form.addEventListener('submit', () => {
		console.log('submit')
	})

	form.appendChild(usernameDiv);
	form.appendChild(emailDiv);
	form.appendChild(passwordDiv);
	form.appendChild(submit);

	return (form);
}

export function createNewPasswordForm(): HTMLFormElement {
	const form = document.createElement('form');
	form.className = 'bg-gray-200 rounded-lg shadow-md p-6 w-80 space-y-4 hidden';
	form.id = 'new-password-form';

	//Current Password
	const currentPasswordDiv = document.createElement('div');
	
	const currentPasswordTitle = document.createElement('h1');
	currentPasswordTitle.className = 'block mb-2 text-base font-bold text-gray-700';
	currentPasswordTitle.textContent = 'Current Password';
	
	const currentPassword = document.createElement('input');
	currentPassword.className = 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 text-sm rounded-lg block w-full p-2.5';
	currentPassword.required = true;
	currentPassword.placeholder = '*******';
	currentPassword.type = 'password';
	currentPassword.name = 'currentPassword';

	currentPasswordDiv.appendChild(currentPasswordTitle);
	currentPasswordDiv.appendChild(currentPassword);

	//New Password
	const NewPasswordDiv = document.createElement('div');
	
	const NewPasswordTitle = document.createElement('h1');
	NewPasswordTitle.className = 'block mb-2 text-base font-bold text-gray-700';
	NewPasswordTitle.textContent = 'New Password';
	
	const NewPassword = document.createElement('input');
	NewPassword.className = 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 text-sm rounded-lg block w-full p-2.5';
	NewPassword.required = true;
	NewPassword.placeholder = '*******';
	NewPassword.type = 'password';
	NewPassword.name = 'newPassword';

	NewPasswordDiv.append(NewPasswordTitle);
	NewPasswordDiv.append(NewPassword);

	const submit = document.createElement('button');
	submit.className = 'bg-gray-300 text-gray-500 font-bold w-24 h-10 rounded-lg border-2 border-gray-400 hover:bg-gray-400 hover:text-white';
	submit.textContent = "Change"
	submit.id = 'newPasswordButton';

	//Submit button
	form.addEventListener('submit', () => {
		console.log('submit')
	})

	form.appendChild(currentPasswordDiv);
	form.appendChild(NewPasswordDiv);
	form.appendChild(submit);

	return (form);
}

export function confirmDeleteForm(): HTMLFormElement {
	const form = document.createElement('form');
	form.className = 'bg-gray-200 rounded-lg shadow-md p-6 w-80 space-y-4 hidden';
	form.id = 'delete-account-form';

	//Current Password

	const title = document.createElement('h1');
	title.classList = 'block mb-2 text-base font-bold text-gray-700';
	title.textContent = 'Are you sure want to delete your account ?'

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

	currentPasswordDiv.appendChild(currentPasswordTitle);
	currentPasswordDiv.appendChild(currentPassword);

	
	const cancelButton = document.createElement('button');
	cancelButton.className = 'bg-gray-300 text-gray-500 font-bold w-24 h-10 rounded-lg border-2 border-gray-400 hover:bg-gray-400 hover:text-white';
	cancelButton.textContent = "Cancel"
	cancelButton.id = 'cancelDeleteButton';
	cancelButton.addEventListener('click', ()=>{
		const filter = document.getElementById('filter');
		if (!filter) return ;
		console.log("canceling delete form");
		filter.classList.add("hidden");
		form.classList.add("hidden");
	})
	
	const deleteButton = document.createElement('button');
	deleteButton.className = 'bg-red-300 text-white font-bold w-24 h-10 rounded-lg border-2 border-red-400 hover:bg-red-400 hover:text-white';
	deleteButton.textContent = "Confirm"
	deleteButton.id = 'confirmDeleteButton';
	deleteButton.addEventListener('submit', deleteAccount)
	
	const buttonsDiv = document.createElement('div');
	buttonsDiv.appendChild(cancelButton);
	buttonsDiv.appendChild(deleteButton);


	form.appendChild(currentPasswordDiv);
	form.appendChild(buttonsDiv);

	return (form);
}