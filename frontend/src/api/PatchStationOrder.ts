import type { StationData } from '../types';

export async function updateStationOrder(stations: Omit<StationData, 'id'>[]): Promise<void> {
	const response = await fetch('http://127.0.0.1:8000/api/stations/updateOrder/', {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(stations),
	});

	if (!response.ok) {
		throw new Error('Nätverksfel: ' + response.statusText);
	}
}
