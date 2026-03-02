import { useCallback, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';

import { getCompetitionData } from './api/getCompetitionData';
import { createCompetition } from './api/postCompetitionData';
import { useCompetition } from './components/Competition';
import Navbar from './components/Navbar';
import { ThemeProvider } from './components/ThemeProvider';
import { TooltipProvider } from './components/ui/tooltip';
import { API_BASE_URL } from './config/api';
import type { CompetitionData } from './types';

const navigationData = [
	{
		title: 'Startsida',
		href: '/',
	},
	{
		title: 'Stationshantering',
		href: '/register/station',
	},
	{
		title: 'Registrera',
		href: '/register/participant',
	},
	{
		title: 'Tidsregistrering',
		href: '/register/time',
	},
	{
		title: 'Admin',
		href: '/admin',
	},
];

//export let competition: number = 0;

export default function App() {
	const { competition, setCompetition } = useCompetition();
	const [competitorsVersion, setCompetitorsVersion] = useState(0);

	const notifyCompetitorAdded = () => {
		setCompetitorsVersion((v) => v + 1);
	};

	// Competition state
	const [competitions, setCompetitionData] = useState<Array<CompetitionData>>([]);
	const [competitionLoading, setCompetitionLoading] = useState(true);
	const [competitionError, setCompetitionError] = useState<string | null>(null);
	const [selectedCompetition, setSelectedCompetition] = useState<number | null>(null);

	const handleSelectCompetition = useCallback(
		(id: number) => {
			setSelectedCompetition(id);
			localStorage.setItem('selectedCompetition', id.toString());
			console.log('Valde tävling med ID:', id);
			setCompetition(id);
			localStorage.setItem('competition', competition.toString());
		},
		[competition, setCompetition],
	);

	const fetchData = useCallback(async () => {
		// Competition data
		try {
			const result = await getCompetitionData();
			setCompetitionData(result);

			if (result.length > 0) {
				handleSelectCompetition(Number(localStorage.getItem('selectedCompetition') ?? result[0].id));
			}
			console.log('Fetched competition data');
		} catch (err: unknown) {
			if (err instanceof Error) setCompetitionError(err.message);
			else if (typeof err === 'string') setCompetitionError(err);
			else setCompetitionError('Ett okänt fel inträffade');
		} finally {
			setCompetitionLoading(false);
		}
	}, [handleSelectCompetition]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const handleAddCompetition = async () => {
		try {
			const newCompetition = await createCompetition();
			setCompetitionData([...competitions, newCompetition]);

			// Välj den nya tävlingen automatiskt
			handleSelectCompetition(newCompetition.id);
		} catch (err: unknown) {
			if (err instanceof Error) {
				console.error('Fel vid skapande av tävling:', err.message);
				alert(`Kunde inte skapa tävling: ${err.message}`);
			} else {
				console.error('Okänt fel vid skapande av tävling');
				alert('Ett okänt fel inträffade');
			}
		}
	};

	const handleRemoveCompetition = async (id: number) => {
		try {
			const response = await fetch(`${API_BASE_URL}/api/competitions/${id}`, {
				method: 'DELETE',
			});

			if (!response.ok) {
				throw new Error('Failed to delete competition');
			}

			// Ta bort från state
			setCompetitionData(competitions.filter((c) => c.id !== id));

			// Om den borttagna tävlingen var vald, återställ till 0
			if (selectedCompetition === id) {
				const minId = competitions.reduce((min, c) => (c.id < min ? c.id : min), Infinity);
				handleSelectCompetition(minId);
			}

			console.log('Tog bort tävling med ID:', id);
		} catch (err: unknown) {
			if (err instanceof Error) {
				console.error('Fel vid borttagning:', err.message);
				alert(`Kunde inte ta bort tävling: ${err.message}`);
			} else {
				console.error('Okänt fel vid borttagning');
				alert('Ett okänt fel inträffade');
			}
		}
	};

	return (
		<ThemeProvider>
			<TooltipProvider>
				<div className="max-h-screen overflow-hidden">
					<Navbar
						competitions={competitions}
						selectedCompetition={selectedCompetition}
						handleAddCompetition={handleAddCompetition}
						handleRemoveCompetition={handleRemoveCompetition}
						handleSelectCompetition={handleSelectCompetition}
						navigationData={navigationData}
					/>

					<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						{competitionLoading ? (
							<div className="text-center py-20 text-gray-500">Laddar tävlingar...</div>
						) : competitionError ? (
							<div className="text-center py-20 text-red-500">Fel vid hämtning av tävlingar: {competitionError}</div>
						) : competitions.length === 0 ? (
							<div className="text-center py-20 text-gray-500">
								Inga tävlingar hittades. Lägg till en ny tävling ovan.
							</div>
						) : (
							<Outlet context={{ competitorsVersion, notifyCompetitorAdded }} />
						)}
					</main>
					<Toaster />
				</div>
			</TooltipProvider>
		</ThemeProvider>
	);
}
