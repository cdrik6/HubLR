import Fastify from "fastify";
import fastifyStatic from '@fastify/static';
import { ensureUploadDir } from "./utils/fileOperations.js";
import sqlite3 from "sqlite3";
import { userRoutes } from "./modules/user/route.js";
import { friendsRoutes } from "./modules/friends/route.js";
import { execute, closeDb } from "./utils/sql.js";

const PORT = 443;
const HOST = '0.0.0.0';

console.log("in users backend app");

const app = Fastify({ logger: true });

app.register(import('@fastify/multipart'), {
    limits: {
        fileSize: 2 * 1024 * 1024
    }
});

const db = new sqlite3.Database('/var/local/users.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);

// await ensureUploadDir();

app.register(fastifyStatic, {
    root: '/var/local/images',
    prefix: '/public/',
    list: false
});

const listeners = ['SIGINT', 'SIGTERM'];

listeners.forEach((signal) => {
    process.on(signal, async () => {
        try {
            await app.close();
            await closeDb(db);
            console.log("Users DataBase and server closed")
            process.exit(0);
        } catch(err) {
            console.error("Error closing users: ", err);
        }
    });
});

async function init() {
    try {
        await execute(
            db, `CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                is_active BOOLEAN NOT NULL DEFAULT 1,
                avatarURL TEXT,
                last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                secret2FA TEXT,
                status2FA BOOLEAN NOT NULL DEFAULT 0)`
            );
            
        console.log("Database users created (if not exists)")
        await execute(
            db, `CREATE TABLE IF NOT EXISTS friend_requests (
                sender_id INTEGER NOT NULL,
                receiver_id INTEGER NOT NULL,
                status TEXT CHECK(status IN ('pending', 'accepted')) NOT NULL,
                PRIMARY KEY (sender_id, receiver_id),
                FOREIGN KEY (sender_id) REFERENCES users(id),
                FOREIGN KEY (receiver_id) REFERENCES users(id))`
            );
        console.log("Database friend_request created (if not exists)")

    } catch (error) {
            console.log(error);
    }
}

init();
 
export default db;

app.register(userRoutes);

app.register(friendsRoutes);

setInterval(()=>{
    const sql = `UPDATE users SET is_active = 0 WHERE last_seen < datetime('now', '-16 minutes')`;
    try {
        console.log(sql);
        execute(db, sql);
    } catch (error) {
        console.log(error);
    }
}, 1 * 60 * 1000);

async function main() {
    await app.listen({ port: PORT, host: HOST });
}

main();

app.get('/healthcheck', (req, res) => {
    res.send({ message: 'Success' });
});