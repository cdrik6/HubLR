import fastify from 'fastify';
import sqlite3 from 'sqlite3';
import { execute, getRandIntInc } from './sql.mjs';

const fast = fastify({ logger: true });
const PORT = 443;
const HOST = '0.0.0.0';

import statsRoutes from './statsAPI.mjs';
// For the API, ensures routes are registered before the server is ready
await fast.register(statsRoutes);

const db = new sqlite3.Database('stats.db'); // default sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);

async function set_db()
{
	try {
        await execute(db, `CREATE TABLE IF NOT EXISTS game
                    (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        gameid INTEGER NOT NULL,
                        userid1 INTEGER NOT NULL,
                        userid2 INTEGER NOT NULL,
                        player1 TEXT NOT NULL,
                        player2 TEXT NOT NULL,
                        winner TEXT NOT NULL,
                        winnerid INTEGER NOT NULL,
                        score1 INTEGER NOT NULL,
                        score2 INTEGER NOT NULL,
                        maxtouch INTEGER NOT NULL,
                        speedy BOOLEAN NOT NULL,
                        paddy BOOLEAN NOT NULL,
                        wally BOOLEAN NOT NULL,
                        mirry BOOLEAN NOT NULL,
                        multy BOOLEAN NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )`          
        );
        console.log("Table game created (if not exists)")
    }
    catch (err) {
        console.log(err);
    }    
}

set_db();

// real gameId MUST start from 100
async function fill_db(data)
{	
    const startId = 100; 
    // const option = false;    
    // 0 - 11
    let players = ["Federer", "Nadal", "Djokovic", "Borg", "Becker", "Connors", "Henin", "Evert", "Seles", "Navratilova", "Williams", "Graf"]
    let k1, k2, score1, score2, maxtouch;
    let player1, player2, winner;
    let speedy, paddy, wally, mirry, multy;
    let userid1, userid2, winnerid;
    
    for (let i = 0; i < startId; i++)
    { 
        k1 = getRandIntInc(0, 11);
        player1 = players[k1];
        userid1 = -k1 -1;
        k2 = getRandIntInc(0, 11);
        while (k2 === k1) 
            k2 = getRandIntInc(0, 11);
        player2 = players[k2];        
        userid2 = -k2 -1;
        winner = (getRandIntInc(0, 1)===0)?player1:player2;
        winnerid = (winner===player1)?userid1:userid2;
        score1 = (winner===player1)?11:getRandIntInc(0, 9);
        score2 = (winner===player2)?11:getRandIntInc(0, 9); 
        let d = Math.abs(score1 - score2);
        if (d <= 3) maxtouch = getRandIntInc(9, 14);
        if (d > 3 && d <= 6) maxtouch = getRandIntInc(6, 11);
        if (d > 6 && d <= 9) maxtouch = getRandIntInc(3, 8);
        if (d > 9) maxtouch = getRandIntInc(1, 5);
        speedy = getRandIntInc(0, 1);
        paddy = getRandIntInc(0, 1);
        wally = getRandIntInc(0, 1);
        mirry = getRandIntInc(0, 1);
        multy = 0;
        const sql = `INSERT INTO game (gameid, userid1, userid2, player1, player2, winner, winnerid, score1, score2, maxtouch, speedy, paddy, wally, mirry, multy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        await execute(db, sql, [i, userid1, userid2, player1, player2, winner, winnerid, score1, score2, maxtouch, speedy, paddy, wally, mirry, multy]);
    }
    console.log("Table filled with script");
}

// fill_db();

export { db };

async function listening()
{
 	try	{
    	await fast.listen({ port: PORT, host: HOST });
		console.log("Server listening on port: " + PORT);
 	}
	catch (err) {
    	console.error("Error starting server: ", err);
    	process.exit(1); 
  	}
}
listening();
