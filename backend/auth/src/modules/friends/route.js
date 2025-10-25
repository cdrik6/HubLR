import { sendRequest, getFriends, getFriendStatus, deleteRequest, getRequests} from './controller.js';

//friend request
export async function friendRoutes(app) {
	//post request
	app.post('/friends/:id', { preHandler: [app.authenticate] }, sendRequest);
	//get friends
	app.get('/friends', { preHandler: [app.authenticate] }, getFriends);

	app.get('/friends/request', { preHandler: [app.authenticate] }, getRequests);

	//get status of request
	app.get('/friends/:id', { preHandler: [app.authenticate] }, getFriendStatus);
	//delete request
	app.delete('/friends/:id', { preHandler: [app.authenticate] }, deleteRequest);

	app.log.info('auth friend routes registered');

}

// return reply.code(401).send({ error: 'test with login' });