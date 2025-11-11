import { db, gradient } from './server.mjs'
import { execute, fetchAll } from './sql.mjs';
// import { normSchema, barSchema, regSchema, insertSchema, scatterSchema } from './algoSchema.mjs'

export default async function algoRoutes(fast, options)
{
	// route to 
	fast.post('/gradient', /*{ schema: insertSchema }, */async function(request, reply)
	{			
		try	{			
			const k = await gradient(0.1);
			reply.code(200).send({ message: "Gradient done: " + k });
		}
		catch (err)	{
			console.error(err);
			reply.code(500).send({ error: "Gradient failed" });
		}		
	});
}
