import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getCompetitorData } from '../api/getCompetitorData';
import { getTimeData } from '../api/getTimeData';
import type { CompetitorData, TimeData } from '../types';
import Admin from './Admin';

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
	return {
		...actual,
		useOutletContext: () => ({
			competitorsVersion: 0,
			notifyCompetitorAdded: () => {},
		}),
	};
});

vi.mock('../api/getCompetitorData', () => ({
	getCompetitorData: vi.fn(),
}));

vi.mock('../api/getTimeData', () => ({
	getTimeData: vi.fn(),
}));

// En liten "in-memory" lista som låtsas vara backend-DB i testet
let competitors: CompetitorData[] = [];
let times: TimeData[] = [];

beforeEach(() => {
	competitors = [
		{ id: 0, start_number: '007', name: 'Anna' },
		{ id: 1, start_number: '123', name: 'Bob' },
	];
	times = [
		{ id: 0, competitor_id: 0, timestamp: '2025-06-27T12:31:39', station_id: 0 },
		{ id: 1, competitor_id: 1, timestamp: '2025-06-27T12:32:15', station_id: 0 },
	];

	vi.mocked(getCompetitorData).mockResolvedValue(competitors);
	vi.mocked(getTimeData).mockResolvedValue(times);

	render(<Admin />);
});

//Alla förväntade tabell värden visas som förväntad

// ---------------------------
// Test 2: Ingen startid eller stoptid → röd ruta
describe('Person utan start eller stopptid', () => {
	beforeEach(() => {
		times = [
			{ id: 0, competitor_id: 0, timestamp: '-', station_id: 0 }, // ingen starttid
		];
		vi.mocked(getTimeData).mockResolvedValue(times);
		render(<Admin />);
	});

	it('markerar start- eller stopptid som röd', async () => {
		await waitFor(() => {
			const redCells = screen.getAllByText('-').filter((el) => (el as HTMLElement).style.backgroundColor === 'red');
			expect(redCells.length).toBeGreaterThan(0);
		});
	});
});

// ---------------------------
// Test 3: Totaltid ska visas korrekt
describe('Totaltid beräkning', () => {
	beforeEach(() => {
		times = [
			{ id: 0, competitor_id: 0, timestamp: '2025-06-27T12:00:00', station_id: 0 },
			{ id: 1, competitor_id: 0, timestamp: '2025-06-27T12:30:00', station_id: 1 },
		];
		vi.mocked(getTimeData).mockResolvedValue(times);
		render(<Admin />);
	});

	it('visar korrekt totaltid', async () => {
		await waitFor(() => {
			// exempel: 30 minuter = 00:30:00
			expect(screen.getByText('00:30:00')).toBeInTheDocument();
		});
	});
});

// ---------------------------
// Test 4: Samma startnummer + station → röd
describe('Dubbelregistrering med samma startnummer och station', () => {
	beforeEach(() => {
		times = [
			{ id: 0, competitor_id: 0, timestamp: '2025-06-27T12:31:39', station_id: 0 },
			{ id: 1, competitor_id: 1, timestamp: '2025-06-27T12:32:39', station_id: 0 },
			{ id: 2, competitor_id: 1, timestamp: '2025-06-27T12:33:00', station_id: 0 }, // samma station + start_number
		];
		vi.mocked(getTimeData).mockResolvedValue(times);
		render(<Admin />);
	});

	it('markerar celler med samma startnummer och station som röd', async () => {
		await waitFor(() => {
			const redCells = screen.getAllByText('123').filter((el) => (el as HTMLElement).style.backgroundColor === 'red');
			expect(redCells.length).toBeGreaterThan(0);
		});
	});
});
