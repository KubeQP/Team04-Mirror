import { API_BASE_URL } from '../config/api';
import type { StationData } from '../types';

export async function updateStationOrder(stations: Omit<StationData, 'id'>[]): Promise<void> {
	if (stations.length === 0) return;

	const response = await fetch(`${API_BASE_URL}/api/stations/updateOrder/`, {
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
