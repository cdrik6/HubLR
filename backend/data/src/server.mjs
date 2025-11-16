import Fastify from 'fastify';
import sqlite3 from 'sqlite3';
import { execute } from './sql.mjs';
import dataRoutes from './dataAPI.mjs';

const fastify = Fastify({ logger: true });
const PORT = 5000;
const HOST = '0.0.0.0';

await fastify.register(dataRoutes);
await fastify.ready();

try	{
    await fastify.listen({ port: PORT, host: HOST });
    console.log("Server data listening on port: " + PORT);
}
catch (err) {
    console.error("Error starting server data: ", err);
    process.exit(1); 
}

// Database data
const db = new sqlite3.Database('data.db'); // default sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);
async function set_db()
{
	try {
        await execute(db, `CREATE TABLE IF NOT EXISTS data
                    (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        km INTEGER NOT NULL,
                        price INTEGER NOT NULL,                        
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )`          
        );
        console.log("Table data created (if not exists)")
    }
    catch (err) {
        console.log(err);
    }    
}
set_db();
export { db };