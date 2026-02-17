import type { CompetitionData } from '../types';
import { API_BASE_URL } from '../config/api';

export async function createCompetition(): Promise<CompetitionData> {
	const response = await fetch(`${API_BASE_URL}/api/competitions/register`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({}),
	});

	if (!response.ok) {
		throw new Error(`Failed to create competition: ${response.statusText}`);
	}

	return response.json();
}
