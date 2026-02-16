import { API_BASE_URL } from '../config/api';
import type { TimeData } from '../types';

export async function getTimeData(): Promise<Array<TimeData>> {
	const response = await fetch(`${API_BASE_URL}/api/times/`, {
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
