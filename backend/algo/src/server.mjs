import fastify from 'fastify';
import sqlite3 from 'sqlite3';
import { execute, getRandIntInc } from './sql.mjs';

const fast = fastify({ logger: true });
const PORT = 80;
const HOST = '0.0.0.0';

import algoRoutes from './algoAPI.mjs';
// For the API, ensures routes are registered before the server is ready
await fast.register(algoRoutes);

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
await listening();


async function gradient(a)
{
    let m = 0;
    let p = 0;
    let errM = 1;
    let errP = 1;
    let k = 0;
    console.log("ici 1");
    const data = await getData();
    console.log("ici 2");

    if (data.length === 0)
			return (0);
    // await insertCoef(m, p);
    while (errM*errM > 0.00001 || errP*errP > 0.00001 ) //|| k < 10000)
    {
        errP = (2 * a / data.length) * data.reduce((sum, { x, y }) => sum + m * x + p - y, 0);
        errM = (2 * a / data.length) * data.reduce((sum, { x, y }) => sum + x * (m * x + p - y), 0);
        p = p - errP;
        m = m - errM;
        console.log("p = " + p);
        console.log("m = " + m);
        await insertCoef(m, p);
        k++;
    }
}

async function insertCoef(m, p)
{
	const sql = `INSERT INTO algo (m, p) VALUES (?, ?)`;
	await execute(db, sql, [m, p]);
}

async function getData()
{	
	try {
		const res = await fetch("http://data/norm", { method: 'GET' })
		if (!res.ok) { throw new Error(`HTTP error status: ${res.status}`); }
		const data = await res.json();
		console.log(data);
        return (data);
	}
	catch(err) { console.error(err); };		
}

gradient(0.001);


// function covariance(arr, mX, mY)
// 	{		
// 		if (arr.length === 0)
// 			return (0);
//   		return (arr.reduce((sum, { x, y }) => sum + (x - mX)*(y - mY), 0));
// 	}