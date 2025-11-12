import fastify from 'fastify';
import sqlite3 from 'sqlite3';
import { WebSocketServer } from 'ws';
import http from 'http';
const fast = fastify({ logger: true });
const PORT = 80;
const HOST = '0.0.0.0';

import { execute } from './sql.mjs';

import algoRoutes from './algoAPI.mjs';
// For the API, ensures routes are registered before the server is ready
await fast.register(algoRoutes);

// Database
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

// Both Fastify and WebSocket share the same port and server instance
fast.ready().then(() => {     	
	
	const server = http.createServer((req, res) => {		
        fast.routing(req, res);
    });	
    
    // bind websocketserver to the http server
    const srv_wskt = new WebSocketServer({ server, path:'/algo' });
	
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
				// if ('nbPlayers' in data && 'options'in data && 'user'in data)
				// 	ModeInData(clt_skt, data);				
				// else if ('p1' in data && 'p2' in data)				
				// 	PaddleInData(clt_skt, data);				
				// else if ('start' in data)									
				// 	StartInData(clt_skt);
				// else if ('end' in data)									
				// 	await EndInData(clt_skt, false);					
            }
            catch (e) {
                console.error('Invalid JSON from client');
            }
        });                

		clt_skt.on('close', (code, reason) => {
			console.log("Server algo: Client disconnected (" + code + "): " + reason + "\n");			
		});

	});
});


async function listening()
{
 	try	{
    	await fast.listen({ port: PORT, host: HOST });
		console.log("Server algo listening on port: " + PORT);
 	}
	catch (err) {
    	console.error("Error starting server algo: ", err);
    	process.exit(1); 
  	}
}
await listening();
