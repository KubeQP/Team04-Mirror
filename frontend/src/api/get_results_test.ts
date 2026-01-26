import '@testing-library/jest-dom';

import { describe, expect, it, vi } from 'vitest';

import { getCompetitorData} from './get_results';

describe('getCompetitors', () => {
	it('hämtar och formaterar data korrekt', async () => {
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
		// Id 51 är resultatet av Math.random() * 100 + 1 (0.5 * 100 + 1 = 51)
		expect(globalThis.fetch).toHaveBeenCalledWith('http://127.0.0.1:8000/competitors');

		// Kontrollera att resultatet är som vi förväntar oss
		// och att getExampleData formaterar datan korrekt.
		expect(result).toEqual({
			id: 10,
            start_number: '15',
            name: 'hej',
                })
    });
})