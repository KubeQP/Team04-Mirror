import type { TimeData } from '../types';

export async function editTimeData(updatedData: Partial<TimeData>): Promise<TimeData> {
	const response = await fetch(`http://127.0.0.1:8000/api/times/${updatedData.id}/`, {
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
