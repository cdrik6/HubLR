import Fastify from "fastify";
import { userRoutes } from "./modules/auth/route.js";
import fjwt from '@fastify/jwt';
import fCookie from '@fastify/cookie';
import { friendRoutes } from "./modules/friends/route.js";
import { routes2FA } from "./modules/2FA/route.js";

console.log("in auth backend app");

const app = Fastify({ logger: true });

const listeners = ['SIGINT', 'SIGTERM'];
listeners.forEach((signal) => {
    process.on(signal, async () => {
        await app.close();
        process.exit(0);
    });
});

app.register(import('@fastify/multipart'));

// jwt
app.register(fjwt, { secret: process.env.JWT_SECRET });

app.decorate('authenticate', async (req, reply) => {
    const token = req.cookies.access_token || req.headers.authorization?.split(' ')[1];
    if (!token) {
        return reply.status(401).send({ message: 'Authentication required' });
    }
    let decoded;
    try {
        decoded = await req.jwt.verify(token);
    } catch (error) {
        return reply.status(401).send({ message: 'Authentication required' });
    }
    req.user = decoded;
});

app.decorate('validate', async (req, reply) => {
    const token = req.cookies.access_token || req.headers.authorization?.split(' ')[1];
    if (!token) {
        return reply.status(401).send({ message: 'Authentication required' });
    }
    const decoded = await req.jwt.verify(token);

    const response = await fetch(`http://users:443/info`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({
            'id': decoded.id
        }),
    });
    if (!response.ok) {
        console.log('user not found');
        return reply.code(401).send({ error: 'Username not found' });
    }
    const user = await response.json();
    if (!user)
        return reply.code(401).send({ error: 'Username not found' });

    const reqUsername = req.params.username;
    console.log('user.username:', user.username);
    console.log('reqUsername:', reqUsername);
    if (!user.username || user.username != reqUsername)
        return reply.code(403).send({ error: 'Unauthorized request' });
    req.user = user.id;
});

app.addHook('preHandler', (req, res, next) => {
    req.jwt = app.jwt;
    return next();
});

// cookies
app.register(fCookie, {
    secret: process.env.COOKIE_SECRET,
    hook: 'preHandler',
});

app.register(userRoutes);

app.register(routes2FA);

app.register(friendRoutes);

async function main() {
    await app.listen({ port: 443, host: '0.0.0.0' });
}

main();

app.get('/healthcheck', (req, res) => {
    res.send({ message: 'Success' });
});