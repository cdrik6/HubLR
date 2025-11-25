import { execute, fetchOne } from './sql.mjs';
import { db } from './server.mjs'
import { ACCURACY, INIT_M, INIT_P, LEARNING_RATE, MAX_ITER } from './config.mjs';

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
    
    // init
    await cleanAlgoDB();
    await insertCoef(rawM, rawP); // k++;
    //
    const data = await getNormData();    
    if (data.length === 0)
        return ({ k, rawM, rawP, stop });
    const raw = await getRawData();    
    if (raw.length === 0) 
        return ({ k, rawM, rawP, stop });
    const X = raw.map( item => item.x);    
    const Y = raw.map( item => item.y);    
    const minX = X.length ? Math.min(...X) : 0;
    const maxX = X.length ? Math.max(...X) : 0;
    const minY = Y.length ? Math.min(...Y) : 0;
    const maxY = Y.length ? Math.max(...Y) : 0;
    if (maxX === minX) 
        return ({ k, rawM, rawP, stop });
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
    if (k >= MAX_ITER)
        stop = true
    return ({ k, rawM, rawP, stop });
}

export async function insertCoef(m, p)
{
	const sql = `INSERT INTO algo (m, p) VALUES (?, ?)`;
	await execute(db, sql, [m, p]);
}

export async function getLastCoef()
{
	const sql = `
		SELECT m, p
		FROM algo
		ORDER BY id DESC LIMIT 1;
	`;
	return (await fetchOne(db, sql));
}

async function cleanAlgoDB(m, p)
{
	let sql = `DELETE FROM algo`;
	await execute(db, sql);
    sql = `VACUUM`;
	await execute(db, sql);
}

async function getNormData()
{	
	try {
		const res = await fetch("http://data:5000/norm", { method: 'GET' })
		if (!res.ok) { throw new Error(`HTTP error status: ${res.status}`); }
		const data = await res.json();
		// console.log(data);
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
		// console.log(data);
        return (data);
	}
	catch(err) { console.error(err); };		
}

// mean square error = variance residuelle = 1/n sum((ypred - yreel)^2)
// variance totale = variance expliquee + variance residuelle
export async function mse()
{
    const data = await getRawData();    
    if (data.length === 0)
        return (0);
    const { m, p } = await getLastCoef();    
    const MSE = (1 / data.length) * data.reduce((sum, { x, y }) => sum + (m * x + p - y) ** 2, 0);
    return (MSE);
}

// sqrt mean square error = ecart-type residuel
export async function sqrt_mse()
{    
    const MSE = await mse();    
    return (Math.sqrt(MSE));
}

// R^2 = coeff de correlation = var expliquee / var totale
// R^2 = sum((ypred - moyypred)^2) / sum((yreel - moyyreel)^2)
// R^2 = COV(X,Y)^2 / V(X).V(Y) = ( sum((x - moyx).(y - moyy)) )^2 / sum((x - moyx)^2) . sum((y - moyy)^2)
export async function rsquare()
{
    const data = await getRawData();    
    if (data.length === 0)
        return (0);
    const X = data.map(point => point.x);
	const Y = data.map(point => point.y);
    const mX = mean(X);
    const mY = mean(Y);
    const varX = variance(X, mX);
    const varY = variance(Y, mY);
    let R2 = 0;
    if (varX != 0 && varY != 0)
        R2 = (covariance(data, mX, mY)) ** 2 / (varX * varY);
    return (R2);
}

function mean(arr)
{		
    if (arr.length === 0)
        return (0);
    return (arr.reduce((sum, x) => sum + x, 0) / arr.length);
}

function covariance(arr, mX, mY)
{		
    if (arr.length === 0)
        return (0);
    return (arr.reduce((sum, { x, y }) => sum + (x - mX)*(y - mY), 0));
}

function variance(arr, mX)
{		
    if (arr.length === 0)
        return (0);
    return (arr.reduce((sum, x) => sum + (x - mX)*(x - mX), 0));
}