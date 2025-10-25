import { activeDeleteForm, activeNewPasswordForm, settings } from "../authentication/profileSettings.js";
import { active2FAForm, create2FAForm } from "../authentication/2FA.js"; 
import { confirmDeleteForm, createNewPasswordForm } from "../components/forms.js";
// import { navigate } from "../main.js";
import { validateFileInput } from "../utils/files.js";

export async function renderSettings(username : string) {
	const  appContainer = document.getElementById("app");
	const  popUpContainer = document.getElementById('popup')
	if (!appContainer || !popUpContainer)
		return ;
	appContainer.innerHTML = '';
	popUpContainer.innerHTML = '';
	popUpContainer.appendChild(createNewPasswordForm());
	popUpContainer.appendChild(confirmDeleteForm());
	const response = await fetch(`/api/auth/users/${username}/edit`, { method: 'GET', credentials: 'include' })
	const user = await response.json();
	if (!response.ok || !user)
	{
		appContainer.innerHTML = '<h2>404 Not Found</h2>';
		return ;
	}

	popUpContainer.appendChild(create2FAForm(user.status2FA));

	//		User Profile Header
	const profileHeader = document.createElement('header');
	profileHeader.id = 'profileHeaderPreview';
	profileHeader.classList = 'w-full sticky h-auto flex backdrop-blur-xs';
	profileHeader.title = 'Banner';

	// Add default image or user image for background ${user.profileBackground}
	// if (user.banner)
	// 	profileHeader.style = `background-image: url("/api/users/public/banners/${user.banner}"); background-position: center center;`;

	const userHeaderDiv = document.createElement('div');
	userHeaderDiv.classList = 'mx-16 my-6 w-2/3 flex justify-start items-center space-x-36 backdrop-blur-xs';
	
	const userAvatar = document.createElement('img');
	userAvatar.classList = 'z-10 w-80 h-80 rounded-full border-4 border-white';
	userAvatar.id = 'userAvatarPreview';
	userAvatar.title = 'Avatar';
	
	//Add default Avatar or user Avatar ${user.avatar}
	userAvatar.src = `/api/users/public/avatars/${user.avatarURL}`;
	
	
	userHeaderDiv.appendChild(userAvatar);
	profileHeader.appendChild(userHeaderDiv);
	
	const resetButton = document.createElement('button');
	resetButton.id = 'resetHeaderButton';
	resetButton.classList = 'absolute flex justify-center border-2 m-1.5 px-2.5 py-1 rounded-full items-center border-red-500 right-0 top-0 bg-red-400 text-white hover:bg-red-300 hover:text-red-500 font-black';
	resetButton.title = 'Revert to the default settings';
	resetButton.textContent = 'Reset Settings';
	resetButton.addEventListener('click', () => {
		console.log("reset button");
		userAvatar.src = `/api/users/public/avatars/${user.avatarURL}`;
		avatarInput.value = '';
		usernameInput.value = user.username;
		emailInput.value = user.email;
		saveChangesButton.classList.add('hidden');
		// profileHeader.style = `background-image: url("https://upgifs.com//img/gifs/xThuWtNFKZWG6fUFe8.gif"); background-position: center center;`;

	})

	profileHeader.appendChild(resetButton);

	const changeHeaderOptions = document.createElement('form');
	changeHeaderOptions.classList = 'absolute bottom-0 right-0 flex';

	const avatarLabel = document.createElement('label');
	avatarLabel.classList = 'group border-t-2 border-l-2 rounded-tl-2xl border-neutral-500 bg-neutral-400 hover:bg-neutral-300';
	avatarLabel.title = 'Select image for Avatar';
	const avatarButtonTitle = document.createElement('p');
	avatarButtonTitle.classList = 'm-2 font-black text-white group-hover:text-neutral-500';
	avatarButtonTitle.textContent = 'Change Avatar';
	const avatarInput = document.createElement('input');
	avatarInput.id = 'avatarInput';
	avatarInput.type = 'file';
	avatarInput.classList = 'hidden';
	avatarInput.addEventListener('change', async () => {
		if (!validateFileInput(avatarInput))
			return ;
		const file = avatarInput.files?.[0];

		if (!file) return ;
		const data = new FormData();
		data.append('file', file);
		data.append('username', user.username);
		console.log('data', data);
		// const response = await fetch('/api/users/upload/avatar', {
		// 	method: 'POST', 
		// 	body: data
		// })
		// credentials: 'include',
		console.log(response);
		console.log(file);
		userAvatar.src = URL.createObjectURL(file);
		console.log(avatarInput.files);
		saveChangesButton.classList.remove('hidden');
	})

	avatarLabel.appendChild(avatarButtonTitle);
	avatarLabel.appendChild(avatarInput);

	changeHeaderOptions.appendChild(avatarLabel);

	const bannerLabel = document.createElement('label');
	bannerLabel.classList = 'group border-t-2 border-l-2  border-neutral-500 bg-neutral-400 hover:bg-neutral-300';
	bannerLabel.title = 'Select image for Banner';
	const bannerButtonTitle = document.createElement('p');
	bannerButtonTitle.classList = 'm-2 font-black text-white group-hover:text-neutral-500';
	bannerButtonTitle.textContent = 'Change Banner';
	const bannerInput = document.createElement('input');
	bannerInput.id = 'bannerInput';
	bannerInput.type = 'file';
	bannerInput.classList = 'hidden';
	bannerInput.addEventListener('change', async (event) => {
		if (!validateFileInput(bannerInput))
			return ;
		
		const file = bannerInput.files?.[0];
		if (!file) return ;
		const data = new FormData();
		data.append('file', file);
		data.append('username', user.username);
		console.log('data', data);
		// const response = await fetch('/api/users/upload/avatar', {
		// 	method: 'POST', 
		// 	body: data
		// })
		// credentials: 'include',
		console.log(response);
		console.log(file);
		// profileHeader.style = `background-image: url(${URL.createObjectURL(file)}); background-position: center center;`;
		saveChangesButton.classList.remove('hidden');
		console.log(bannerInput.files);
	})

	// bannerLabel.appendChild(bannerButtonTitle);
	// bannerLabel.appendChild(bannerInput);

	// changeHeaderOptions.appendChild(bannerLabel);

	profileHeader.appendChild(changeHeaderOptions);
	

	appContainer.appendChild(profileHeader);



	//User Profile Body
	const settingsBody = document.createElement('div');
	settingsBody.classList = 'w-full flex-1 flex my-11';

	//	Settings
	const settingsDiv = document.createElement('form');
	settingsDiv.classList = 'w-1/2 grid-cols-1 space-y-3 px-8 items-center justify-center';
	settingsDiv.id = 'userSettingsDiv';

	//		Email
	const emailDiv = document.createElement('div');
	emailDiv.classList = 'flex flex-col  space-y-1 w-full';

	const emailTitle = document.createElement('h1');
	emailTitle.classList = 'text-3xl text-gray-900';
	emailDiv.textContent = 'Email';

	const emailInput = document.createElement('input');
	emailInput.classList = 'bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-500 text-xl font-stretch-50% rounded-lg block w-full p-2.5';
	emailInput.type = 'email';
	emailInput.defaultValue = user.email; 
	emailInput.id = 'emailInput';
	const errorEmail = document.createElement('p');
	emailInput.addEventListener('input', () => {
		const pattern = new RegExp("[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?");
		const set = new Set([" ", "\t", "\n", "\r"]);
		const errorDiv = document.getElementById('errorMessageSettings');
		const email = emailInput.value;
		errorEmail.textContent = '';
		if (!email)
		{
			errorEmail.textContent = "Invalid email (empty email)";
			if (errorDiv)
				errorDiv.appendChild(errorEmail);
			return ;
		}
		if (!pattern.test(email) || ([...email].some((char) => set.has(char))))
		{
			errorEmail.textContent = "Invalid email format";
			if (errorDiv)
				errorDiv.appendChild(errorEmail);
			return ;
		}
		if (email === emailInput.defaultValue)
			return;
		saveChangesButton.classList.remove('hidden');
	})

	emailDiv.append(emailTitle, emailInput);

	settingsDiv.appendChild(emailDiv);

	//		Username
	const usernameDiv = document.createElement('div');
	usernameDiv.classList = 'flex flex-col space-y-1 w-full';

	const usernameTitle = document.createElement('h1');
	usernameTitle.classList = 'text-3xl text-gray-900';
	usernameDiv.textContent = 'Username';

	const usernameInput = document.createElement('input');
	usernameInput.classList = 'bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-500 text-xl font-stretch-50% rounded-lg block w-full p-2.5';
	usernameInput.type = 'text';
	usernameInput.defaultValue = user.username;
	usernameInput.id = 'usernameInput';
	const errorUsername = document.createElement('p');
	usernameInput.addEventListener('input', () => {
		const set = new Set([" ", "\t", "\n", "\r"]);
		const username = usernameInput.value;
		errorUsername.textContent = '';
		const errorDiv = document.getElementById('errorMessageSettings');
		console.log("here");
		if (!username || username.length < 5 || username.length > 7)
		{
			errorUsername.textContent = "Invalid username (min : 5 and max : 7 characters)";
			if (errorDiv)
				errorDiv.appendChild(errorUsername);
			return;
		}
		if (([...username].some((char) => set.has(char))))
		{
			errorUsername.textContent = "Invalid username (no spaces allowed in 'username')";
			if (errorDiv)
				errorDiv.appendChild(errorUsername);
			return;
		}
		if (username === usernameInput.defaultValue)
			return;
		saveChangesButton.classList.remove('hidden');
	})

	usernameDiv.append(usernameTitle, usernameInput);

	settingsDiv.appendChild(usernameDiv);

	const errorMessage = document.createElement('div');
	errorMessage.classList = 'flex flex-col text-red-500 text-base font-bold space-y-2';
	errorMessage.id = 'errorMessageSettings';
	settingsDiv.appendChild(errorMessage);
	settingsBody.appendChild(settingsDiv);
	
	settingsBody.addEventListener('input', (event) => {
		console.log("change made:", event.target);
		// saveChangesButton.classList.remove('hidden');
	})


	// Buttons
	const buttonsDiv = document.createElement('div');
	buttonsDiv.classList = 'w-1/2 grid-cols-1 space-y-3 px-8 items-center justify-center';

	const passwordButtonDiv = document.createElement('div');
	passwordButtonDiv.classList = 'text-center';

	//		Change Password

	console.log(popUpContainer);
	const passwordButton = document.createElement('button');
	
	passwordButton.id = 'changePassword';
	passwordButton.classList = 'bg-neutral-500 p-5 text-2xl font-black text-white rounded-xl hover:bg-neutral-700 hover:text-neutral-300 my-5';
	passwordButton.textContent = 'Change Password';
	
	passwordButton.addEventListener('click', () => {
		activeNewPasswordForm();
	})
	passwordButtonDiv.appendChild(passwordButton);

	buttonsDiv.appendChild(passwordButtonDiv);


	const TwoFAButtonDiv = document.createElement('div');
	TwoFAButtonDiv.classList = 'text-center';

	//		Change Password

	console.log(popUpContainer);
	const TwoFAButton = document.createElement('button');

	TwoFAButton.id = 'TFAButton';
	TwoFAButton.classList = 'bg-neutral-500 p-5 text-2xl font-black text-white rounded-xl hover:bg-neutral-700 hover:text-neutral-300 my-5';
	// console.log("user.status2FA:", user.status2FA);
	console.log(user);
	if (user.status2FA)
	{
		const responseGet = await fetch('/api/auth/get2FA', { method: 'GET', credentials: 'include' });
		let res;
		if (response.ok)
			res = await responseGet.json();
		// const qrImageURL = await QRCode.toDataURL(res.url);
		// console.log(res);
		if (responseGet.ok)
		{
			const img = document.createElement('img');
			img.src = res.qrCode;
			img.alt = 'Scan me';
			const codeBase32 = document.createElement('h1');
			codeBase32.classList = 'block mb-2 text-base font-bold text-white';
			codeBase32.textContent = res.secret;
			// console.log(qrImageURL);
			const div2FA = document.createElement('div');
			div2FA.classList = 'h-fit flex flex-col items-center-safe justify-center w-full';
	
			div2FA.appendChild(img);
			div2FA.appendChild(codeBase32);
			settingsDiv.appendChild(div2FA);
		}
		TwoFAButton.textContent = 'Deactivate 2FA';
	}
	else
	{
		TwoFAButton.textContent = 'Activate 2FA';
		
	}
	TwoFAButton.addEventListener('click', () => {
			active2FAForm();
		})
	TwoFAButtonDiv.appendChild(TwoFAButton);

	buttonsDiv.appendChild(TwoFAButtonDiv);


	//		Delete Account
	const deleteButtonDiv = document.createElement('div');
	deleteButtonDiv.classList = 'text-center';
	const deleteButton = document.createElement('button');
	deleteButton.id = 'deleteAccount';
	deleteButton.classList = 'bg-red-500 p-5 text-2xl font-black text-white rounded-xl hover:bg-red-600 hover:text-neutral-300 mt-5';
	deleteButton.textContent = 'Delete Account';

	deleteButton.addEventListener('click', () => {
		activeDeleteForm();
	})

	deleteButtonDiv.appendChild(deleteButton);

	buttonsDiv.appendChild(deleteButtonDiv);

	settingsBody.appendChild(buttonsDiv);
	
	appContainer.appendChild(settingsBody);

	//Save Settings
	const saveChangesButtonDiv = document.createElement('div');
	const saveChangesButton = document.createElement('button');
	saveChangesButton.id = 'saveChanges';
	saveChangesButton.classList = 'bg-blue-500 p-5 text-2xl font-black text-white rounded-xl hover:bg-blue-400 hover:text-blue-900 my-5 hidden';
	saveChangesButton.textContent = 'Save Settings';

	saveChangesButton.addEventListener('click', settings);

	saveChangesButtonDiv.appendChild(saveChangesButton);

	appContainer.appendChild(saveChangesButtonDiv);
}

// 	document.addEventListener("DOMContentLoaded", () => {

	// });
