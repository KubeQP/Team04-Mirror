import type { TimeData } from '../types';

export async function editTimeData(id: number, updatedData: Partial<TimeData>): Promise<TimeData> {
    const response = await fetch(`http://127.0.0.1:8000/api/times/${id}/`, {
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
