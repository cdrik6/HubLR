export function showAlert(message?: string) {
	if (!message)
		return ;
	const alert = document.getElementById('alert');
	if (!alert)
		return ;
	alert.textContent = message;
	alert.classList.remove('translate-y-full', 'opacity-0');
	alert.classList.add('translate-y-0', 'opacity-100');
	setTimeout(() => {
      alert.classList.remove('translate-y-0', 'opacity-100');
      alert.classList.add('translate-y-full', 'opacity-0');
    }, 5000);
}