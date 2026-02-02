import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest';

import RegistreringStoppTid from './RegistreringStoppTid';

// ---------- Typer ----------
type OutletCtx = {
	competitorsVersion: number;
	notifyCompetitorAdded: () => void;
};

type Competitor = { start_number: string; name: string };

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

// ---------- Typad fetch-mock ----------
let fetchSpy: MockInstance;

beforeEach(() => {
	competitorsDb = [
		{ start_number: '007', name: 'Anna' },
		{ start_number: '123', name: 'Bob' },
	];

	fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
		const url = String(input);
		const method = init?.method ?? 'GET';

		// GET /competitors/
		if (url.endsWith('/competitors/') && method === 'GET') {
			return new Response(JSON.stringify(competitorsDb), { status: 200 });
		}

		// POST /times/record
		if (url.endsWith('/times/record') && method === 'POST') {
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
	it('hämtar och visar tävlande i dropdown och tabell', async () => {
		render(<RegistreringStoppTid />);

		await waitFor(() => {
			expect(screen.getByText('007 — Anna')).toBeInTheDocument();
			expect(screen.getByText('123 — Bob')).toBeInTheDocument();
		});

		expect(screen.getByText('007')).toBeInTheDocument();
		expect(screen.getByText('Anna')).toBeInTheDocument();

		// Bonus: bekräfta att GET faktiskt körts
		expect(fetchSpy).toHaveBeenCalled();
	});

	it('registrerar stopptid för vald tävlande', async () => {
		render(<RegistreringStoppTid />);

		await waitFor(() => {
			expect(screen.getByText('007 — Anna')).toBeInTheDocument();
		});

		// välj 123 i dropdown
		fireEvent.change(screen.getByRole('combobox'), { target: { value: '123' } });

		fireEvent.click(screen.getByText('Registrera stopptid nu'));

		await waitFor(() => {
			expect(screen.getByText(/Stopptid registrerad för/i)).toBeInTheDocument();
			expect(screen.getByText(/Bob \(123\)/i)).toBeInTheDocument();
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

	it('visar felmeddelande om POST misslyckas', async () => {
		// Byt bara implementationen för detta test (utan any)
		fetchSpy.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
			const url = String(input);
			const method = init?.method ?? 'GET';

			if (url.endsWith('/competitors/') && method === 'GET') {
				return new Response(JSON.stringify(competitorsDb), { status: 200 });
			}

			if (url.endsWith('/times/record') && method === 'POST') {
				return new Response(JSON.stringify({ detail: 'Not found' }), { status: 404 });
			}

			return new Response('Not found', { status: 404 });
		});

		render(<RegistreringStoppTid />);

		await waitFor(() => {
			expect(screen.getByText('007 — Anna')).toBeInTheDocument();
		});

		fireEvent.click(screen.getByText('Registrera stopptid nu'));

		await waitFor(() => {
			expect(screen.getByText('Not found')).toBeInTheDocument();
		});
	});
});
