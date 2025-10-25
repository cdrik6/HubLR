import { registerSchema, loginSchema } from './schema.js';
import { userPassword, userInfo, editUser, createUser, login, logout, profileMe, deleteAccount, userPing } from './controller.js';

export async function userRoutes(app) {

    app.get('/me', { preHandler: [app.authenticate] }, profileMe);

    app.get('/users/:username', { preHandler: [app.authenticate] }, userInfo);

    app.post('/register', {
        schema: registerSchema
    }, createUser);

    app.post('/login', {
        schema: loginSchema
    }, login);

    app.post('/ping',  { preHandler: [app.authenticate] }, userPing);

    app.patch("/password", { preHandler: [app.authenticate] }, userPassword);

    app.patch("/users/:username/edit", { preHandler: [app.validate] }, editUser);
    app.get("/users/:username/edit", { preHandler: [app.validate] }, userInfo);

    app.delete('/logout', { preHandler: [app.authenticate] }, logout);

    app.post('/account', { preHandler: [app.authenticate] }, deleteAccount)
    app.log.info('auth user routes registered');
}