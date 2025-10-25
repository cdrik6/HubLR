import QRCode from 'qrcode';
import bcrypt from 'bcrypt';
import speakeasy from "speakeasy"
import Iron from '@hapi/iron';

const TOKEN_TIME = '15m';
const IRON_PASS = '7fhoyIRu!lxX5HMgP?}obyAls(ULv+g.'; //call .env


const SPEAKEASY_CONFIG = {
  secretKeyLength: 20,
  digits: 6,
  encoding: 'base32',
  step: 30, // Time step in seconds
};

export async function register2FA(req, reply) {
	const id = req.user.id;
	const { password } = req.body;
	if (!password || !id)
		return reply.code(400).send({ error: "No password or ID found" });
	const responseUserInfo = await fetch(`http://users:443/info`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json; charset=UTF-8',
			},
			body: JSON.stringify({
				'id': id
			}),
	});
	if (!responseUserInfo.ok)
		return reply.code(400).send({ error: "Error fetching users" });

	const user = await responseUserInfo.json();
	if (!user)
		return reply.code(401).send({ error: "User not found" });
	console.log(user);
	
	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) {
		console.log('not match');
		return reply.code(401).send({ error: 'Incorrect password' });
	}
	const secretKey = speakeasy.generateSecret({ length: SPEAKEASY_CONFIG.secretKeyLength, name: `ft_transcendence ${user.username}`, issuer:'ft_transcendence'});
	
	const secret = secretKey.base32;

	try {
		const sealed = await Iron.seal(secret, IRON_PASS, Iron.defaults);
		const responseUpdate = await fetch(`http://users:443/modify`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json; charset=UTF-8',},
			body: JSON.stringify({
				id: user.id,
				secret2FA: sealed,
				status2FA: 1
			}),
		});
		if (!responseUpdate)
			return (reply.code(responseUpdate.status).send({ error:"Error updating user (2FA)" }));
	} catch (error) {
		return (reply.code(500).send(error));
	}
	return reply.code(200).send({ message: "2FA activated" });
}

export async function get2FA(req, reply) {
	const id = req.user.id;
	const response = await fetch(`http://users:443/info`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json; charset=UTF-8',
		},
		body: JSON.stringify({
			'id': id
		}),
	});
	if (!response.ok)
		return reply.code(400).send({ error: "Error fetching users" });
	const user = await response.json();
	if (!user)
		return reply.code(401).send({ error: "User not found" });

	try {

		const unsealed = await Iron.unseal(user.secret2FA, IRON_PASS, Iron.defaults);
		const url = speakeasy.otpauthURL({ secret: unsealed, label: `ft_transcendence (${user.username})`, issuer: 'ft_transcendence', encoding: 'base32' });
		const qrURL = await QRCode.toDataURL(url);
		return reply.code(200).send({ qrCode: qrURL, secret: unsealed });

	} catch (error) {
		return (reply.code(500).send(error));
	}
}

export async function verify2FA(req, reply) {
	// const id = req.user.id;
	const { id, token } = req.body;
	console.log("in verify:", id, token);
	if (!token || !id)
		return reply.code(400).send({ error: "No token or id given" });
	const response = await fetch(`http://users:443/info`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json; charset=UTF-8',
		},
		body: JSON.stringify({
			'id': id
		}),
	});
	if (!response.ok)
		return reply.code(400).send({ error: "Error fetching users" });
	const user = await response.json();
	if (!user)
		return reply.code(401).send({ error: "User not found" });
	try {
		const unsealed = await Iron.unseal(user.secret2FA, IRON_PASS, Iron.defaults);
		console.log(unsealed);
		const verified = speakeasy.totp.verify({
			secret: unsealed,
			encoding: SPEAKEASY_CONFIG.encoding,
			token,
			digits: SPEAKEASY_CONFIG.digits,
			step: SPEAKEASY_CONFIG.step,
			window: 2
		});
		if (!verified)
			return reply.code(401).send({ verified: false });
		
		const payload = { id: user.id };
		const jwtToken = req.jwt.sign(payload, { expiresIn: TOKEN_TIME });
		reply.clearCookie('access_token');
		reply.setCookie('access_token', jwtToken, {
			path: '/',
			httpOnly: true,
			secure: true,
		});
		return reply.code(200).send({ status:"accepted", jwtToken });
		
	} catch (error) {
		return (reply.code(500).send(error));
	}
}

export async function deactivate2FA(req, reply) {
	const id = req.user.id;
	const { password } = req.body;
	if (!password || !id)
		return reply.code(400).send({ error: "No password or ID found" });
	const responseUserInfo = await fetch(`http://users:443/info`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json; charset=UTF-8',
			},
			body: JSON.stringify({
				'id': id
			}),
	});
	if (!responseUserInfo.ok)
		return reply.code(400).send({ error: "Error fetching users" });

	const user = await responseUserInfo.json();
	if (!user)
		return reply.code(401).send({ error: "User not found" });
	console.log(user);
	
	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) {
		console.log('not match');
		return reply.code(401).send({ error: 'Incorrect password' });
	}

	const response = await fetch(`http://users:443/modify`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json; charset=UTF-8',
		},
		body: JSON.stringify({
			'id': id,
			status2FA: 0
		}),
	});
	if (!response.ok)
	{
		const data = await response.json();
		return reply.code(response.status).send(data);
	}
	return reply.code(200).send({ message: "2FA deactivated" });

}