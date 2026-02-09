import { API_BASE_URL } from '../config/api';
import type { CompetitorData } from '../types';

export async function getCompetitorData(): Promise<Array<CompetitorData>> {
	const response = await fetch(`${API_BASE_URL}/api/competitors/`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		throw new Error('Nätverksfel: ' + response.statusText);
	}

	return response.json();
}
