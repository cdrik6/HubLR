import { db } from './server.mjs'
import { getRawData, getLastCoef, mse, sqrt_mse, rsquare } from './algo.mjs'
import { fetchOne } from './sql.mjs';
// import { normSchema, barSchema, regSchema, insertSchema, scatterSchema } from './algoSchema.mjs'

/********** SCHEMA TO DO ********************************* */
/********** SCHEMA TO DO ********************************* */
/********** SCHEMA TO DO ********************************* */

export default async function algoRoutes(fastify, options)
{
	// Get last coef 
	fastify.get('/coef', /*{ schema: regSchema }, */async function (request, reply)
	{		
		try {					
			const coef = await getLastCoef();
			console.log(coef);
			const m = coef.m;
			const p = coef.p;			
			reply.code(200).send({ m, p });
		}
		catch (err)	{
			console.error(err);
			reply.code(500).send({ error: "Get coef failed" });
		}
	});

	// Get quality indicators
	fastify.get('/quality', /*{ schema: regSchema }, */async function (request, reply)
	{		
		try {
			const MSE = await mse();
			const RMSE = await sqrt_mse();
			const R2 = await rsquare();			
			reply.code(200).send({ mse: MSE, rmse: RMSE, r2: R2});
		}
		catch (err)	{
			console.error(err);
			reply.code(500).send({ error: "Get quality failed" });
		}
	});

	// fastify.get('/mss', /*{ schema: regSchema }, */async function (request, reply)
	// {		
	// 	try {					
	// 		const coef = await getLastCoef();
	// 		const m = coef.m;
	// 		const p = coef.p;
	// 		const raw = await getRawData();        		
    // 		const X = raw.map( item => item.x);    
    // 		// const Y = raw.map( item => item.y);									
	// 		const minX = X.length ? Math.min(...X) : 0;
	// 		const maxX = X.length ? Math.max(...X) : 0;
	// 		const dataline = [{ x: minX, y: m * minX + p },{ x: maxX, y: m * maxX + p}];			
	// 		console.log(dataline);
	// 		reply.code(200).send(dataline);
	// 	}
	// 	catch (err)	{
	// 		console.error(err);
	// 		reply.code(500).send({ error: "Get line route failed" });
	// 	}
	// });
}





// // route to create a reg+scatter chart form db/data of the km vs price
// fastify.get('/coef', /*{ schema: regSchema }, */async function (request, reply)
// {		
// 	try {					
// 		const coef = await getLastCoef();
// 		const m = coef.m;
// 		const p = coef.p;
// 		const raw = await getRawData();        		
// 		const X = raw.map( item => item.x);    
// 		// const Y = raw.map( item => item.y);									
// 		const minX = X.length ? Math.min(...X) : 0;
// 		const maxX = X.length ? Math.max(...X) : 0;
// 		const dataline = [{ x: minX, y: m * minX + p },{ x: maxX, y: m * maxX + p}];			
// 		console.log(dataline);
// 		reply.code(200).send(dataline);
// 	}
// 	catch (err)	{
// 		console.error(err);
// 		reply.code(500).send({ error: "Get line route failed" });
// 	}
// });


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