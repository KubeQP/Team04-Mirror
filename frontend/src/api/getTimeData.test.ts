import '@testing-library/jest-dom';

import { describe, expect, it, vi } from 'vitest';

import { getTimeData } from './getTimeData';

const fixedDate = new Date('2025-01-01T12:00:00.000Z');

describe('getTimeData', () => {
	it('hämtar och formaterar data korrekt', async () => {
		// Mocka fetch, alltså när någon anropar fetch så returner vi själv
		// sådan data som vi vill ha när getExampleData körs på riktigt.
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () =>
				Promise.resolve({
					id: 0,
					competitor_id: '1',
					timestamp: fixedDate,
				}),
		});

		// Anropa funktionen som vi vill testa
		// och som i sin tur anropar fetch.
		const result = await getTimeData();

		// Kontrollera att fetch anropades med rätt URL.
		expect(globalThis.fetch).toHaveBeenCalledWith('http://127.0.0.1:8000/times/');

		// Kontrollera att resultatet är som vi förväntar oss
		// och att getExampleData formaterar datan korrekt.
		expect(result).toEqual({
			id: 0,
			competitor_id: '1',
			timestamp: fixedDate,
		});
	});
});
