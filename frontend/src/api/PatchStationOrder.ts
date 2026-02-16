import type { StationData } from '../types';

export async function swapStationOrder(updatedData: Partial<Array<StationData>>): Promise<Array<StationData>> {
	const response = await fetch(`http://127.0.0.1:8000/api/stations/swapStationOrder}/`, {
		method: 'PATCH', // or 'PATCH' if your API supports partial updates
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
