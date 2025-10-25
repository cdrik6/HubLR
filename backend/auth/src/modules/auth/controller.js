import fetch from 'node-fetch';
import bcrypt from 'bcrypt';
import FormData from 'form-data';

const SALT_ROUNDS = 10;
const TOKEN_TIME = '15m';

export async function createUser(req, reply) {
    const { username, email, password } = req.body;

    try {
        const usernameExist = await fetch(`http://users:443/exist`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({
                'username': username
            }),
        });
        if (usernameExist.ok) {
            return reply.code(409).send({ error: 'User not available' });
        }
        const emailExist = await fetch(`http://users:443/exist`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({
                'email': email
            }),
        });
        if (emailExist.ok) {

            return reply.code(409).send({ error: 'Email not available' });
        }   
    } catch (error) {
        return reply.code(500).send({ error: 'Error found' });
    }    
    try {
        console.log('Inserting user');
        console.log(password);
        const hash = await bcrypt.hash(password, SALT_ROUNDS);

        console.log("hash :", hash);
        const id = await fetch(`http://users:443/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({
                'username': username,
                'email': email,
                'password': hash
            }),
        });
        if (!id.ok)
        {
            console.log("bad registration");
        }
        // console.log("new user id :", id);
        const payload = await id.json();
        console.log("payload created");
        console.log("register payload: ", payload);

        const token = await req.jwt.sign(payload, { expiresIn: TOKEN_TIME });
        reply.clearCookie('access_token');
        reply.setCookie('access_token', token, {
            path: '/',
            httpOnly: true,
            secure: true,
        });
        console.log(`sending token : expires in ${TOKEN_TIME}`);
        return reply.code(200).send({ token });
    } catch (err) {
        console.log("error catched");
        console.log(err);
        return reply.code(500).send({ error: 'User creation failed' });
    }
}

export async function login(req, reply) {
    const { username, password } = req.body;

    const response = await fetch(`http://users:443/info`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({
            'username': username
        }),
    });

    if (!response.ok) {
        return reply.code(401).send({ error: 'Invalid username or password' });
    }
    const user = await response.json();
    console.log('user exist :', user.user);

    console.log('user.password', password);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        console.log('not match');
        return reply.code(401).send({ error: 'Invalid username or password' });
    }

    if (user.status2FA)
    {
        return reply.code(200).send({ "status":"2FA", "id":user.id });
    }
    const payload = {
        id: user.id,
    };
    const res = await fetch(`http://users:443/modify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json; charset=UTF-8',},
        body: JSON.stringify({
            id: user.id,
            is_active: 1,
            last_seen: "CURRENT_TIMESTAMP",
        }),
    });
    if (!res.ok)
    {
        return reply.code(res.status).send({ error: 'Error with connected status update'});
    }
    const token = req.jwt.sign(payload, { expiresIn: TOKEN_TIME });
    reply.clearCookie('access_token');
    reply.setCookie('access_token', token, {
        path: '/',
        httpOnly: true,
        secure: true,
    });
    console.log('sending token');
    return reply.code(200).send({ status:"accepted", token });
}

export async function userPing(req, reply) {
    const userId = req.user.id;
    const token = req.cookies.access_token;
    if (!token)
        return (reply.code(403).send({ error: 'Forbidden'}));
    try {
        console.log(token);
        const decoded = await req.jwt.verify(token);
        if (!decoded)
            return (reply.code(502).send({ error: 'Error with JWT.verify'}));
        console.log("ping from :", userId);
        const age = Date.now() / 1000 - decoded.iat;
        console.log("age:", age);
        if (age > 5 * 60)
        {
            console.log("creating new cookie token");
            const newToken = await req.jwt.sign({ id: userId }, { expiresIn: TOKEN_TIME });
            // reply.clearCookie('access_token');
            reply.setCookie('access_token', newToken, {
                path: '/',
                httpOnly: true,
                secure: true,
            });
            await fetch(`http://users:443/modify`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json; charset=UTF-8',},
                body: JSON.stringify({
                    id: req.user.id,
                    is_active: 1,
                    last_seen: "CURRENT_TIMESTAMP",
                }),
            });
        }
        return reply.code(200).send({ message: 'ping done' });
    } catch (error) {
        console.log("error :", error)
        return reply.code(500).send({error: "error in ping backend"});
    }
}

export async function logout(req, reply) {
    console.log("cookie cleared");
    const response = await fetch(`http://users:443/modify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json; charset=UTF-8',},
        body: JSON.stringify({
            id: req.user.id,
            is_active: 0,
            last_seen: "CURRENT_TIMESTAMP",
        }),
    });
    if (!response.ok)
    {
        return reply.code(response.status).send({ error: 'Error with connected status update'});
    }
    reply.clearCookie('access_token');
    return reply.code(200).send({ message: 'Logout successful' });
}

export async function deleteAccount(req, reply) {
    const { password } = req.body;
    const id = req.user.id;
    if (!password)
        return reply.code(400).send({ error: "No password found" });
    const responseInfo = await fetch(`http://users:443/info`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({
            'id': id,
        }),
    });
    
    const user = await responseInfo.json();
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        console.log('not match');
        return reply.code(401).send({ error: 'Wrong password' });
    }
    
    const responseDelete = await fetch(`http://users:443/remove`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({ 'id': user.id }),
    });
    
    if (!responseDelete.ok)
    {
        const data = await responseDelete.json();
        return reply.code(responseDelete.status).send(data);
    }
    console.log("cookie cleared");
    reply.clearCookie('access_token');
    return reply.code(responseDelete.status).send({ message: 'Delete user successful' });
}
    
export async function profileMe(req, reply) {
    console.log(req.user);
    const response = await fetch(`http://users:443/info`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({
            'id': req.user.id,
        }),
    });
    const user = await response.json();
    if (!response.ok || !user) {
        console.log('user not found');
        return reply.code(401).send({ error: 'Invalid username or password' });
    }
    const payload = {
        id: user.id,
        username: user.username,
        avatarURL: user.avatarURL,
        email: user.email,
    }

    return reply.code(200).send(payload);
}

export async function userInfo(req, reply) {
    console.log(req.user);
    const { username } = req.params;
    const response = await fetch(`http://users:443/info`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({
            'username':username
        }),
    });
    const user = await response.json();
    if (!response.ok || !user) {
        console.log('user not found');
        return reply.code(401).send({ error: 'Invalid username' });
    }
    // ADD fetch to stats and append the result
    const payload = {
        id: user.id,
        username: user.username,
        avatarURL: user.avatarURL,
        email: user.email,
        isActive: user.is_active,
        secret2FA: user.secret2FA,
        status2FA: user.status2FA
    }
    // banner: user.bannerURL,
    return reply.code(200).send(payload);
}

export async function editUser(req, reply) {
    console.log("in edit user")
    const parts = await req.parts();
    const results = [];
    var userData = {};
    let hasFiles = false;
    const userID = req.user;
    let files = new FormData();
    // console.log(files.constructor.name);
    files.append('id', String(userID));
    for await (const part of parts)
    {
        if (part.file)
        {
            // console.log(part)
            console.log("is file")

            files.append(part.fieldname, part.file, {
            filename: part.filename,
            contentType: part.mimetype,
            });
            console.log("file appended");
            hasFiles = true;
        }
        else
        {
            console.log("inserting user data");
            userData[part.fieldname] = part.value;
            console.log("user data inserted");

        }
    }
    console.log("out of for");
    console.log(files);
    console.log("userData:",userData);
    // return reply.send({ results });
    if (Object.keys(userData).length > 0)
    {
        console.log("inserting user data");
        userData['id'] = userID;
        const response = await fetch(`http://users:443/modify`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json; charset=UTF-8',},
            body: JSON.stringify(userData),
        });
        results.push({ok: response.ok, result: await response.json()}); 
    }
    if (hasFiles)
    {
        console.log("inserting user files");
        console.log('id', userID);
        // console.log(files);
        const response = await fetch(`http://users:443/upload-avatar`, {
            method: 'POST',
            headers: files.getHeaders(),
            body: files,
        });
        results.push({ok: response.ok, result: await response.json()}); 
    }

    return reply.send({ results });
}

export async function userPassword(req, reply) {
    console.log(req.body);
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
        return reply.code(400).send({ error: 'Not found oldPassword or newPassword' });
    console.log(oldPassword, newPassword);
    const userId = req.user.id;
    console.log('userId: ', userId);
    // console.log('id: ', id);
    if (!userId)
        return reply.code(400).send({ error: 'Forbidden' });
    const responseUserInfo = await fetch(`http://users:443/info`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({
            'id': userId
        }),
    });
    const user = await responseUserInfo.json();
    console.log(user);
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
        console.log('not match');
        return reply.code(401).send({ error: 'Invalid password' });
    }
    const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    const responseUserUpdate = await fetch(`http://users:443/modify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json; charset=UTF-8',},
        body: JSON.stringify({
            'id': userId,
            'password': hash,
        }),
    });

    const data = await responseUserUpdate.json();
	return (reply.code(responseUserUpdate.status).send(data));
}


// export async function verify(req, reply) {
//     return reply.send(req.user);
// }