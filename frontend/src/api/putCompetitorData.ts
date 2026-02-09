import type { CompetitorData } from '../types';

export async function editCompetitorData(id: number, updatedData: Partial<CompetitorData>): Promise<CompetitorData> {
    const response = await fetch(`http://127.0.0.1:8000/api/competitors/${id}/`, {
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
