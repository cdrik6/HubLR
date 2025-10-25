import { userType } from "../utils/types";
import * as buttons from "../components/buttons.js"
import { navigate } from "../main.js";
import { getCurrentUser } from "../utils/auth.js";
declare const Chart: any;
declare const Tabulator: any;
declare global {
  interface Window { Tabulator: any; }
}


function profileBodyElement(title: string) : HTMLDivElement {
	const element =	document.createElement('div');
	element.classList = 'rounded-xl pb-5  mx-8 flex flex-col items-center bg-neutral-200 h-fit shadow-sm shadow-zinc-400';
	
	const elementTitle = document.createElement('p');
	elementTitle.classList = 'text-2xl font-mono mt-4 text-neutral-600';
	elementTitle.textContent = title;

	element.appendChild(elementTitle);

	return element;
}

async function createAddButton(user: userType, flag : boolean) : Promise<HTMLDivElement> {
	const mainDiv = document.createElement('div');
	mainDiv.classList = 'absolute top-0 right-0 my-2 mx-5';
	const addButton = document.createElement('button');
	addButton.classList = 'text-white text-5xl hover:text-blue-400';
	addButton.textContent = '+';
	addButton.title = 'Send friend request';
	if (flag)
	{
		addButton.title = 'Add to friends'
	}

	addButton.addEventListener('click', async ()=>{
		try {
			// Check if user send it or he friend  send it
			const res = await fetch(`/api/auth/friends/${user.id}`, { method: 'POST', credentials: 'include' })
			console.log("status", res.status);
			if (res.ok)
				location.reload();
		} catch (error) {
			console.log(error);
		}
	})

	mainDiv.appendChild(addButton);
	return (mainDiv);
}

export async function renderProfile(username : string) {
	const  appContainer = document.getElementById("app");
	if (!appContainer)
		return ;
	appContainer.innerHTML = '';
	const response = await fetch(`/api/auth/users/${username}`, { method: 'GET', credentials: 'include' })
	const user = await response.json();
	if (!response.ok || !user)
	{
		appContainer.innerHTML = '<h2>404 Not Found</h2>';
		return ;
	}
	//		User Profile Header
	const profileHeader = document.createElement('header');
	profileHeader.id = 'profileHeader';
	profileHeader.classList = 'relative w-full h-auto  backdrop-blur-xs';//bg-linear-to-r from-[#0D0726] to-[#150940]

	// if (Not friends) {profileHeader.appendChild(createAddButton)};
	try {
		console.log(user.id);
		const myUser = await getCurrentUser();
		const res = await fetch(`/api/auth/friends/${user.id}`, { method: 'GET', credentials: 'include' })
		console.log("status", res.status)
		const status = await res.json();
		console.log(status)

		if ((!res.ok && res.status != 401) || (res.ok && myUser && status.sender != myUser.id && status.status === "pending"))
		{
			console.log("inserting");
			profileHeader.appendChild(await createAddButton(user, (res.ok && status.sender != myUser?.id && status.status === "pending")));
		}
	} catch (error) {
		console.log(error);
	}

	// Add default image or user image for background ${user.profileBackground}

	// if (user.banner)
		// profileHeader.style = `background-image: url("/api/users/public/banners/${user.banner}"); background-position: center;`;
	// `background-image: url("https://upgifs.com//img/gifs/xThuWtNFKZWG6fUFe8.gif"); background-position: center;`;

	const userHeaderDiv = document.createElement('div');
	userHeaderDiv.classList = 'mx-16 my-6 w-2/3 flex justify-start items-center space-x-36';
	
	const userAvatar = document.createElement('img');
	userAvatar.classList = 'w-80 h-80 rounded-full border-4 border-white';

	userAvatar.src = `/api/users/public/avatars/${user.avatarURL}`;
	
	const userInfoDiv = document.createElement('div');
	userInfoDiv.classList = 'flex flex-col text-white';
	const usernameDisplay = document.createElement('p');
	usernameDisplay.classList = 'text-6xl font-mono';
	usernameDisplay.textContent = user.username;
	userInfoDiv.appendChild(usernameDisplay);
	
	userHeaderDiv.appendChild(userAvatar);
	userHeaderDiv.appendChild(userInfoDiv);

	profileHeader.appendChild(userHeaderDiv);


	// Add tabulator library



	//		User Profile Body --> stats
	const profileBody = document.createElement('div');
	// profileBody.classList = 'grid grid-cols-2 justify-between w-full'	
	profileBody.classList = "grid w-full grid-cols-2 min-h-1 justify-between gap-10 2xl:grid-cols-3";

	const statsContainer = profileBodyElement('Global Stats');	
	statsContainer.classList.add('flex', 'flex-col', 'space-y-10');
	const matchContainer = profileBodyElement('User Stats');	
	matchContainer.classList.add('flex', 'flex-col', 'space-y-10');
	// const allDataContainer = profileBodyElement('Historical Data');	
	// allDataContainer.classList.add('flex', 'flex-col', 'space-y-10');
	const userDataContainer = profileBodyElement('User Data');	
	userDataContainer.classList.add('flex', 'flex-col', 'space-y-10');



	// Bar
	const canvasBar = document.createElement("canvas");	
	canvasBar.width = 200;
	canvasBar.height = 200;
	statsContainer.appendChild(canvasBar);		
	const ctxBar = canvasBar.getContext("2d");
	if (!ctxBar) throw new Error("Cannot get bar canvas context");
	fetch(`/api/stats/bar`, { method: 'GET', credentials: 'include' })	
	.then(res => {
		if (!res.ok) { throw new Error(`HTTP error status: ${res.status}`); }
		return (res.json());
	})
	.then(function(data)
	{	
		new Chart(ctxBar,
			{
				type: 'bar',
				data: {
					labels: data.player,
					datasets: [	{ label: 'Number of Wins', data: data.nbWin },
								{ label: 'Score Differential', data: data.point },
								{ label: 'Number of Matches', data: data.nbMatch }	]
				},
				options: {
					indexAxis: 'y', // horizontal bars
					responsive: true,
					maintainAspectRatio: true,
					plugins: {
						legend: { position: 'bottom' },
						title: { display: true,	text: 'Player Rankings'	}
					},
					scales: {						
						x: { stacked: true }, // x: { beginAtZero: true },
						y: { stacked: true }
					}
				}
			});		
  	})
	.catch(err => { console.error("Bar chart failed: ", err); });	



	// Pie
	const canvasPie = document.createElement("canvas");	
	canvasPie.width = 200;
	canvasPie.height = 200;
	statsContainer.appendChild(canvasPie);		
	const ctxPie = canvasPie.getContext("2d");
	if (!ctxPie) throw new Error("Cannot get pie canvas context");
	fetch(`/api/stats/pie`, { method: 'GET', credentials: 'include' })	
	.then(res => {
		if (!res.ok) { throw new Error(`HTTP error status: ${res.status}`); }
		return (res.json());
	})
	.then(function(data)
	{	
		new Chart(ctxPie,
			{
				type: 'pie',
				data: {
					labels: data.labels,
					datasets: [{ data: data.values }]
			 	},
				options: {					
					responsive: true,
					maintainAspectRatio: true,
					plugins: {
						legend: { position: 'bottom' },
						title: { display: true,	text: 'Customization Preferences'}
					}
				}
			});
  	})
	.catch(err => { console.error("Pie chart failed: ", err); });


	
	// Scatter
	const canvasScatter = document.createElement("canvas");	
	canvasScatter.width = 200;
	canvasScatter.height = 200;
	statsContainer.appendChild(canvasScatter);		
	const ctxScatter = canvasScatter.getContext("2d");
	if (!ctxScatter) throw new Error("Cannot get Scatter canvas context");
	fetch(`/api/stats/scatter`, { method: 'GET', credentials: 'include' })
	.then(res => {
		if (!res.ok) { throw new Error(`HTTP error status: ${res.status}`); }
		return (res.json());
	})
	.then(function(data)
	{	
		new Chart(ctxScatter,
			{
				type: 'scatter',
				data: {					
					datasets: [{ label: 'Spread vs Max Touch', data: data }]
				},
				options: {					
					responsive: true,
					maintainAspectRatio: true,
					plugins: {
						legend: { display: false },
						title: { display: true,	text: 'Spread vs Max Touch'	}
					},
					scales: {						
						x: { title: { display: true, text: 'Spread' } },
						y: { title: { display: true, text: 'Max Touch' } }
					}
				}
			});		
  	})
	.catch(err => { console.error("Bar chart failed: ", err); });	



	// User data	
	const preData = document.createElement("pre");		
	userInfoDiv.appendChild(preData);
	fetch(`/api/stats/${encodeURIComponent(user.id)}/userdata`, { method: 'GET', credentials: 'include' })	
	.then(res => {
		if (!res.ok) { throw new Error(`HTTP error status: ${res.status}`); }
		return (res.json());
	})
	.then(function(data)
	{		
		if (data[0].rank)
			preData.textContent += "Rank: " + data[0].rank + "\n";
		else 
			preData.textContent += "Rank: 0\n";
		if (data[0].nbMatch)
			preData.textContent += "Matches played: " + data[0].nbMatch + "\n";
		else
			preData.textContent += "Matches played: 0\n";
		if (data[0].nbWin)
			preData.textContent += "Matches won: " + data[0].nbWin + "\n";
		else
			preData.textContent += "Matches won: 0\n";
		if (data[0].diff)
			preData.textContent += "Differential points: " + data[0].diff + "\n";
		else
			preData.textContent += "Differential points: 0\n";
		if (data[0].maxtouch)
			preData.textContent += "Longuest rally: " + data[0].maxtouch + "\n";
		else
			preData.textContent += "Longuest rally: 0\n";
			
  	})
	.catch(err => { console.error("User data failed: ", err); });



	// User Win Line
	const canvasUserWin = document.createElement("canvas");	
	canvasUserWin.width = 200;
	canvasUserWin.height = 200;
	matchContainer.appendChild(canvasUserWin);		
	const ctxUserWin = canvasUserWin.getContext("2d");
	if (!ctxUserWin) throw new Error("Cannot get user win canvas context");
	fetch(`/api/stats/${encodeURIComponent(user.id)}/userwin`, { method: 'GET', credentials: 'include' })	
	.then(res => {
		if (!res.ok) { throw new Error(`HTTP error status: ${res.status}`); }
		return (res.json());
	})
	.then(function(data)
	{	
		new Chart(ctxUserWin,
			{
				type: 'line',
				data: {
					labels: data.row,
					datasets: [{ data: data.win }]
			 	},
				options: {					
					responsive: true,
					maintainAspectRatio: true,
					plugins: {
						legend: { display: false },
						title: { display: true,	text: 'Win Progression'}
					},
					scales: {						
						x: { title: { display: true, text: 'Match number' } },
						y: { title: { display: true, text: 'Win index' } }
					}
				}
			});
  	})
	.catch(err => { console.error("User win chart failed: ", err); });



	// User Pie
	const canvasUserPie = document.createElement("canvas");	
	canvasUserPie.width = 200;
	canvasUserPie.height = 200;
	matchContainer.appendChild(canvasUserPie);		
	const ctxUserPie = canvasUserPie.getContext("2d");
	if (!ctxUserPie) throw new Error("Cannot get user pie canvas context");
	fetch(`/api/stats/${encodeURIComponent(user.id)}/userpie`, { method: 'GET', credentials: 'include' })	
	.then(res => {
		if (!res.ok) { throw new Error(`HTTP error status: ${res.status}`); }
		console.log(res.status);
		return (res.json());
	})
	.then(function(data)
	{	
		new Chart(ctxUserPie,
			{
				type: 'pie',
				data: {
					labels: data.labels,
					datasets: [{ data: data.values }]
			 	},
				options: {					
					responsive: true,
					maintainAspectRatio: true,
					plugins: {
						legend: { position: 'bottom' },
						title: { display: true,	text: 'Customization Preferences' }
					}
				}
			});
  	})
	.catch(err => { console.error("User pie chart failed: ", err); });



	// User Line	
	const canvasUserLine = document.createElement("canvas");	
	canvasUserLine.width = 200;
	canvasUserLine.height = 200;
	matchContainer.appendChild(canvasUserLine);		
	const ctxUserLine = canvasUserLine.getContext("2d");
	if (!ctxUserLine) throw new Error("Cannot get user line canvas context");
	fetch(`/api/stats/${encodeURIComponent(user.id)}/userline`, { method: 'GET', credentials: 'include' })
	.then(res => {
		if (!res.ok) { throw new Error(`HTTP error status: ${res.status}`); }
		return (res.json());
	})
	.then(function(data)
	{	
		new Chart(ctxUserLine,
			{
				type: 'line',
				data: {
					labels: data.row,
					datasets: [{ data: data.maxtouch }]
			 	},
				options: {					
					responsive: true,
					maintainAspectRatio: true,
					plugins: {
						legend: { display: false },
						title: { display: true,	text: 'Paddle Touch Progression'}
					},
					scales: {						
						x: { title: { display: true, text: 'Match number' } },
						y: { title: { display: true, text: 'Max Touch' } }
					}
				}
			});
  	})
	.catch(err => { console.error("User line chart failed: ", err); });



	//
	await loadTabulator();



	// Tabulator --> to get userdata
	const tableUser = document.createElement("div");	
	tableUser.id = "userdatatable";	
	tableUser.classList.add("w-full");
	userDataContainer.appendChild(tableUser);
	fetch(`/api/stats/${encodeURIComponent(user.id)}/usertable`, { method: 'GET', credentials: 'include' })	
	.then(res => {
		if (!res.ok) { throw new Error(`HTTP error status: ${res.status}`); }
		return (res.json());
	})
	.then(function(data)
	{		
		new Tabulator('#userdatatable', {
			// height: "500px",			
			data: data,
			columns: [
				{ title: 'ID', field: 'id' },
				// { title: 'Game ID', field: 'gameid' },
				{ title: 'Player 1', field: 'player1' },
				{ title: 'Player 2', field: 'player2' },
				{ title: 'Winner', field: 'winner' },
				{ title: 'Score 1', field: 'score1' },
				{ title: 'Score 2', field: 'score2' },
				{ title: 'Max Touch', field: 'maxtouch' },
				{ title: 'Speedy', field: 'speedy' },
				{ title: 'Paddy', field: 'paddy' },
				{ title: 'Wally', field: 'wally' },
				{ title: 'Mirry', field: 'mirry' },
				{ title: 'Multy', field: 'multy' },
				{ title: 'Created', field: 'created_at' }
			]
		});		
  	})
	.catch(err => { console.error("User table data failed: ", err); });	
	
	

	// // Tabulator --> to get all data
	// const tableAll = document.createElement("div");	
	// tableAll.id = "alldatatable";
	// tableAll.classList.add("w-full");
	// allDataContainer.appendChild(tableAll);	
	// fetch(`/api/stats/datatable`, { method: 'GET' })
	// .then(res => { return (res.json()); })
	// .then(function(data)
	// {	
	// 	new Tabulator('#alldatatable', {
	// 		height: "500px",
	// 		data: data,
	// 		columns: [
	// 			{ title: 'ID', field: 'id' },
	// 			//{ title: 'Game ID', field: 'gameid' },
    //       		{ title: 'Player 1', field: 'player1' },
    //       		{ title: 'Player 2', field: 'player2' },
    //       		{ title: 'Winner', field: 'winner' },
    //       		{ title: 'Score 1', field: 'score1' },
    //       		{ title: 'Score 2', field: 'score2' },
	// 			{ title: 'Max Touch', field: 'score2' },
	// 			{ title: 'Speedy', field: 'speedy' },
	// 			{ title: 'Paddy', field: 'paddy' },
	// 			{ title: 'Wally', field: 'wally' },
	// 			{ title: 'Mirry', field: 'mirry' },
	// 			{ title: 'Multy', field: 'multy' },
	// 			{ title: 'Created', field: 'created_at' }
	// 		]
	// 	});
  	// })
	// .catch(err => { console.error("User table data failed: ", err); });		



	profileBody.appendChild(statsContainer);
	profileBody.appendChild(matchContainer);
	// profileBody.appendChild(allDataContainer);
	profileBody.appendChild(userDataContainer);
	
	appContainer.appendChild(profileHeader);
	appContainer.appendChild(profileBody);	
}


function loadTabulator()
{
	return new Promise((resolve, reject) =>
	{
		if (window.Tabulator)
		{
			resolve("Tabulator already loaded.");
			return ;
		}	
	
		// https://unpkg.com/tabulator-tables/dist/js/tabulator.min.js
		const script = document.createElement("script");
		script.src = "https://unpkg.com/tabulator-tables@6.2.1/dist/js/tabulator.min.js";
		script.async = true;
		script.onload = () => resolve("Tabulator loaded!");
		script.onerror = () => reject(new Error("Failed to load Tabulator"));
		document.head.appendChild(script);

		// https://unpkg.com/tabulator-tables/dist/css/tabulator.min.css
		const link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = "https://unpkg.com/tabulator-tables@6.2.1/dist/css/tabulator.min.css";
		document.head.appendChild(link);
  	});
}