import '@testing-library/jest-dom';

import { describe, expect, it, vi } from 'vitest';

import { buildRequestPayload, getExampleData } from './example_api';

describe('getExampleData', () => {
	it('hämtar och formaterar data korrekt', async () => {
		// Mocka Math.random så att det returnerar 0.5 varje gång.
		// Detta gör att vi kan förutsäga vilket ID som kommer att användas
		// i anropet till API:t, vilket gör testet mer stabilt.
		vi.spyOn(Math, 'random').mockReturnValue(0.5);

		// Mocka fetch, alltså när någon anropar fetch så returner vi själv
		// sådan data som vi vill ha när getExampleData körs på riktigt.
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () =>
				Promise.resolve({
					title: 'Testtitel',
					body: 'Testinnehåll',
				}),
		});

		// Anropa funktionen som vi vill testa
		// och som i sin tur anropar fetch.
		const result = await getExampleData();

		// Kontrollera att fetch anropades med rätt URL.
		// Id 51 är resultatet av Math.random() * 100 + 1 (0.5 * 100 + 1 = 51)
		expect(globalThis.fetch).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/posts/51');

		// Kontrollera att resultatet är som vi förväntar oss
		// och att getExampleData formaterar datan korrekt.
		expect(result).toEqual({
			title: 'Testtitel',
			body: 'Testinnehåll',
		});
	});
});

// Snapshot-test för buildRequestPayload
describe('buildRequestPayload', () => {
	// Fixa datumet till en specifik tidpunkt för att göra snapshot-testet stabilt
	const fixedDate = new Date('2025-01-01T12:00:00.000Z');

	beforeAll(() => {
		vi.useFakeTimers();
		vi.setSystemTime(fixedDate);
	});

	afterAll(() => {
		vi.useRealTimers();
	});

	it('har korrekt struktur för API-anropet', () => {
		const payload = buildRequestPayload(42);
		expect(payload).toMatchSnapshot();
	});
});
