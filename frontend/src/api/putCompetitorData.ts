import { API_BASE_URL } from '../config/api';
import type { CompetitorData } from '../types';

export async function editCompetitorData(updatedData: Partial<CompetitorData>): Promise<CompetitorData> {
	const response = await fetch(`${API_BASE_URL}/api/competitors/${updatedData.id}/`, {
		method: 'PUT', // or 'PATCH' if your API supports partial updates
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(updatedData),
	});

	if (!response.ok) {
		throw new Error('Nätverksfel: ' + response.statusText);
	}

	return response.json();
}
