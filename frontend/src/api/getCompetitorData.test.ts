import '@testing-library/jest-dom';

import { describe, expect, it, vi } from 'vitest';

import { getCompetitorData } from './getCompetitorData';

describe('getCompetitorData', () => {
	it('hämtar och formaterar data korrekt', async () => {
		// Mocka fetch, alltså när någon anropar fetch så returner vi själv
		// sådan data som vi vill ha när getExampleData körs på riktigt.
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () =>
				Promise.resolve({
					id: 10,
					start_number: '15',
					name: 'hej',
				}),
		});

		// Anropa funktionen som vi vill testa
		// och som i sin tur anropar fetch.
		const result = await getCompetitorData();

		// Kontrollera att fetch anropades med rätt URL.
		expect(globalThis.fetch).toHaveBeenCalledWith('http://127.0.0.1:8000/api/competitors/', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		// Kontrollera att resultatet är som vi förväntar oss
		// och att getExampleData formaterar datan korrekt.
		expect(result).toEqual({
			id: 10,
			start_number: '15',
			name: 'hej',
		});
	});
});
