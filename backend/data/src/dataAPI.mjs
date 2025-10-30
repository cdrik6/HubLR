import { db } from './server.mjs'
import { execute, fetchAll } from './sql.mjs';
import { insertSchema, amendSchema, pieSchema, barSchema, scatterSchema, userdataSchema, userpieSchema, userlineSchema, userwinSchema, usertableSchema, deleteSchema } from './dataSchema.mjs'

// async function isAuthorized(req) {
// 	const resAuth = await fetch(`http://auth:443/me`, {method: "GET", headers: req.headers});
// 	if (resAuth.status === 401)
// 		return false;
// 	if (!resAuth.ok)
// 		throw new Error("Communication with auth microservice failed");
// 	const bodyAuth = await resAuth.json();
// 	return (true);
// }

export default async function dataRoutes(fast, options)
{		
	// delete user stats data
	fast.delete('/remove', { schema: deleteSchema }, async function(request, reply) {
		console.log("in delete id")
		try {
			// const id = Number(request.params.id);
			const resAuth = await fetch('http://auth:443/me', {method: 'GET', headers: request.headers});
			const data = await resAuth.json();
			if (!resAuth.ok)
				return (reply.code(400).send({error: 'Not authorized'}));
			console.log("auth done")
			let sql = `UPDATE game SET player1 = ? WHERE userid1 = ?`;
			const exec1 = await execute(db, sql, ["none", data.id]);
			console.log("execute userid1", exec1);
			sql = `UPDATE game SET player2 = ? WHERE userid2 = ?`;
			const exec2 = await execute(db, sql, ["none", data.id]);
			sql = `UPDATE game SET winner = ? WHERE winnerid = ?`;  // ******* amended here *******///
			await execute(db, sql, ["none", data.id]); // ******* amended here *******///
			console.log("execute userid2", exec2);
			return(reply.code(200).send({message:"Id deleted in stats"}));
		} catch (error) {
			console.log(error);
			reply.code(500).send({error: "deleting userID stats failed"});
		}
	})

	// route to insert data from loading
	fast.post('/insert', { schema: insertSchema }, async function(request, reply)
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

	fast.patch('/:userid/amend', { schema: amendSchema }, async function(request, reply)
	{		
		try	{
			const userid = Number(request.params.userid);
			const { newAlias } = request.body;
			console.log("From settings to stats.db: " + userid + " - " + newAlias);
			await amendAlias(userid, newAlias);
			reply.code(200).send({ message: "Alias amended in stats.db" });
		}
		catch (err)	{
			console.error(err);
			reply.code(500).send({ error: "Amending failed" });
		}		
	});



	// route to create the pie chart form db/game of the selected customization 
	fast.get('/pie', { schema: pieSchema }, async function (request, reply)
	{		
		try {		
			const speedy = await getCustom("speedy");
			const paddy = await getCustom("paddy");
			const wally = await getCustom("wally");
			const mirry = await getCustom("mirry");
			const multy = await getCustom("multy");
			const std = await getStandard();
			const data = {
				labels: ['Standard', 'Speedy', 'Paddy', 'Wally', 'Mirry', 'Multy'],
				values: [std?.[0]?.total ?? 0, speedy?.[0]?.total ?? 0, paddy?.[0]?.total ?? 0, wally?.[0]?.total ?? 0,	mirry?.[0]?.total ?? 0,	multy?.[0]?.total ?? 0]
			};
			reply.code(200).send(data);
		}
		catch (err)	{
			console.error(err);
			reply.code(500).send({ error: "Get data from game to pie chart failed" });
		}
	});



	// route to create a bar chart form db/game of the rank
	fast.get('/bar', { schema: barSchema }, async function (request, reply)
	{		
		try {					
			// const player1 = await getPlayer1Diff();			
			// console.log(player1);
			// const player2 = await getPlayer2Diff();			
			// console.log(player2);
			// const player = await getPlayerDiff();			
			// console.log(player);
			// const winner = await getWinner();			
			// console.log(winner);
			const windiff = await getWinDiff();
			console.log('Bar Chart, windiff:');
			console.log(windiff); // player, userid, nbWin, point, nbMatch
			const data = {
				// player: windiff.map(item => item.player),
				player: windiff.map(item => `${item.player} (${item.userid})`),
				nbWin: windiff.map(item => item.nbWin),
				point: windiff.map(item => item.point),
				nbMatch: windiff.map(item => item.nbMatch)
			};			
			reply.code(200).send(data);
		}
		catch (err)	{
			console.error(err);
			reply.code(500).send({ error: "Get data from game to bar chart failed" });
		}
	});	
	


	// route to create a scatter chart form db/game of the tightscore vs max
	fast.get('/scatter', { schema: scatterSchema }, async function (request, reply)
	{		
		try {					
			const points = await getPoints();			
			// console.log('Diffvsmax');
			// console.log(diffvsmax);
			const data = points.map(point => ({ x: point.km, y: point.price }));
			reply.code(200).send(data);
		}
		catch (err)	{
			console.error(err);
			reply.code(500).send({ error: "Get data to scatter chart failed" });
		}
	});
	


	// route to get the main data of a user
	fast.get('/:id/userdata', { schema: userdataSchema }, async function (request, reply)
	{		
		// check
		try {
			if (!(await isAuthorized(request)))
			return reply.code(401).send({ error: "Error: user is not authorized to access required information" });
		}
		catch (e) {
			console.error(`Error: ${e}`);
			return reply.code(500).send({ error: "Error: server encountered issue while completing request" });
		}		
		// then		
		try {					
			const userid = request.params.id;
			const userdata = await getUserData(userid);
			const rank = await getRank(userid);
			userdata[0].rank = rank;
			console.log('Userdata:');
			console.log(userdata);
			reply.code(200).send(userdata);
		}
		catch (err)	{
			console.error(err);
			reply.code(500).send({ error: "Get user data from game failed"});
		}
	});



	// route to create the user pie chart from db/game of the selected customization 
	fast.get('/:id/userpie', { schema: userpieSchema }, async function (request, reply)
	{	
		// check
		try {
			if (!(await isAuthorized(request)))
			return reply.code(401).send({ error: "Error: user is not authorized to access required information" });
		}
		catch (e) {
			console.error(`Error: ${e}`);
			return reply.code(500).send({ error: "Error: server encountered issue while completing request" });
		}		
		// then
		try {					
			const userid = request.params.id;
			const userdata = await getUserData(userid)
			const std = await getUserStandard(userid);
			const data = {
				labels: ['Standard', 'Speedy', 'Paddy', 'Wally', 'Mirry', 'Multy'],
				values: [std?.[0]?.total ?? 0, userdata?.[0]?.speedy ?? 0, userdata?.[0]?.paddy ?? 0, userdata?.[0]?.wally ?? 0, userdata?.[0]?.mirry ?? 0, userdata?.[0]?.multy ?? 0]
			};
			console.log('Userpie:');
			console.log(data);
			reply.code(200).send(data);
		}
		catch (err)	{
			console.error(err);
			reply.code(500).send({ error: "Get data from game to pie chart failed" });
		}
	});



	// route to create the user line touch chart from db/game
	fast.get('/:id/userline', { schema: userlineSchema }, async function (request, reply)
	{		
		// check
		try {
			if (!(await isAuthorized(request)))
			return reply.code(401).send({ error: "Error: user is not authorized to access required information" });
		}
		catch (e) {
			console.error(`Error: ${e}`);
			return reply.code(500).send({ error: "Error: server encountered issue while completing request" });
		}		
		// then
		try {					
			const userid = request.params.id;
			const usertouch = await getUserTouch(userid);
			console.log(usertouch);
			const data = {
				row: usertouch.map(p => p.row),				
				maxtouch: usertouch.map(p => p.maxtouch)
			};
			console.log('Userline:');
			console.log(data);
			reply.code(200).send(data);
		}
		catch (err)	{
			console.error(err);
			reply.code(500).send({ error: "Get user touch data from game failed"});
		}
	});



	// route to create the user line win chart from db/game
	fast.get('/:id/userwin', { schema: userwinSchema }, async function (request, reply)
	{		
		// check
		try {
			if (!(await isAuthorized(request)))
			return reply.code(401).send({ error: "Error: user is not authorized to access required information" });
		}
		catch (e) {
			console.error(`Error: ${e}`);
			return reply.code(500).send({ error: "Error: server encountered issue while completing request" });
		}		
		// then
		try {					
			const userid = request.params.id;
			const userwin = await getUserWin(userid);
			console.log(userwin);
			const data = {
				row: userwin.map(p => p.row),				
				win: userwin.map(p => p.winIdx)							
			};
			console.log('Userwin');
			console.log(data);
			for (let i = 1; i < data.win.length; i++)			
				data.win[i] = data.win[i-1] + data.win[i];			
			console.log(data);
			reply.code(200).send(data);
		}
		catch (err)	{
			console.error(err);
			reply.code(500).send({ error: "Get user win data from game failed"});
		}
	});

	// // route to create table of all data from db/game
	// fast.get('/datatable', async function (request, reply)
	// {			
	// 	try {					
	// 		const usertable = await getAllData();			
	// 		reply.code(200).send(usertable);
	// 	}
	// 	catch (err)	{
	// 		console.error(err);
	// 		reply.code(500).send({ error: "Get all data from game failed"});
	// 	}
	// });	



	// route to create table of the data user from db/game
	fast.get('/:id/usertable', { schema: usertableSchema }, async function (request, reply)
	{		
		// check
		try {
			if (!(await isAuthorized(request)))
			return reply.code(401).send({ error: "Error: user is not authorized to access required information" });
		}
		catch (e) {
			console.error(`Error: ${e}`);
			return reply.code(500).send({ error: "Error: server encountered issue while completing request" });
		}		
		// then
		try {					
			const userid = request.params.id;
			const usertable = await getUserTable(userid);
			console.log('Usertable:');
			console.log(usertable);
			reply.code(200).send(usertable);
		}
		catch (err)	{
			console.error(err);
			reply.code(500).send({ error: "Get user data from game failed"});
		}
	});
}



async function insertData(data)
{
	const sql = `INSERT INTO data (km, price) VALUES (?, ?)`;
	await execute(db, sql, [data.km, data.price]);
}

async function getAllData()
{
	const sql = `SELECT * FROM game;`;
	return (await fetchAll(db, sql));
}

async function getCustom(option)
{
	const sql = `SELECT ${option}, COUNT(*) AS total FROM game WHERE ${option} = 1;`;
	return (await fetchAll(db, sql));
}

async function getStandard()
{
	const sql = `SELECT COUNT(*) AS total FROM game WHERE speedy = 0 AND paddy = 0 AND wally = 0 AND mirry = 0;`;
	return (await fetchAll(db, sql));
}

async function getUserStandard(userid)
{
	// const sql = `SELECT COUNT(*) AS total FROM game WHERE (player1 = ? OR player2 = ? ) AND speedy = 0 AND paddy = 0 AND wally = 0 AND mirry = 0;`;
	// return (await fetchAll(db, sql, [user, user]));
	const sql = `SELECT COUNT(*) AS total FROM game WHERE (userid1 = ? OR userid2 = ?) AND speedy = 0 AND paddy = 0 AND wally = 0 AND mirry = 0;`;
	return (await fetchAll(db, sql, [userid, userid]));
}

async function getNbrRows()
{
	const sql = `SELECT COUNT(*) AS total FROM game;`;
	return (await fetchAll(db, sql));
}

async function getPlayer1Diff()
{
	const sql = `
		SELECT player1, SUM(score1 - score2) AS diff		
		FROM game	
		GROUP BY player1;
	`;
	return (await fetchAll(db, sql));
}

async function getPlayer2Diff()
{
	const sql = `
		SELECT player2,	SUM(score2 - score1) AS diff		
		FROM game	
		GROUP BY player2;
	`;
	return (await fetchAll(db, sql));
}

async function getPlayerDiff()
{
	const sql = `
		SELECT player, SUM(diff) As total
		FROM (
			SELECT player1 AS player, SUM(score1 - score2) AS diff		
			FROM game	
			GROUP BY player1

			UNION ALL

			SELECT player2 AS player, SUM(score2 - score1) AS diff		
			FROM game	
			GROUP BY player2
		)
		GROUP BY player
		ORDER BY total DESC;
	`;
	return (await fetchAll(db, sql));
}

async function getWinner()
{
	const sql = `SELECT winner AS player, COUNT(*) AS nbWin FROM game GROUP BY winner;`;
	return (await fetchAll(db, sql));
}

async function getWinDiff()
{
	const sql = `
		SELECT d.player, d.userid,
		COALESCE(w.nbWin, 0) AS nbWin,
		COALESCE(d.total, 0) AS point,
		COALESCE(d.totMatch, 0) AS nbMatch		

		FROM (
			SELECT userid, player, SUM(diff) As total, SUM(match) As totMatch
			FROM (
				SELECT userid1 AS userid, player1 AS player, SUM(score1 - score2) AS diff, COUNT(*) AS match FROM game GROUP BY userid1
				UNION ALL
				SELECT userid2 AS userid, player2 AS player, SUM(score2 - score1) AS diff, COUNT(*) AS match FROM game GROUP BY userid2
			)
			GROUP BY userid
			ORDER BY total DESC
		) AS d

		LEFT JOIN (
			SELECT winnerid AS userid, winner AS player, COUNT(*) AS nbWin
			FROM game
			GROUP BY winnerid
			ORDER BY nbWin DESC
		) AS w

		ON d.userid = w.userid
		GROUP BY d.userid
		ORDER BY nbWin DESC, point DESC, nbMatch DESC;
	`;
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

async function getDiffMaxTouch()
{
	const sql = `
		SELECT ABS(score1 - score2) AS spread, maxtouch
		FROM game	
		ORDER BY spread;
	`;
	return (await fetchAll(db, sql));
}

async function getUserData0(user)
{
	const sql = `
		SELECT player, SUM(diff) AS diff, MAX(maxtouch) AS maxtouch,
				SUM(speedy) AS speedy, SUM(paddy) AS paddy, SUM(wally) AS wally, SUM(mirry) AS mirry,
				SUM(nbMatch) AS nbMatch, SUM(nbWin) AS nbWin
		FROM (
			SELECT player1 AS player, SUM(score1 - score2) AS diff, MAX(maxtouch) AS maxtouch,
					SUM(speedy) AS speedy, SUM(paddy) AS paddy, SUM(wally) AS wally, SUM(mirry) AS mirry,
					COUNT(*) AS nbMatch, SUM(CASE WHEN winner = ? THEN 1 ELSE 0 END) AS nbWin
			FROM game WHERE player1 = ? GROUP BY player1

			UNION ALL

			SELECT player2 AS player, SUM(score2 - score1) AS diff, MAX(maxtouch) AS maxtouch,
					SUM(speedy) AS speedy, SUM(paddy) AS paddy, SUM(wally) AS wally, SUM(mirry) AS mirry,
					COUNT(*) AS nbMatch, SUM(CASE WHEN winner = ? THEN 1 ELSE 0 END) AS nbWin
			FROM game WHERE player2 = ? GROUP BY player2
		)
	`;
	return (await fetchAll(db, sql, [user, user, user, user]));
}

async function getUserData(userid)
{
	const sql = `		
		SELECT ? AS userid,
			SUM(CASE WHEN userid1 = ? THEN score1 - score2 ELSE score2 - score1 END) AS diff,
			MAX(maxtouch) AS maxtouch,					
			SUM(speedy) AS speedy, SUM(paddy) AS paddy, SUM(wally) AS wally, SUM(mirry) AS mirry, SUM(multy) AS multy,
			COUNT(*) AS nbMatch,
			SUM(CASE WHEN winnerid = ? THEN 1 ELSE 0 END) AS nbWin
		FROM game WHERE userid1 = ? OR userid2 = ?		
	`;
	return (await fetchAll(db, sql, [userid, userid, userid, userid, userid]));
}

async function getUserTouch(userid)
{
	const sql = `
		SELECT ROW_NUMBER() OVER (ORDER BY id) as row, maxtouch
		FROM game WHERE userid1 = ? OR userid2 = ?
	`;
	return (await fetchAll(db, sql, [userid, userid]));
}

async function getUserWin(userid)
{
	const sql = `
		SELECT ROW_NUMBER() OVER (ORDER BY id) as row,
		 	CASE WHEN winnerid = ? THEN 1 ELSE -1 END AS winIdx
		FROM game WHERE userid1 = ? OR userid2 = ?
	`;
	return (await fetchAll(db, sql, [userid, userid, userid]));
}

// SELECT id, player1, player2, winner, score1, score2
async function  getUserTable(userid)
{
	const sql = `
		SELECT *
		FROM game WHERE userid1 = ? OR userid2 = ?
	`;
	return (await fetchAll(db, sql, [userid, userid]));
}

async function getRank(userid)
{
	const data = await getWinDiff();
	let rank = 1;
	for (const p of data)
	{
		if (p.userid === userid)
			return (rank)
		else
			rank++;
	}
}

async function amendAlias(userid, newAlias)
{
	const sql = `
		UPDATE game
		SET winner = CASE 
						WHEN userid1 = ? AND winner = player1 THEN ?
						WHEN userid2 = ? AND winner = player2 THEN ?
			 			ELSE winner
					END,
			player1 = CASE WHEN userid1 = ? THEN ? ELSE player1 END,
			player2 = CASE WHEN userid2 = ? THEN ? ELSE player2 END			
	`;
	return (await fetchAll(db, sql, [userid, newAlias, userid, newAlias, userid, newAlias, userid, newAlias]));
}
