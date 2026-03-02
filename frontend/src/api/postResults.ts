import { API_BASE_URL } from '../config/api';
import type { Result } from '../types';

export async function submitResults(competition_id: number): Promise<Result> {
	const response = await fetch(`${API_BASE_URL}/api/results/submit`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ competition_id }),
	});

	if (!response.ok) throw new Error(`Failed: ${response.statusText}`);
	return response.json();
}
