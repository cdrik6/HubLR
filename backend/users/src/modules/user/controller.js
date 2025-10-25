import path from 'path';
import db from "../../app.js";
import { execute, fetchFirst } from "../../utils/sql.js";
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';

export async function insertUser(req, reply) {
    const { username, email, password } = req.body;
    const sql = `INSERT INTO users (email, username, password, avatarURL) VALUES (?, ?, ?, ?)`;
    try {
        console.log(`Inserting user in Data Base "users"`);

        await execute(db, sql, [email, username, password, "defaulAvatar.png"]);

        const sqlGet = `SELECT id FROM users WHERE username = ?`;
        const id = await fetchFirst(db, sqlGet, username);
        console.log("id in DB users: ", id);
        return reply.code(201).send(id);
    } catch (err) {
        console.log("user creation failed");
        console.log(err);
        return reply.code(500).send({ error: err });
    }
}

export async function getUser(req, reply) {
    const token = req.body;
    console.log("req.body :", req.body);
    let sql = `SELECT * FROM users WHERE id = ?`;
    if ("username" in token)
        sql = `SELECT * FROM users WHERE username = ?`;
    console.log("sql :", sql);
    try {
        console.log(Object.values(token)[0]);
        const user = await fetchFirst(db, sql, [Object.values(token)[0]]);
        console.log("user :", user);
        if (!user)
        {
            console.log('user not found');
            return reply.code(401).send({ error: 'User Not Found' });
        }
        // const payload = {
        //     id: user.id,
        //     username: user.username,
        //     email: user.email,
        //     created_at: user.created_at,
        // }
        return reply.code(200).send(user);
    } catch (err) {
        console.log(err);
        return reply.code(500).send({ error: 'Get user failed' });
    }
}

export async function isCreated(req, reply) {
    const { username, email } = req.body;
    console.log("req.body :", req.body);
    if (username)
    {
        const sql = `SELECT * FROM users WHERE username = ?`;
        try {
            const user = await fetchFirst(db, sql, [username]);
            console.log("user :", user);
            if (!user)
            {
                console.log('user not found');
                return reply.code(404).send({ message: 'User Not Found' });
            }
            return reply.code(200).send({ message: 'User Found' });
        } catch (err) {
            console.log(err);
            return reply.code(500).send({ error: 'Get user failed' });
        }
    }
    else {
        const sql = `SELECT * FROM users WHERE email = ?`;
        try {
            const emailResponse = await fetchFirst(db, sql, [email]);
            console.log("email :", emailResponse);
            if (!emailResponse)
            {
                console.log('email not found');
                return reply.code(404).send({ message: 'email Not Found' });
            }
            return reply.code(200).send({ message: 'Email Found' });
        } catch (err) {
            console.log(err);
            return reply.code(500).send({ error: 'Get email failed' });
        }
    }
}

export async function removeUser(req, reply) {
    console.log("in user delete");
    const { id } = req.body;
    const sql = `DELETE FROM users WHERE id = ?`;
    try {
        await execute(db, sql, [id]);
        console.log("user deleted")
        const sqlFriends = `DELETE FROM friend_requests WHERE sender_id = ? OR receiver_id = ?`;
        await execute(db, sqlFriends, [id, id]);
        console.log("user db done")
        return reply.code(200).send({ message: 'Delete user done'});
    } catch (err) {
        console.log(err);
        return reply.code(500).send({ error: 'Delete user failed' });
    }
}

export async function updateUser(req, reply) {
    const requestToken = req.body;
    console.log("request token :", requestToken);
    try {
        const sqlGet = `SELECT * FROM users WHERE id = ?`;
        const user = await fetchFirst(db, sqlGet, [requestToken.id]);
        console.log("user :", user);
        if (!user)
        {
            console.log("user not found");
            return reply.code(401).send({ error: 'User not found' });
        }
        let params;
        let sql;
        for (const key in requestToken) {
            if (requestToken[key] != user[key] && key != "id")
            {
                console.log(requestToken[key])
                if (key === 'last_seen' && requestToken[key] === 'CURRENT_TIMESTAMP') {
                    sql = `UPDATE users SET ${key} = CURRENT_TIMESTAMP WHERE id = ?`;
                    params = [requestToken["id"]];
                }
                else {
                    sql = `UPDATE users SET ${key} = ? WHERE id = ?`;
                    params = [requestToken[key], requestToken["id"]];
                }
                await execute(db, sql, params);
            }
        }
        const updatedUser = await fetchFirst(db, sqlGet, [requestToken.id]);
        if (updatedUser)
            return reply.code(200).send(updatedUser);
    } catch (err) {
        console.log(err);
        return reply.code(500).send({ error: 'Update user failed' });
    }
}

export async function uploadFiles(req, reply) {
	console.log("in uploadFiles");
    // const files = await req.file();
    let userId;
    const parts = req.parts();

    const data = {};

    const storedParts = [];
    for await (const part of parts)
    {
        storedParts.push(part);
     
        if (!part.file)
            data[part.fieldname] = part.value;
    }
    console.log('data :', data);
    // return reply.send({ message: 'Upload OK', received: data });
    userId = data['id'];
    if (!userId)
    {
        console.log('user ID not found');
        return reply.code(404).send({ message: 'User ID Not Found' });
    }
    console.log('user ID found');
    // return reply.send({ message: 'Upload OK', userId });
    console.log(req.body);
    console.log("userId:", userId);
    const sqlUser = `SELECT * FROM users WHERE id = ?`;
    const user = await fetchFirst(db, sqlUser, [userId]);
    if (!user)
    {
        console.log('user not found');
        return reply.code(404).send({ message: 'User Not Found' });
    }
    console.log("user :", user);
        // console.log('req:',req);
    let avatarFilename = user.avatarURL;
    // let bannerFilename = user.bannerURL;

    // console.log(parts);
    // console.log(req.body)
    if (!storedParts){
        return reply.code(400).send({ error: 'No file uploaded' });
    }


    for (const part of storedParts) {
        if (part.file && (part.fieldname === 'avatar')) {// || part.fieldname === 'banner')){
           console.log("part:", part);
            const ext = path.extname(part.filename);
            const safeFilename = `${userId}_${part.fieldname}${ext}`;
            const dest = path.join('/var/local/images/avatars', safeFilename);
            // part.fieldname === 'avatar' ? path.join('/var/local/images/avatars', safeFilename) : path.join('/var/local/images/banners', safeFilename)
            try {
                await pipeline(part.file, createWriteStream(dest));
            } catch (error) {
                // app.log.error(error);
                return reply.code(500).send({ error: 'Failed to save a file' });
            }
            if (part.fieldname === 'avatar')
                avatarFilename = safeFilename;
            // if (part.fieldname === 'banner')
            //     bannerFilename = safeFilename;
        }
    }
    
    try {
        const sqlGet = `SELECT * FROM users WHERE id = ?`;
        const user = await fetchFirst(db, sqlGet, [userId]);
        console.log("user :", user);
        if (!user)
        {
            console.log("user not found");
            return reply.code(401).send({ error: 'User not found' });
        }
        console.log("avatarURL:", avatarFilename)
        // console.log("bannerURL:", bannerFilename)

        // , bannerURL = ?
        const sql = `UPDATE users SET avatarURL = ? WHERE id = ?`;
        await execute(db, sql, [avatarFilename, user.id]); //, bannerFilename
        
        return reply.code(200).send({ message: 'Update user image done' });
    } catch (err) {
        console.log(err);
        return reply.code(500).send({ error: 'Update user failed' });
    }

}


// export async function uploadBanner(req, reply) {
// 	const data = await req.file();

//     // console.log('req:',req);
//     console.log(data);
//     // console.log(req.body)
//     if (!data){
//         return reply.code(400).send({ error: 'No file uploaded' });
//     }

//     const validation = validateFile(data.filename);
//     if (!validation.valid) {
//         return reply.code(400).send({
//             error: 'File validation failed',
//             details: validation.errors
//         });
//     }

//     const filename = 'banner_' + data.filename;
//     const filePath = path.join(uploadsDir, filename);

//     console.log('filePath', filePath)
//     try {
//         await pipeline(data.file, createWriteStream(filePath));
//         return {
//             success: true,
//             filename: filename,
//             mimetype: data.mimetype,
//             encoding: data.encoding,
//             path: filePath
//         };
//     } catch (error) {
//         // app.log.error(error);
//         return reply.code(500).send({ error: 'Failed to save file' });
//     }
// }
