import '@testing-library/jest-dom';

import { describe, expect, it, vi } from 'vitest';

import { API_BASE_URL } from '../config/api';
import { getCompetitionData } from './getCompetitionData';

describe('getCompetitionsData', () => {
	it('hämtar och formaterar data korrekt', async () => {
		// Mocka fetch, alltså när någon anropar fetch så returner vi själv
		// sådan data som vi vill ha när getExampleData körs på riktigt.
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () =>
				Promise.resolve({
					id: 10
				}),
		});

		// Anropa funktionen som vi vill testa
		// och som i sin tur anropar fetch.
		const result = await getCompetitionData();

		// Kontrollera att fetch anropades med rätt URL.
		expect(globalThis.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/competitions/`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		// Kontrollera att resultatet är som vi förväntar oss
		// och att getExampleData formaterar datan korrekt.
		expect(result).toEqual({
			id: 10,
		});
	});
});
