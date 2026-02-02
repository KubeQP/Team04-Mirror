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
		{ id: 0, competitor_id: 0, timestamp: '2025-06-27T12:31:39' },
		{ id: 1, competitor_id: 1, timestamp: '2025-06-27T12:32:15' },
	];

	vi.mocked(getCompetitorData).mockResolvedValue(competitors);
	vi.mocked(getTimeData).mockResolvedValue(times);

	render(<Admin />);
});

//Alla förväntade tabell värden visas som förväntad
describe('Admin', () => {
	it('hämtar och visar tävlande i tabell', async () => {
		render(<Admin />);

		await waitFor(() => {
			expect(getTimeData).toHaveBeenCalled();

			expect(screen.getAllByText('007')).toHaveLength(4);
			expect(screen.getAllByText('123')).toHaveLength(4);
			expect(screen.getAllByText('Anna')).toHaveLength(2);
			expect(screen.getAllByText('Bob')).toHaveLength(2);
			expect(screen.getAllByText('2025-06-27T12:31:39')).toHaveLength(4);
			expect(screen.getAllByText('2025-06-27T12:32:15')).toHaveLength(4);
		});

		// Bonus: bekräfta att GET faktiskt körts
		expect(getCompetitorData).toHaveBeenCalled();
		expect(getTimeData).toHaveBeenCalled();
	});
});
