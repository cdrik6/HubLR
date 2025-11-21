import { execute } from './sql.mjs';
import { db } from './server.mjs'
import { ACCURACY, INIT_M, INIT_P, LEARNING_RATE, MAX_ITER } from './config.js';

export async function gradient(clt_skt)
{
    let m = INIT_M;
    let p = INIT_P;
    let a = LEARNING_RATE;
    let rawM = INIT_M;
    let rawP = INIT_P;
    let errM = 1;
    let errP = 1;
    let k = 0;
    let stop = false;
    
    const data = await getNormData();    
    if (data.length === 0) return ({ k, rawM, rawM, stop });
    const raw = await getRawData();    
    if (raw.length === 0) return ({ k, rawM, rawM, stop });
    const X = raw.map( item => item.x);    
    const Y = raw.map( item => item.y);    
    const minX = X.length ? Math.min(...X) : 0;
    const maxX = X.length ? Math.max(...X) : 0;
    const minY = Y.length ? Math.min(...Y) : 0;
    const maxY = Y.length ? Math.max(...Y) : 0;
    if (maxX === minX) return ({ k, rawM, rawM, stop });
    console.log(data.length);

    // algo
    while ((Math.abs(errM) > ACCURACY || Math.abs(errP) > ACCURACY) && k < MAX_ITER)
    {
        errP = (2 * a / data.length) * data.reduce((sum, { x, y }) => sum + m * x + p - y, 0);
        errM = (2 * a / data.length) * data.reduce((sum, { x, y }) => sum + x * (m * x + p - y), 0);
        // console.log("errP = " + errP);
        // console.log("errM = " + errM);
        p = p - errP;
        m = m - errM;
        rawP = (p - m * minX / (maxX - minX)) * (maxY - minY) + minY;
        rawM = m * (maxY - minY) / (maxX - minX);
        // console.log("P = " + rawP);
        // console.log("M = " + rawM);                
        if (clt_skt && clt_skt.readyState === WebSocket.OPEN)
            clt_skt.send(JSON.stringify({ m: m, p: p, rawM: rawM, rawP: rawP, maxX: maxX, minX: minX }));        
        await insertCoef(rawM, rawP);
        k++;
    }
    // console.log("k = " + k);     
    if (k >= MAX_ITER) stop = true
    return ({ k, rawM, rawP, stop });    
}

async function insertCoef(m, p)
{
	const sql = `INSERT INTO algo (m, p) VALUES (?, ?)`;
	await execute(db, sql, [m, p]);
}

async function getNormData()
{	
	try {
		const res = await fetch("http://data:5000/norm", { method: 'GET' })
		if (!res.ok) { throw new Error(`HTTP error status: ${res.status}`); }
		const data = await res.json();
		console.log(data);
        return (data);
	}
	catch(err) { console.error(err); };		
}

export async function getRawData()
{	
	try {
		const res = await fetch("http://data:5000/scatter", { method: 'GET' })
		if (!res.ok) { throw new Error(`HTTP error status: ${res.status}`); }
		const data = await res.json();
		console.log(data);
        return (data);
	}
	catch(err) { console.error(err); };		
}