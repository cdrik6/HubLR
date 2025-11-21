import { db } from './server.mjs'
import { gradient, getRawData } from './algo.mjs'
import { fetchOne } from './sql.mjs';
// import { normSchema, barSchema, regSchema, insertSchema, scatterSchema } from './algoSchema.mjs'

/********** SCHEMA TO DO ********************************* */
/********** SCHEMA TO DO ********************************* */
/********** SCHEMA TO DO ********************************* */

export default async function algoRoutes(fastify, options)
{
	// // route to run gradient algo with fetch method instead of ws
	// fastify.post('/gradient', /*{ schema: insertSchema }, */async function(request, reply)
	// {			
	// 	try	{			
	// 		const k = await gradient(0.1);
	// 		reply.code(200).send({ message: "Gradient done: " + k });
	// 	}
	// 	catch (err)	{
	// 		console.error(err);
	// 		reply.code(500).send({ error: "Gradient failed" });
	// 	}		
	// });

	// route to create a reg+scatter chart form db/data of the km vs price
	fastify.get('/coef', /*{ schema: regSchema }, */async function (request, reply)
	{		
		try {					
			const coef = await getLastCoef();
			const m = coef.m;
			const p = coef.p;
			const raw = await getRawData();        		
    		const X = raw.map( item => item.x);    
    		// const Y = raw.map( item => item.y);									
			const minX = X.length ? Math.min(...X) : 0;
			const maxX = X.length ? Math.max(...X) : 0;
			const dataline = [{ x: minX, y: m * minX + p },{ x: maxX, y: m * maxX + p}];			
			console.log(dataline);
			reply.code(200).send(dataline);
		}
		catch (err)	{
			console.error(err);
			reply.code(500).send({ error: "Get line route failed" });
		}
	});

	fastify.get('/mss', /*{ schema: regSchema }, */async function (request, reply)
	{		
		try {					
			const coef = await getLastCoef();
			const m = coef.m;
			const p = coef.p;
			const raw = await getRawData();        		
    		const X = raw.map( item => item.x);    
    		// const Y = raw.map( item => item.y);									
			const minX = X.length ? Math.min(...X) : 0;
			const maxX = X.length ? Math.max(...X) : 0;
			const dataline = [{ x: minX, y: m * minX + p },{ x: maxX, y: m * maxX + p}];			
			console.log(dataline);
			reply.code(200).send(dataline);
		}
		catch (err)	{
			console.error(err);
			reply.code(500).send({ error: "Get line route failed" });
		}
	});
}


async function getLastCoef()
{
	const sql = `
		SELECT m, p
		FROM algo
		ORDER BY id DESC LIMIT 1;
	`;
	return (await fetchOne(db, sql));
}