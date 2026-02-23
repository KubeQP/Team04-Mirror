import { API_BASE_URL } from '../config/api';
import type { TimeData } from '../types';

export async function editTimeData(updatedData: Partial<TimeData>): Promise<TimeData> {
	const response = await fetch(`${API_BASE_URL}/api/times/${updatedData.id}/`, {
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
