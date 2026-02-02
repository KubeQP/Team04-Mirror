import type { StationData } from '../types';

export async function getStationData(): Promise<Array<StationData>> {
	const response = await fetch('http://127.0.0.1:8000/api/stations/getstations', {
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
