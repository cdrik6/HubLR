import { promises as fs } from 'fs';
import * as path from 'path';
// import { fileURLToPath } from 'url';

//check
// const dirname = path.dirname(fileURLToPath(import.meta.url));

export const uploadsDir = path.join('/var/local/images');

export async function ensureUploadDir() {
	await fs.mkdir(uploadsDir, { recursive: true });
}


export function validateFile(filename) {
	const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
	const result = { valid: true, errors: [] };
	if (!filename || filename.trim === '')
	{{
		result.valid = false;
		result.errors.push('No filename provided');
		return (result);
	}}
	const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
	if (!allowedExtensions.includes(ext)) {
		result.valid = false;
		result.errors.push(`File extension '${ext}' not allowed. Allowed: ${allowedExtensions.join(', ')}`);
	}

	return (result);
}

// export class FileValidator {
// 	constructor() {
// 		this.allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif']
// 	}
// }
