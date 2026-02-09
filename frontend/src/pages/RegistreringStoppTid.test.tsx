import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest';

import RegistreringStoppTid from './RegistreringStoppTid';

// ---------- Typer ----------
type OutletCtx = {
	competitorsVersion: number;
	notifyCompetitorAdded: () => void;
};

type Competitor = { start_number: string; name: string };
type Station = { id: number; station_name: string; order: string };

type TimeEntryOut = {
	id?: number;
	competitor_id?: number;
	timestamp: string;
};

// ---------- Mocka react-router-dom utan any ----------
vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');

	return {
		...actual,
		useOutletContext: (): OutletCtx => ({
			competitorsVersion: 0,
			notifyCompetitorAdded: () => {},
		}),
	};
});

// ---------- “Fake DB” i test ----------
let competitorsDb: Competitor[] = [];
let stationsDb: Station[] = [];

// ---------- Typad fetch-mock ----------
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let fetchSpy: MockInstance;

beforeEach(() => {
	competitorsDb = [
		{ start_number: '007', name: 'Anna' },
		{ start_number: '123', name: 'Bob' },
		{ start_number: '124', name: 'Benim' },
	];

	stationsDb = [
		{ id: 0, station_name: 'Start', order: '1' },
		{ id: 1, station_name: 'Mål', order: '2' },
	];

	fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
		const url = String(input);
		const method = init?.method ?? 'GET';

		// GET /api/competitors/
		if (url.endsWith('/api/competitors/') && method === 'GET') {
			return new Response(JSON.stringify(competitorsDb), { status: 200 });
		}

		// GET /api/stations/getstations
		if (url.endsWith('/api/stations/getstations') && method === 'GET') {
			return new Response(JSON.stringify(stationsDb), { status: 200 });
		}

		// POST /api/times/record
		if (url.endsWith('/api/times/record') && method === 'POST') {
			const bodyRaw = init?.body ? String(init.body) : '{}';
			const body = JSON.parse(bodyRaw) as { start_number: string; timestamp: string };

			const out: TimeEntryOut = {
				id: 1,
				competitor_id: 99,
				timestamp: body.timestamp,
			};

			return new Response(JSON.stringify(out), { status: 200 });
		}

		return new Response('Not found', { status: 404 });
	});
});

describe('RegistreringStoppTid', () => {
	it('hämtar tävlande, visar dem i tabell och filtrerar dropdown via sökfält', async () => {
		render(<RegistreringStoppTid />);

		// Wait for competitors to load (table)
		await waitFor(() => {
			expect(screen.getByText('007')).toBeInTheDocument();
			expect(screen.getByText('Anna')).toBeInTheDocument();
			expect(screen.getByText('123')).toBeInTheDocument();
			expect(screen.getByText('Bob')).toBeInTheDocument();
		});

		// Type in search input
		// Type in search input
		const searchInput = screen.getByPlaceholderText('searchComp');
		fireEvent.change(searchInput, { target: { value: '007' } });

		// Dropdown should now be filtered
		await waitFor(() => {
			expect(screen.getByRole('option', { name: '007 — Anna' })).toBeInTheDocument();
		});
	});
});

it('disablar stopptidsknappen om inga tävlande finns', async () => {
	competitorsDb = [];
	render(<RegistreringStoppTid />);

	await waitFor(() => {
		expect(screen.getByText(/Inga tävlande hittades/i)).toBeInTheDocument();
	});

	expect(screen.getByText('Registrera stopptid nu')).toBeDisabled();
});
