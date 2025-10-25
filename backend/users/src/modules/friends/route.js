import { createRequest, getFriends, deleteRequest, getStatus, getRequests } from "./controller.js";

export async function friendsRoutes(app) {

	app.post('/friends/request', createRequest);

	app.get('/friends/request', getRequests);

	app.get('/friends', getFriends);

	app.get('/friends/requestStatus', getStatus);

	app.delete('/friends/request', deleteRequest);

	app.log.info('friends routes registered');
}

//post request
//get friends (status = accepted)
//delete request