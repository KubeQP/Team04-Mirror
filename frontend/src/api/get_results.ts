import type { CompetitorData } from "../types";

export async function getCompetitorData(): Promise<CompetitorData> {
	// Simulera en fördröjning för att efterlikna ett långsamt API-anrop

	const response = await fetch(`http://127.0.0.1:8000/competitors`);

	if (!response.ok) {
		throw new Error('Nätverksfel: ' + response.statusText);
	}

	return response.json();
}   

