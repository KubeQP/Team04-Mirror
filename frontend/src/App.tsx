import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';

import Navbar from './components/Navbar';
import { ThemeProvider } from './components/ThemeProvider';

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
export default function App() {
	const [competitorsVersion, setCompetitorsVersion] = useState(0);

	const notifyCompetitorAdded = () => {
		setCompetitorsVersion((v) => v + 1);
	};

	return (
		<ThemeProvider>
			<div className="max-h-screen overflow-hidden">
				<Navbar navigationData={navigationData} />

				<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<Outlet context={{ competitorsVersion, notifyCompetitorAdded }} />
				</main>
				<Toaster />
			</div>
		</ThemeProvider>
	);
}
