import { db } from './server.mjs'
import { execute, fetchAll } from './sql.mjs';
import { normSchema, barSchema, regSchema, insertSchema, scatterSchema, deleteSchema, qualitySchema} from './dataSchema.mjs'

export default async function dataRoutes(fastify, options)
{
	// delete data
	fastify.delete('/clear', { schema: deleteSchema }, async function(request, reply)
	{
		try {						
			await clearData();
			reply.code(200).send({message:"Data cleared"});
		} catch (error) {
			console.log(error);
			reply.code(500).send({error: "Clear data failed"});
		}
	})
	
	// route to insert data from loading
	fastify.post('/insert', { schema: insertSchema }, async function(request, reply)
	{			
		try	{
			const { km, price } = request.body;
			const data = { km, price };
			await insertData(data);
			reply.code(201).send({ message: "Data inserted" });
		}
		catch (err)	{
			console.error(err);
			reply.code(500).send({ error: "Insertion failed" });
		}		
	});

	// route to create a bar km chart form db/game of the rank
	fastify.get('/barkm', { schema: barSchema }, async function (request, reply)
	{		
		try {								
			const kms = await getKm();
			const km = kms.map(x => x.km);
			console.log('Bar Chart, km:');
			console.log(km);
			const maxkm = km.length ? Math.max(...km) : 0;
			const step = 20000;
			const bins = Math.ceil(maxkm / step) + 1; //15;
			const counts = new Array(bins).fill(0);
			const labels = new Array(bins).fill("");
			for (const x of km)
			{
				if (typeof x !== 'number' || Number.isNaN(x))
					continue;
				const idx = Math.floor(x / step);
				if (idx >= 0 && idx < bins)	
					counts[idx]++;
				else if (idx >= bins)
					counts[bins - 1]++;
			}
			for (let k = 0; k < bins; k++)
			{
				labels[k] = step * k + " - " + step * (k + 1);
			}
			console.log(counts);
			console.log(labels);
			const data = labels.map((label, i) => ( { label: label, nb: counts[i] }));
			console.log(data);
			reply.code(200).send(data);
		}
		catch (err)	{
			console.error(err);
			reply.code(500).send({ error: "Get histo from data km to bar chart failed" });
		}
	});	

	// route to create a bar price chart form db/game of the rank
	fastify.get('/barprice', { schema: barSchema }, async function (request, reply)
	{		
		try {								
			const prices = await getPrice();
			const price = prices.map(x => x.price);
			console.log('Bar Chart, price:');
			console.log(price);
			const maxprice = price.length ? Math.max(...price) : 0;
			const step = 1000;
			const bins = Math.ceil(maxprice / step) + 1; //15;
			const counts = new Array(bins).fill(0);
			const labels = new Array(bins).fill("");
			for (const x of price)
			{
				if (typeof x !== 'number' || Number.isNaN(x))
					continue;
				const idx = Math.floor(x / step);
				if (idx >= 0 && idx < bins)	
					counts[idx]++;
				else if (idx >= bins)
					counts[bins - 1]++;
			}
			for (let k = 0; k < bins; k++)
			{
				labels[k] = step * k + " - " + step * (k + 1);
			}
			console.log(counts);
			console.log(labels);
			const data = labels.map((label, i) => ( { label: label, nb: counts[i] }));
			console.log(data);
			reply.code(200).send(data);
		}
		catch (err)	{
			console.error(err);
			reply.code(500).send({ error: "Get histo from data price to bar chart failed" });
		}
	});	

	// route to create a scatter chart form db/data of the km vs price
	fastify.get('/scatter', { schema: scatterSchema }, async function (request, reply)
	{		
		try {					
			const points = await getPoints();
			const data = points.map(point => ({ x: point.km, y: point.price }));
			reply.code(200).send(data);
			console.log("Points:");
			console.log(points);
			console.log("Datapoints:");
			console.log(data);			
		}
		catch (err)	{
			console.error(err);
			reply.code(500).send({ error: "Get data to scatter chart failed" });
		}
	});
	
	
	// route to create a normalized scatter chart form db/data of the km vs price
    fastify.get('/norm', { schema: normSchema }, async function (request, reply)
    {
        try {
            const points = await getPoints();
            // const data = points.map(point => ({ x: point.km, y: point.price }));
            const X = points.map(point => point.km);
            const Y = points.map(point => point.price);
			console.log(X);
			console.log(Y);
            const minX = X.length ? Math.min(...X) : 0;
            const maxX = X.length ? Math.max(...X) : 0;
            const minY = Y.length ? Math.min(...Y) : 0;
            const maxY = Y.length ? Math.max(...Y) : 0;
            const nX = X.map(x => (x - minX) / (maxX - minX));
            const nY = Y.map(y => (y - minY) / (maxY - minY));
			console.log(nX);
			console.log(nY);
            const data = nX.map((nx, i) => ( { x: nx, y: nY[i] }));
			console.log(data);			
            reply.code(200).send(data);
        }
        catch (err)    {
            console.error(err);
            reply.code(500).send({ error: "Get data to normalized scatter chart failed" });
        }
    });

	// route to create a reg+scatter chart form db/data of the km vs price
	fastify.get('/reg', { schema: regSchema }, async function (request, reply)
	{		
		try {					
			const points = await getPoints();
			const datapoints = points.map(point => ({ x: point.km, y: point.price }));						
			const X = datapoints.map(point => point.x);
			const Y = datapoints.map(point => point.y);			
			const mX = mean(X);
			const mY = mean(Y);
			console.log(X);
			console.log(Y);
			console.log(mX);
			console.log(mY);
			const covXY = covariance(datapoints, mX, mY);
			console.log(covXY);
			const varX = variance(X, mX);
			console.log(varX);
			let m;
			if (varX !== 0)
				m = covXY / varX;
			else
				m = 0;
			console.log("m = " + m);
			const p = mY - m * mX;
			console.log("p = " + p);
			const minX = X.length ? Math.min(...X) : 0;
			const maxX = X.length ? Math.max(...X) : 0;
			const dataline = [{ x: minX, y: m * minX + p },{ x: maxX, y: m * maxX + p}];
			console.log(datapoints);
			console.log(dataline);
			reply.code(200).send({ datapoints, dataline });
		}
		catch (err)	{
			console.error(err);
			reply.code(500).send({ error: "Get data to reg chart failed" });
		}
	});
	
	// Get quality indicators
	fastify.get('/quality', { schema: qualitySchema }, async function (request, reply)
	{		
		try {
			const points = await getPoints();
			const datapoints = points.map(point => ({ x: point.km, y: point.price }));						
			const X = datapoints.map(point => point.x);
			const Y = datapoints.map(point => point.y);			
			const mX = mean(X);
			const mY = mean(Y);			
			const covXY = covariance(datapoints, mX, mY);			
			const varX = variance(X, mX);
			const varY = variance(Y, mY);
			let m = 0;
			let p = 0;
			if (varX !== 0)
				m = covXY / varX;			
			p = mY - m * mX;
			let MSE = 0;
			let RMSE = 0;
			let R2 = 0;
			if (datapoints.length != 0)
			{
				MSE = (1 / datapoints.length) * datapoints.reduce((sum, { x, y }) => sum + (m * x + p - y) ** 2, 0);
				RMSE = Math.sqrt(MSE);
				if (varX != 0 && varY != 0)
					R2 = (covXY ** 2) / (varX * varY);
			}						
			reply.code(200).send({ m: m, p: p, mse: MSE, rmse: RMSE, r2: R2});
		}
		catch (err)	{
			console.error(err);
			reply.code(500).send({ error: "Get data quality failed" });
		}
	});	
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

async function clearData()
{
	let sql = `DELETE FROM data`;
	await execute(db, sql);
    sql = `VACUUM`;
	await execute(db, sql);
}

async function insertData(data)
{
	const sql = `INSERT INTO data (km, price) VALUES (?, ?)`;
	await execute(db, sql, [data.km, data.price]);
}

async function getAllData()
{
	const sql = `SELECT * FROM data;`;
	return (await fetchAll(db, sql));
}

async function getNbrRows()
{
	const sql = `SELECT COUNT(*) AS total FROM data;`;
	return (await fetchAll(db, sql));
}

async function getPoints()
{
	const sql = `
		SELECT km, price
		FROM data
		ORDER BY km;
	`;
	return (await fetchAll(db, sql));
}

async function getKm()
{
	const sql = `
		SELECT km
		FROM data
		ORDER BY km;
	`;
	return (await fetchAll(db, sql));
}

async function getPrice()
{
	const sql = `
		SELECT price
		FROM data
		ORDER BY price;
	`;
	return (await fetchAll(db, sql));
}
