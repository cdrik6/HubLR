import { execute } from './sql.mjs';

export async function gradient(a)
{
    let m = 0;
    let p = 0;
    let rawM = 0;
    let rawP = 0;
    let errM = 1;
    let errP = 1;
    let k = 0;
    
    const data = await getNormData();    
    if (data.length === 0)
			return (0);

    const raw = await getRawData();    
    if (raw.length === 0)
			return (0);    
    const X = raw.map( item => item.x);    
    const Y = raw.map( item => item.y);    
    const minX = X.length ? Math.min(...X) : 0;
    const maxX = X.length ? Math.max(...X) : 0;
    const minY = Y.length ? Math.min(...Y) : 0;
    const maxY = Y.length ? Math.max(...Y) : 0;
    if (maxX === minX) // || maxY === minY)
        return (0);

    console.log(data.length);
    while (Math.abs(errM) > 0.000001 || Math.abs(errP) > 0.000001) // || k > 1000)
    {
        errP = (2 * a / data.length) * data.reduce((sum, { x, y }) => sum + m * x + p - y, 0);
        console.log("errP = " + errP);
        errM = (2 * a / data.length) * data.reduce((sum, { x, y }) => sum + x * (m * x + p - y), 0);
        console.log("errM = " + errM);
        p = p - errP;
        m = m - errM;
        rawP = (p - m * minX / (maxX - minX)) * (maxY - minY) + minY;
        rawM = m * (maxY - minY) / (maxX - minX);
        console.log("P = " + rawP);
        console.log("M = " + rawM);
        await insertCoef(rawM, rawP);
        k++;
    }
    console.log("k = " + k); 
    console.log(minX);
    console.log(maxX);
    return (k);
}

async function insertCoef(m, p)
{
	const sql = `INSERT INTO algo (m, p) VALUES (?, ?)`;
	await execute(db, sql, [m, p]);
}

async function getNormData()
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

export async function getRawData()
{	
	try {
		const res = await fetch("http://data/scatter", { method: 'GET' })
		if (!res.ok) { throw new Error(`HTTP error status: ${res.status}`); }
		const data = await res.json();
		console.log(data);
        return (data);
	}
	catch(err) { console.error(err); };		
}