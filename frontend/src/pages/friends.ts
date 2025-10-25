import { navigate } from "../main.js";
import { getCurrentUser } from "../utils/auth.js";
import { userType } from "../utils/types.js";

function createUserDisplay(user: userType) : HTMLDivElement{
	const mainDiv = document.createElement('div');
	mainDiv.classList = 'm-1.5 group flex flex-col items-center bg-neutral-300 p-3.5 rounded-2xl hover:bg-neutral-500';
	
	const avatarDiv = document.createElement('div');
	avatarDiv.classList = 'relative';
	const userStatus = document.createElement('span');
	userStatus.classList = 'top-0 right-0 absolute w-5 h-5 bg-red-600 rounded-full';
	if (user.is_active)
	{
		userStatus.classList = 'top-0 right-0 absolute w-5 h-5 bg-green-500 rounded-full';
		const animatedStatus = document.createElement('span');
		animatedStatus.classList = 'top-0 right-0 absolute w-5 h-5 animate-ping bg-green-500 rounded-full';
		avatarDiv.appendChild(animatedStatus);
	}
	avatarDiv.appendChild(userStatus);

	const avatarImg = document.createElement('img');
	avatarImg.className = 'w-60 h-60 rounded-full';
	avatarImg.src = `/api/users/public/avatars/${user.avatarURL}`;
	avatarDiv.appendChild(avatarImg);

	mainDiv.appendChild(avatarDiv);

	const usernameDisplay = document.createElement('h2');
	usernameDisplay.classList = 'text-2xl font-medium group-hover:text-white';
	usernameDisplay.textContent = user.username;

	mainDiv.appendChild(usernameDisplay);

	mainDiv.addEventListener('click', async () => {
		navigate(`/users/${user.username}`);
	})


	const buttonDiv = document.createElement('div');
	buttonDiv.classList = 'relative items-center w-full';
	const removeButton = document.createElement('button');
	removeButton.classList = 'absolute right-1/2 transform translate-x-1/2 border-2 m-1.5 px-2.5 py-1 rounded-lg items-center border-red-500 bg-red-400 text-white hover:bg-red-300 hover:text-red-500 font-black';
	removeButton.textContent = 'Remove';
	removeButton.title = 'Remove from Friends';
	removeButton.addEventListener('click', async (e) => {
		e.preventDefault();
		e.stopPropagation();

		const response = await fetch(`/api/auth/friends/${user.id}`, { method : 'DELETE', credentials : 'include' })
		if (!response || !response.ok)
			console.log("Error requesting a friend delete");
		else
			location.reload();
	})

	buttonDiv.appendChild(removeButton);

	mainDiv.appendChild(buttonDiv);

	return (mainDiv);
}

function createRequest(user: userType) : HTMLDivElement {
	const mainDiv = document.createElement('div');
	mainDiv.classList = 'm-1.5 flex flex-row items-center rounded-2xl bg-neutral-300 p-3.5 justify-around w-96';
	const userDiv = document.createElement('div');
	userDiv.classList = 'group text-center flex items-center w-1/2 justify-around hover:bg-neutral-400 rounded-full';
	userDiv.addEventListener('click', async () => {
		navigate(`/users/${user.username}`);
	})
	const avatarImg = document.createElement('img');
	avatarImg.className = 'w-20 h-20 rounded-full';
	avatarImg.src = `/api/users/public/avatars/${user.avatarURL}`;
	userDiv.appendChild(avatarImg);
	const username = document.createElement('h1');
	username.textContent = user.username;
	username.classList = 'group-hover:text-white';
	userDiv.appendChild(username);

	mainDiv.appendChild(userDiv);

	const buttonDiv = document.createElement('div');
	buttonDiv.classList = 'text-center flex items-center w-1/4 justify-around'
	const acceptButton = document.createElement('button');
	acceptButton.classList = 'bg-neutral-500 text-4xl px-1 rounded-full text-white hover:bg-neutral-200 hover:text-black';
	acceptButton.textContent = '✓';
	acceptButton.addEventListener('click', async () => {
		try {
			const res = await fetch(`/api/auth/friends/${user.id}`, { method: 'POST', credentials: 'include' })
			console.log("status", res.status);
			if (res.ok)
				location.reload();
		} catch (error) {
			console.log(error);
		}
	})
	buttonDiv.appendChild(acceptButton);
	const rejectButton = document.createElement('button');
	rejectButton.classList = 'bg-neutral-500 text-4xl px-2 rounded-full text-white hover:bg-neutral-200 hover:text-black'
	rejectButton.textContent = 'X';
	rejectButton.addEventListener('click', async (e) => {
		e.preventDefault();
		e.stopPropagation();

		const response = await fetch(`/api/auth/friends/${user.id}`, { method : 'DELETE', credentials : 'include' })
		if (!response || !response.ok)
			console.log("Error requesting a friend delete");
		else
			location.reload();
	})
	buttonDiv.appendChild(rejectButton);

	mainDiv.appendChild(buttonDiv);

	return (mainDiv);
}

export async function renderFriends() {
	const  appContainer = document.getElementById("app");
	if (!appContainer)
		return ;
	appContainer.innerHTML = '';
	const user = await getCurrentUser();
	if (!user)
	{
		// navigate('/');
		appContainer.innerHTML = '<h2>404 Not Found</h2>';
		return ;
	}
	const mainDiv = document.createElement('div');
	mainDiv.classList = 'flex-1 flex m-4 w-full justify-between';

	const friendsContainer = document.createElement('div');
	friendsContainer.classList = 'flex-1 space-y-8 w-1/2';

	const friendTitle = document.createElement('h1');
	friendTitle.classList = 'text-center text-3xl text-[#36BFB1] font-medium';
	friendTitle.textContent = 'Friends';
	friendsContainer.appendChild(friendTitle);

	const requestsContainer = document.createElement('div');
	requestsContainer.classList = 'flex-1 space-y-8 w-1/2';

	const requestTitle = document.createElement('h1');
	requestTitle.classList = 'text-center text-3xl text-[#36BFB1] font-medium';
	requestTitle.textContent = `Friend's requests`;
	requestsContainer.appendChild(requestTitle);


	const friendsDiv = document.createElement('div');
	friendsDiv.classList = 'flex flex-wrap';

	const requestDiv = document.createElement('div');
	requestDiv.classList = 'flex flex-col justify-between w-full items-center';

	try {
		const friendsResponse = await fetch('/api/auth/friends', { method : 'GET', credentials : 'include' });
		if (friendsResponse.ok)
		{
			const friends = await friendsResponse.json();
			friends.forEach(async (friend : userType) => {
					console.log(friend);
					friendsDiv.appendChild(createUserDisplay(friend));
				});
		}
		const requestsResponse = await fetch('/api/auth/friends/request', { method : 'GET', credentials : 'include' });
		if (requestsResponse.ok)
		{
			const requests = await requestsResponse.json();
			requests.forEach(async (request : userType) => {
					console.log(request);
					requestDiv.appendChild(createRequest(request));
				});
		}
	}
	catch (err) {
		console.log(err)
	}

	friendsContainer.appendChild(friendsDiv);
	
	requestsContainer.appendChild(requestDiv);

	mainDiv.appendChild(friendsContainer);
	mainDiv.appendChild(requestsContainer);

	appContainer.appendChild(mainDiv);
}