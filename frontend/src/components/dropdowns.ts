import { navigate } from "../main.js";
import { getCurrentUser } from "../utils/auth.js";

function createDropdownButton(name : string) : HTMLButtonElement
{
	const button = document.createElement('button');
	button.id = 'user' + name;
	button.className = 'hover:bg-neutral-300 hover:text-neutral-500 text-center py-2';
	button.textContent = name;

	return (button);
}

export function createUserDropdown() : HTMLDivElement
{
	const userDropdown = document.createElement('div');
	userDropdown.className = 'absolute flex flex-col top-11/12 right-6 bg-neutral-400 w-44 rounded-md py-2.5 text-gray-50 font-bold hidden';
	userDropdown.id = 'userDropdown';

	//Profile Button
	const profile = createDropdownButton('Profile');
	profile.addEventListener('click', async (event) => {
		userDropdown.classList.toggle('hidden');
		const user = await getCurrentUser();
		console.log(user);
		if (user)
			navigate(`/users/${user.username}`);
	})

	//Stats Button
	// const stats = createDropdownButton('Stats');

	//Friends Button
	const friends = createDropdownButton('Friends');
	friends.addEventListener('click', async (event) => {
		userDropdown.classList.toggle('hidden');
		navigate('/friends');
	})

	//Settings Button
	const settings = createDropdownButton('Settings');
	settings.addEventListener('click', async (event) => {
		userDropdown.classList.toggle('hidden');
		const user = await getCurrentUser();
		console.log(user);
		if (user)
			navigate(`/users/${user.username}/edit`);
	})

	//SignOut Button
	const signOut = createDropdownButton('SignOut');
	signOut.textContent = 'Sign Out';
	signOut.addEventListener('click', async (event) => {
		userDropdown.classList.toggle('hidden');
		const response = await fetch('/api/auth/logout', { method: 'DELETE', credentials: 'include' });
		// document.cookie = '';
		console.log(response);
		navigate('/');
		location.reload();
	})

	userDropdown.append(profile, friends, settings, signOut);
	
	document.addEventListener('click', (event) => {
		if (!userDropdown.classList.contains('hidden') && !userDropdown.contains(event.target as Node))
		{
			console.log(event.target);
			const profileButton = document.getElementById('profileButton');
			if (profileButton && (profileButton === (event.target as Node) || profileButton.contains(event.target as HTMLElement)))
				{console.log('profileButton clicked'); return ;}
			userDropdown.classList.toggle('hidden');
			console.log("user Dropdown closed")
		}
	})

	return (userDropdown);
}