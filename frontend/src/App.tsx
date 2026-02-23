import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';

import Navbar from './components/Navbar';
import { ThemeProvider } from './components/ThemeProvider';

import { getCompetitionData } from './api/getCompetitionData';
import { createCompetition } from './api/postCompetitionData';
import { API_BASE_URL } from './config/api';
import type { CompetitionData } from './types';
import { useCompetition } from './components/Competition';

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
		title: 'Stopptid',
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

	const fetchData = async () => {
		// Competition data
		try {
			const result = await getCompetitionData();
			setCompetitionData(result);

			if (result.length > 0) {
				handleSelectCompetition(result[0].id);
			}
			console.log('Fetched competition data');
		} catch (err: unknown) {
			if (err instanceof Error) setCompetitionError(err.message);
			else if (typeof err === 'string') setCompetitionError(err);
			else setCompetitionError('Ett okänt fel inträffade');
		} finally {
			setCompetitionLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	const handleAddCompetition = async () => {
		try {
			const newCompetition = await createCompetition();
			setCompetitionData([...competitions, newCompetition]);

			// Välj den nya tävlingen automatiskt
			handleSelectCompetition(newCompetition.id);

			// Skapa start och mål-stationer
			await Promise.all(
				[{ station_name: 'start', order: 0 }, { station_name: 'mål', order: 1 }].map((station) =>
					fetch(`${API_BASE_URL}/api/stations/registerstation`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ ...station, competition_id: newCompetition.id }),
					})
				)
				);

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

// I din App.tsx, uppdatera handleRemoveCompetition:

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
				setSelectedCompetition(0);
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

	const handleSelectCompetition = (id: number) => {
		setSelectedCompetition(id);
		console.log('Valde tävling med ID:', id);
		setCompetition(id);
		localStorage.setItem("competition", competition.toString())
	};

	return (
		<ThemeProvider>
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
					<Outlet context={{ competitorsVersion, notifyCompetitorAdded }} />
				</main>
				<Toaster />
			</div>
		</ThemeProvider>
	);
}