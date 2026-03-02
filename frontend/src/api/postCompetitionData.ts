import { API_BASE_URL } from '../config/api';
import type { CompetitionData } from '../types';

export async function createCompetition(token: string): Promise<CompetitionData> {
	const response = await fetch(`${API_BASE_URL}/api/competitions/register`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ token }),
	});

	if (!response.ok) {
		throw new Error(`Failed to create competition: ${response.statusText}`);
	}

	return response.json();
}
