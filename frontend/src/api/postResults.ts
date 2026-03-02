import { API_BASE_URL } from '../config/api';
import type { Result } from '../types';

export async function submitResults(token: string): Promise<Result> {
	const response = await fetch(`${API_BASE_URL}/api/results/submit`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ token }),
	});

	if (!response.ok) throw new Error(`Failed: ${response.statusText}`);
	return response.json();
}
