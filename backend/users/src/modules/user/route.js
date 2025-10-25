// import { registerSchema } from "./schema.js";
import { isCreated, updateUser, getUser, insertUser, removeUser, uploadFiles } from "./controller.js";

export async function userRoutes(app) {

	// app.get('/', (req, reply) => {
	// 	reply.send({hello: "World"});
	// });

	app.post('/upload-avatar', uploadFiles);

	app.post('/register', insertUser);

	app.post('/info', getUser);

	app.post('/exist', isCreated);

	app.patch('/modify', updateUser);

	app.delete('/remove', removeUser);

	app.log.info('user routes registered');
}