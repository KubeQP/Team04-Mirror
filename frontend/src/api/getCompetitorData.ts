import type { CompetitorData } from '../types';

export async function getCompetitorData(): Promise<Array<CompetitorData>> {
	const response = await fetch('http://127.0.0.1:8000/competitors/', {
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
