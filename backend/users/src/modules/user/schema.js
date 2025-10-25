export const registerSchema = {
	body: {
		type: 'object',
		required: ['username', 'password', 'email'],
		properties: {
			username: { type: 'string', minLength: 3, maxLength: 7 },
			email: { type: 'string', format: 'email' },
			password: { type: 'string', minLength: 6 }
		}
	},
	response: {
		201: {
			type: 'object',
			properties: {
				token: { type: 'string' }
			}
		},
		409: {
			type: 'object',
			properties: {
				error: { type: 'string' }
			}
		}
	}
};

export const loginSchema = {
	body: {
		type: 'object',
		required: ['username', 'password'],
		properties: {
			username: { type: 'string' },
			password: { type: 'string' },
		}
	},
	response: {
		200: {
			type: 'object',
			properties: {
				token: { type: 'string' }
			}
		},
		401: {
			type: 'object',
			properties: {
				error: {type: 'string' }
			}
		}
	}
};