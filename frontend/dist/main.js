function renderPage(path_page) {	
	console.log("path page: ", path_page);	
	switch (path_page) {
		case "/":
			{
				// renderHome();
				break;
			}
		case "/friends":
			{
				// renderFriends();
				break;
			}
		case "/local":
			{
				// renderLocal();
				break;
			}
		
		
		
		default: {
			// appContainer.innerHTML = '<h2>404 Not Found</h2>';
		}
	}
}

export function navigate(path_page, pushState = true) {
	renderPage(path_page);
	if (pushState)
		history.pushState({}, '', path_page);
	else
		history.replaceState({}, '', path_page);
}
