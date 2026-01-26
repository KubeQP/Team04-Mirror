import type { TimeData } from '../types';

export async function getTimeData(): Promise<TimeData> {
	const response = await fetch(`http://127.0.0.1:8000/times`);

	if (!response.ok) {
		throw new Error('Nätverksfel: ' + response.statusText);
	}

	return response.json();
}
