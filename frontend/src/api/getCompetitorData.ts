import type { CompetitorData } from '../types';

export async function getCompetitorData(): Promise<CompetitorData> {
	const response = await fetch('http://127.0.0.1:8000/competitors/');

	if (!response.ok) {
		throw new Error('Nätverksfel: ' + response.statusText);
	}

	console.log(response);

	return response.json();
}
