import Fastify from 'fastify';
import { WebSocketServer } from 'ws';
import algoRoutes from './algoAPI.mjs';
import { gradient }  from './algo.mjs';

const fastify = Fastify({ logger: true });
const PORT = 5000;
const HOST = '0.0.0.0';

await fastify.register(algoRoutes);
await fastify.ready();

const server = fastify.server;
const srv_wskt = new WebSocketServer({ server, path:'/lines' });

srv_wskt.on('connection', (clt_skt) => {
	clt_skt.on('open', () => {
		console.log('Server algo: Client connected');
	});		
	clt_skt.on('error', () => {
		console.log('Server algo: Error');
	});		
	clt_skt.on('message', async (clt_msg) => {           
		console.log('Server algo received:', clt_msg.toString());
		const data = JSON.parse(clt_msg);		
		try {								
			if ('start' in data)
			{
				const { k, rawM, rawP, stop } = await gradient(clt_skt);
				if (clt_skt && clt_skt.readyState === WebSocket.OPEN)
				{
					clt_skt.send(JSON.stringify({ k: k, rawM: rawM, rawP: rawP, stop: stop }));
					clt_skt.close(1000, "Descent over");
				}	
			}			
		}
		catch (e) {
			console.error('Invalid JSON from client: ' + e);
		}
	});
	clt_skt.on('close', (code, reason) => {
		console.log("Server algo: Client disconnected (" + code + "): " + reason + "\n");			
	});
});

try	{
	await fastify.listen({ port: PORT, host: HOST });
	console.log("Server algo listening on port: " + PORT);
}
catch (err) {
	console.error("Error starting server algo: ", err);
	process.exit(1); 
}	

// Database
import sqlite3 from 'sqlite3';
import { execute } from './sql.mjs';

const db = new sqlite3.Database('algo.db'); // default sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);
async function set_db()
{
	try {
        await execute(db, `CREATE TABLE IF NOT EXISTS algo
                    (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        m REAL NOT NULL,
                        p REAL NOT NULL,                        
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )`          
        );
        console.log("Table algo created (if not exists)")
    }
    catch (err) {
        console.log(err);
    }    
}
await set_db();
export { db };