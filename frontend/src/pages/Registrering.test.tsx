import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import RegistreringStartTid from './Registrering';

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

type Competitor = { start_number: string; name: string };

// En liten "in-memory" lista som låtsas vara backend-DB i testet
let db: Competitor[] = [];

beforeEach(() => {
	db = [];

	// Mocka fetch för både GET och POST
	vi.spyOn(global, 'fetch').mockImplementation(async (url, init) => {
		const u = String(url);

		// GET /competitors/
		if (u.endsWith('/competitors/') && (!init || init.method === undefined)) {
			return new Response(JSON.stringify(db), { status: 200 });
		}

		// POST /competitors/register
		if (u.endsWith('/competitors/register') && init?.method === 'POST') {
			const body = JSON.parse(String(init?.body ?? '{}')) as { start_number: string; name: string };

			// låtsas att backend sparar och returnerar posten
			const exists = db.some((c) => c.start_number === body.start_number);
			if (!exists) {
				db.push({ start_number: body.start_number, name: body.name });
			}

			return new Response(JSON.stringify(body), { status: 200 });
		}

		return new Response('Not found', { status: 404 });
	});

	render(<RegistreringStartTid />);
});

describe('RegisteringStartTid', () => {
	it('registrerar ett korrekt startnummer', async () => {
		// fyll startnummer
		fireEvent.change(screen.getByPlaceholderText('Skriv startnummer här'), {
			target: { value: '001' },
		});

		// fyll namn (viktigt!)
		fireEvent.change(screen.getByPlaceholderText('Skriv namn här'), {
			target: { value: 'Alice' },
		});

		fireEvent.click(screen.getByText('Registrera'));

		// Vänta på att UI uppdateras efter fetchCompetitors
		await waitFor(() => {
			expect(screen.getByText('001')).toBeInTheDocument();
		});
	});

	it('testar felaktig registrering med bokstäver', async () => {
		fireEvent.change(screen.getByPlaceholderText('Skriv startnummer här'), {
			target: { value: 'abc' },
		});
		fireEvent.change(screen.getByPlaceholderText('Skriv namn här'), {
			target: { value: 'Alice' },
		});

		fireEvent.click(screen.getByText('Registrera'));

		// Ingen POST ska ske, och inget ska dyka upp
		await waitFor(() => {
			expect(screen.queryByText('abc')).not.toBeInTheDocument();
		});
	});

	it('testar registrering med extra nollor framför', async () => {
		fireEvent.change(screen.getByPlaceholderText('Skriv startnummer här'), {
			target: { value: '000210' },
		});
		fireEvent.change(screen.getByPlaceholderText('Skriv namn här'), {
			target: { value: 'Team' },
		});

		fireEvent.click(screen.getByText('Registrera'));

		await waitFor(() => {
			expect(screen.getByText('210')).toBeInTheDocument();
		});
	});

	it('testar registrering med färre än tre siffror', async () => {
		fireEvent.change(screen.getByPlaceholderText('Skriv startnummer här'), {
			target: { value: '13' },
		});
		fireEvent.change(screen.getByPlaceholderText('Skriv namn här'), {
			target: { value: 'Team' },
		});

		fireEvent.click(screen.getByText('Registrera'));

		await waitFor(() => {
			expect(screen.getByText('013')).toBeInTheDocument();
		});
	});

	it('testar registrering med dubletter', async () => {
		for (let i = 0; i < 2; i++) {
			fireEvent.change(screen.getByPlaceholderText('Skriv startnummer här'), {
				target: { value: '011' },
			});
			fireEvent.change(screen.getByPlaceholderText('Skriv namn här'), {
				target: { value: 'Team' },
			});

			fireEvent.click(screen.getByText('Registrera'));
		}

		await waitFor(() => {
			const matches = screen.getAllByText('011');
			expect(matches.length).toBe(1);
		});
	});
});
