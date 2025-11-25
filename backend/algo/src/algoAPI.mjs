import { getLastCoef, mse, sqrt_mse, rsquare } from './algo.mjs'
import { qualitySchema, coefSchema } from './algoSchema.mjs'

export default async function algoRoutes(fastify, options)
{
	// Get last coef 
	fastify.get('/coef', { schema: coefSchema }, async function (request, reply)
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
	fastify.get('/quality', { schema: qualitySchema }, async function (request, reply)
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
}