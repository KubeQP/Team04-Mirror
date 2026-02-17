import { API_BASE_URL } from '../config/api';
import type { CompetitionData } from '../types';

export async function getCompetitionData(): Promise<Array<CompetitionData>> {
    const response = await fetch(`${API_BASE_URL}/api/competitions/`, {
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
