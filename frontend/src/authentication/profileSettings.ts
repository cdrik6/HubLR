import { showAlert } from "../components/alerts.js";
import { navigate } from "../main.js";
import { getCurrentUser } from "../utils/auth.js";
import { compressImage } from "../utils/files.js";
import { userType } from "../utils/types.js";
import { Player } from "../utils/types.js";

async function checkUsernameInput(username:string) : Promise<boolean>{
	const set = new Set([" ", "\t", "\n", "\r"]);
	const errorMessage = document.getElementById('errorMessageSettings');
	const error = document.createElement('p');
	if (!username || username.length < 5 || username.length > 7)
	{
		error.textContent = "Invalid username (min : 5 and max : 7 characters)";
		if (errorMessage)
			errorMessage.appendChild(error);
		return (false);
	}
	if (([...username].some((char) => set.has(char))))
	{
		error.textContent = "Invalid username (no spaces allowed in 'username')";
		if (errorMessage)
			errorMessage.appendChild(error);
		return (false);
	}
	const response = await fetch(`/api/auth/users/${username}`, { method: 'GET', credentials: 'include' });

	return (!response.ok);
}

async function checkEmailInput(email:string) : Promise<boolean>{
	const pattern = new RegExp("[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?");
	const set = new Set([" ", "\t", "\n", "\r"]);
	const errorMessage = document.getElementById('errorMessageSettings');
	const error = document.createElement('p');

	if (!email)
	{
		error.textContent = "Invalid email (empty email)";
		if (errorMessage)
			errorMessage.appendChild(error);
		return (false);
	}
	if (!pattern.test(email) || ([...email].some((char) => set.has(char))))
	{
		error.textContent = "Invalid email format";
		if (errorMessage)
			errorMessage.appendChild(error);
		return (false);
	}
	return (true);
}


export async function settings() {
	const user = await getCurrentUser();
	
	if (!user)
	{
		console.log("error with user authentication");
		return ;
	}
	console.log(user);
	const formData = new FormData();
	const set = new Set([" ", "\t", "\n", "\r"]);
	const usernameInput = document.getElementById('usernameInput') as HTMLInputElement;

	if (usernameInput && await checkUsernameInput(usernameInput.value) && (usernameInput.value != usernameInput.defaultValue))
	{
		console.log("default value:", usernameInput.defaultValue);
		console.log("new value:", usernameInput.value);
		
		formData.append('username', usernameInput.value);		
		await amendStatsDB(user.id, usernameInput.value);
	}	

	const emailInput = document.getElementById('emailInput') as HTMLInputElement;
	if (emailInput && await checkEmailInput(emailInput.value) && (emailInput.value != emailInput.defaultValue))
	{
		console.log("default value:", emailInput.defaultValue);
		console.log("new value:", emailInput.value);
		formData.append('email', emailInput.value);
	}

	const avatarFile = document.getElementById('avatarInput') as HTMLInputElement;
	if (avatarFile && avatarFile.files?.[0])
	{
		let file = avatarFile.files?.[0];
		console.log("before size:", file.size / 1024)
		if ((file.size / 1024) > 100)
		{
			const compressedBlob = await compressImage(file);
			file = new File([compressedBlob], file.name, { type: compressedBlob.type });
		}
		formData.append('avatar', file, file.name);
		console.log("after size:", file.size / 1024);
	}
	// const bannerFile = document.getElementById('bannerInput') as HTMLInputElement;
	// if (bannerFile && bannerFile.files?.[0])
	// 	formData.append('banner', bannerFile.files?.[0]);

	const response = await fetch(`/api/auth/users/${user.username}/edit`, {
		method: 'PATCH', 
		credentials: 'include',
		body: formData,
	});
	const data = await response.json();
	if (!response.ok || data.results.length < 1)
	{
		showAlert("Some changes could not be saved due to an error. Please check and retry the ones that failed")
	}
	else
	{
		const user = await getCurrentUser();
		if (user)
		{
			console.log(user.username)
			window.location.replace(`/users/${user.username}/edit`);
		}
	}
	console.log(data);
	// location.reload();
}


const errorMessage = document.createElement('h1');
errorMessage.className = 'block text-red-500 text-base font-bold';

async function changePassword(e : Event) {
	e.preventDefault();
	
	
	const form = e.target as HTMLFormElement;
	const formData = new FormData(form);
	
	const currentPassword = formData.get('currentPassword') as string;
	const newPassword = formData.get('newPassword') as string;
	
	if (currentPassword && newPassword.length < 6) return (showAlert("Bad password length (minimum 6 characters)")) ;

	const response = await fetch('/api/auth/password', { 
		method: 'PATCH',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json; charset=UTF-8',},
		body: JSON.stringify({
			oldPassword: currentPassword,
			newPassword: newPassword,
		})
	})
	if (response.ok)
	{
		showAlert("Password changed");
		location.reload();
	}
	else {
		console.log("bad response profileSettings.ts")
		const data = await response.json();
		errorMessage.textContent = data.error;
		console.log(data);
	}
}

export function activeNewPasswordForm() {
	const filter = document.getElementById('filter');
	const form = document.getElementById("new-password-form");
	const popup = document.getElementById('popup');
	if (!filter || !popup || !form)
	{
		console.log("error creating popup");
		return ;
	}
	console.log("opening form");
	form.appendChild(errorMessage);
	errorMessage.textContent = "";
	filter.classList.remove("hidden");
	form.classList.remove("hidden");
	
	document.addEventListener('click', (event) => {
	if (!(filter.classList.contains("hidden")) && !(form.classList.contains("hidden"))
		&& !form.contains(event.target as Node)
		&& (event.target as Node) !== document.getElementById('changePassword'))
	{
		console.log("closing form");
		filter.classList.add("hidden");
		form.classList.add("hidden");
		form.removeEventListener('submit', changePassword)
	}});
	form.addEventListener('submit', changePassword)
}

const deleteErrorMessage = document.createElement('h1');
deleteErrorMessage.className = 'block text-red-500 text-base font-bold';

async function checkForOngoingLobby() {
	const user = await getCurrentUser() as userType;
	const res = await fetch('/api/lobby/', { method : 'GET', credentials : 'include' });
	if (!res.ok)
		throw new Error ("Communication with lobby microservice failed")
	const body = await res.json();
	const lobbies = body.lobbies;
	let userLobby = null;
	for (let lobby of lobbies) {
		if (lobby.players.map((p: Player) => p.id).includes(user.id)) {
			userLobby = lobby;
		}
	}
	if (!userLobby) {
		return ;
	}
	else if (userLobby.host.id == user.id) {
		const res = await fetch(`/api/lobby/${userLobby.id}`, { method : 'DELETE', credentials : 'include' });
		if (!res.ok)
			throw new Error ("Communication with lobby microservice failed")
	}
	else {
		const res = await fetch(`/api/lobby/${userLobby.id}/player`,
			{ method : 'DELETE', credentials : 'include', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({player: {id: user.id, alias: user.username}}) });
		if (!res.ok)
			throw new Error ("Communication with lobby microservice failed")
	}

}

export async function deleteAccount(e : Event) {
	e.preventDefault();

	
	const form = e.target as HTMLFormElement;
	const formData = new FormData(form);
	
	const password = formData.get('password') as string;
	
	
	if (!password || password.length < 6) return ;

	console.log("deleting account:", password);


	// const sendData = new FormData();
	
	// sendData.append('password', password)

	try {
		checkForOngoingLobby();
	} catch (e) {
		console.log(`Error: ${e}`)
		showAlert("account not deleted")
		return ;
	}

	try {
		checkForOngoingLobby();
	} catch (e) {
		console.log(`Error: ${e}`)
		showAlert("account not deleted")
		return ;
	}

	const responseDeleteStats = await fetch(`/api/stats/remove`, { method: 'DELETE', credentials: 'include'});
	console.log("stats db done")
	console.log(responseDeleteStats)

	if (responseDeleteStats.ok) {
		const dataRes = await responseDeleteStats.json();
		console.log("delete stats", dataRes);
		console.log(dataRes)
	}

	if (responseDeleteStats.ok)
	{
		const response = await fetch(`/api/auth/account`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json; charset=UTF-8',},
			body: JSON.stringify({
				'password': password,
			}),
		});
		if (response.ok) {
			showAlert("Account deleted");
			navigate('/');
			location.reload();
			return ;
		}
		const data = await response.json();
		deleteErrorMessage.textContent = data.error;
		console.log("delete account auth:", data);
	}
	showAlert("account not deleted")
	
}

export function activeDeleteForm() {
	const filter = document.getElementById('filter');
	const form = document.getElementById("delete-account-form");
	const popup = document.getElementById('popup');
	if (!filter || !popup || !form)
	{
		console.log("error creating popup");
		return ;
	}
	console.log("opening form");
	form.appendChild(deleteErrorMessage);
	deleteErrorMessage.textContent = "";
	filter.classList.remove("hidden");
	form.classList.remove("hidden");

	document.addEventListener('click', (event) => {
	if (!(filter.classList.contains("hidden")) && !(form.classList.contains("hidden"))
		&& !form.contains(event.target as Node)
		&& (event.target as Node) !== document.getElementById('deleteAccount'))
	{
		console.log("closing form");
		filter.classList.add("hidden");
		form.classList.add("hidden");
		form.removeEventListener('submit', deleteAccount);
	}});
	form.addEventListener('submit', deleteAccount);
}

async function amendStatsDB(userid: number, newAlias: string)
{
	// console.log("for stats:" + userid + " - " + newAlias);
	try {
		const res = await fetch(`/api/stats/${encodeURIComponent(userid)}/amend`, {
				method: 'PATCH',			
				headers: { 'Content-Type': 'application/json; charset=UTF-8'},
				body: JSON.stringify({ newAlias: newAlias })
			})		
		if (!res.ok) { throw new Error(`HTTP error status: ${res.status}`); }		
		const data = await res.json();	
		console.log("Server response:", data);
	}	
	catch (error) {
		console.error("Server error:", error);
	}
	// fetch(`/api/stats/${encodeURIComponent(userid)}/amend`, {
	// 		method: 'PATCH',			
	// 		headers: { 'Content-Type': 'application/json; charset=UTF-8'},
	// 		body: JSON.stringify({ newAlias: newAlias })
	// 	})
	// .then(res => {
	// 	if (!res.ok) { throw new Error(`HTTP error status: ${res.status}`); }
	// 	return (res.json());
	// })	
	// .then(message => { console.log("Server response:", message); })
    // .catch(error => { console.error("Server error:", error); });
}
