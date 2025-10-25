import db from "../../app.js";
import { execute, fetchAll, fetchFirst } from "../../utils/sql.js";


export async function createRequest(req, reply) {
    console.log("body:", req.body);
    const { sender_id, receiver_id } = req.body;
    try {
        const sqlCheck = `SELECT status FROM friend_requests WHERE sender_id = ? AND receiver_id = ?`;
        const statusRow = await fetchFirst(db, sqlCheck, [sender_id, receiver_id]);
        console.log("status checking DB friends: ", statusRow);
        if (statusRow)
        {
            return reply.code(401).send({ error: "This user already send a request" });
        }
    } catch (error) {
        console.log(error);
        return reply.code(500).send({ error: 'Request Check failed' });
    }
    try
    {
        const sqlGet = `SELECT status FROM friend_requests WHERE sender_id = ? AND receiver_id = ?`;
        const statusRow = await fetchFirst(db, sqlGet, [receiver_id, sender_id]);
        console.log("status in DB friends: ", statusRow);
        if (!statusRow)
        {
            console.log("sender_id:", sender_id);
            console.log("receiver_id:", receiver_id);

            console.log("inserting request")

            const sql = `INSERT INTO friend_requests (sender_id, receiver_id, status) VALUES (?, ?, ?)`;
    
            await execute(db, sql, [sender_id, receiver_id, "pending"]);
            return reply.code(201).send({ message: 'Request created'});
        }
        else if (statusRow.status === "pending")
        {
            console.log("message in pending");
            const sql = `UPDATE friend_requests SET status = ? WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)`;
    
            await execute(db, sql, ["accepted", sender_id, receiver_id, receiver_id, sender_id]);
            return reply.code(201).send({ message: 'Request updated'});
        }
        return reply.code(400).send({ error: 'Request already accepted'});
    }
    catch (err) {
        console.log(err);
        return reply.code(500).send({ error: err });
    }
}

export async function getRequests(req, reply) {
    const {id} = req.query;
    console.log("id in getRequests:", id);

    const sql = `
		SELECT user.username, user.avatarURL, user.id
		FROM users user
		JOIN friend_requests req
		  ON (user.id = req.sender_id AND req.receiver_id = ?)
		WHERE req.status = 'pending'
		  AND user.id != ?
	`;

    try {
        const friendRequest = await fetchAll(db, sql, [id, id]);
        console.log("friendRequest :", friendRequest);
        if (!friendRequest || friendRequest.length === 0)
        {
            console.log('friendRequest not found');
            // return reply.code(400).send({});
        }
        return reply.code(200).send(friendRequest);
    } catch (err) {
        console.log(err);
        return reply.code(500).send({ error: err });
    }
}

export async function getFriends(req, reply) {
    const {id} = req.query;
    console.log("id in getFriends:", id);

    const sql = `
		SELECT user.username, user.avatarURL, user.is_active, user.id
		FROM users user
		JOIN friend_requests req
		  ON (user.id = req.sender_id AND req.receiver_id = ?)
		  OR (user.id = req.receiver_id AND req.sender_id = ?)
		WHERE req.status = 'accepted'
		  AND user.id != ?
	`;

    try {
        const friends = await fetchAll(db, sql, [id, id, id]);
        console.log("friends :", friends);
        if (!friends || friends.length === 0)
        {
            console.log('friends not found');
        //     return reply.code(200).send({});
        }
        return reply.code(200).send(friends);
    } catch (err) {
        console.log(err);
        return reply.code(500).send({ error: err });
    }
}

export async function getStatus(req, reply) {
    const { id, receiver_id } = req.query;
    if (id == receiver_id)
    {
        return reply.code(401).send({ error: 'Unauthorized' });
    }
    console.log(req.query);
    console.log("id :", id);
    console.log("receiver_id :", receiver_id);

    const sql = `SELECT status FROM friend_requests WHERE (sender_id = ? AND receiver_id = ?)`;
   
    console.log("sql :", sql);
    try {
        const senderStatus = await fetchFirst(db, sql, [id, receiver_id]); 
        console.log("sender status :", senderStatus);
        if (!senderStatus)
        {
            const receiverStatus = await fetchFirst(db, sql, [receiver_id, id]);
            console.log("receiver status :", receiverStatus);
            if (receiverStatus)
                 return reply.code(200).send({ sender:receiver_id, status:receiverStatus.status});
            console.log('status not found');
            return reply.code(400).send({ error: 'User Not Found' });
        }
        return reply.code(200).send({ sender:id, status:senderStatus.status});
        
    } catch (err) {
        console.log(err);
        return reply.code(500).send({ error: err });
    }
}

export async function deleteRequest(req, reply) {
    const { sender_id, receiver_id } = req.query;
    const sql = `DELETE FROM friend_requests WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)`;
    try {
        await execute(db, sql, [sender_id, receiver_id, receiver_id, sender_id]);
        console.log("friend request deleted")
        return reply.code(200).send({ message: 'Delete friend request done'});
    } catch (err) {
        console.log(err);
        return reply.code(500).send({ error: err });
    }
}
