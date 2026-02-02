import '@testing-library/jest-dom';

import { describe, expect, it, vi } from 'vitest';

import { getStationData } from './getStationData';

describe('getStationData', () => {
	it('hämtar och formaterar stationsdata korrekt', async () => {
		// Mocka fetch
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () =>
				Promise.resolve([
					{
						id: 1,
						station_name: 'Start',
						order: '0',
					},
					{
						id: 2,
						station_name: 'Mål',
						order: '1',
					},
				]),
		} as Response);

		// Anropa funktionen som testas
		const result = await getStationData();

		// Kontrollera att fetch anropas med rätt URL
		expect(globalThis.fetch).toHaveBeenCalledWith('http://127.0.0.1:8000/api/stations/getstations', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		// Kontrollera att resultatet matchar exakt det vi förväntar oss
		expect(result).toEqual([
			{
				id: 1,
				station_name: 'Start',
				order: '0',
			},
			{
				id: 2,
				station_name: 'Mål',
				order: '1',
			},
		]);
	});
});
