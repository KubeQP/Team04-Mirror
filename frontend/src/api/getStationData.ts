import { API_BASE_URL } from '../config/api';
import type { StationData } from '../types';

export async function getStationData(): Promise<Array<StationData>> {
	const response = await fetch(`${API_BASE_URL}/api/stations/getstations`, {
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
