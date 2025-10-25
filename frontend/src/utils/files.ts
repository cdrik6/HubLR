import { showAlert } from "../components/alerts.js";

export function validateFileInput(input : HTMLInputElement) : boolean {

	const file = input.files?.[0];
	if (!file || !input.files)
		return (false);

	if (input.files.length > 1) {
		showAlert('Please upload only one image');
		input.value = '';
		return (false);
	}

	const maxSize = 2 * 1024 * 1024;
	if (file.size > maxSize) {
		showAlert('File is too large (Max 2MB)');
		input.value = '';
		return (false);
	}

	const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
	if (!validTypes.includes(file.type)) {
		showAlert('Invalid file type. Please upload an image');
		input.value = '';
		return (false);
	}
	return (true);
}

export function compressImage(file: File): Promise<Blob> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
	
		reader.onload = () => {
			const img = new Image();
			img.onload = () => {
				const canvas = document.createElement('canvas');
				const scale = Math.min(1, Math.sqrt((100 * 1024) / file.size));
				canvas.width = img.width * scale;
				canvas.height = img.height * scale;
			
				const ctx = canvas.getContext('2d');
				if (!ctx)
					return (reject('No 2d context'));
				
				ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

				canvas.toBlob((blob) => {
					if (!blob)
						return (reject('Compression failed'));
					resolve(blob);
				},
				"image/jpeg",
				0.7);
			};
			img.onerror = reject;
			img.src = reader.result as string;
		};
		reader.onerror = reject;
		reader.readAsDataURL(file);

	})
}
