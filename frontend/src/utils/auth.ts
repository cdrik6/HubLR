import { userType } from "./types.js";

export async function getCurrentUser() :  Promise<userType | null> {
	try {
		const res = await fetch('/api/auth/me', { method : 'GET', credentials : 'include' });
		if (res.ok)
		{
			const user = await res.json();
			return user;
		}
		return null;
	} catch (error) {
		console.log("Error with fetch('/api/auth/me')", error);
		return null;
	}
}
