import { register2FA, get2FA, verify2FA, deactivate2FA } from './controller.js';

export async function routes2FA(app) {
    app.post('/register2FA', { preHandler: [app.authenticate] }, register2FA);
    app.get('/get2FA', { preHandler: [app.authenticate] }, get2FA);
    app.post('/verify2FA', verify2FA);
    app.post('/deactivate2FA', { preHandler: [app.authenticate] }, deactivate2FA);

    app.log.info('auth user routes registered');

}