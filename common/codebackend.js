function apiFetch(cmd, o = {}) {
	// Minimal backend access point for common/api.php (JSON POST). Table-specific helpers arrive with backend wiring.
	return fetch('../common/api.php', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ cmd, ...o }),
	}).then(r => r.json());
}
