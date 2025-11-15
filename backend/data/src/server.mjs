import fastify from 'fastify';
import sqlite3 from 'sqlite3';
import { execute, getRandIntInc } from './sql.mjs';

const fast = fastify({ logger: true });
const PORT = 8081;
const HOST = '0.0.0.0';

import dataRoutes from './dataAPI.mjs';
// For the API, ensures routes are registered before the server is ready
await fast.register(dataRoutes);

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

async function listening()
{
 	try	{
    	await fast.listen({ port: PORT, host: HOST });
		console.log("Server data listening on port: " + PORT);
 	}
	catch (err) {
    	console.error("Error starting server data: ", err);
    	process.exit(1); 
  	}
}
listening();
