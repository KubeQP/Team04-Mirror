// src/router.tsx
import { createBrowserRouter } from 'react-router-dom';

import App from './App';
import Admin from './pages/Admin';
import Registrering from './pages/Registrering';
import RegistreringStoppTid from './pages/RegistreringStoppTid';
import Resultatvisare from './pages/Resultatvisare';
import StationRegistrering from './pages/StationRegistrering';

/*
  Detta är routerkonfigurationen för vår React-applikation. Den definierar hur
  olika sidor och komponenter ska renderas baserat på URL:en. Vi använder
  createBrowserRouter från react-router-dom för att skapa en router.
  main.tsx importerar denna router.
*/

const router = createBrowserRouter([
	{
		path: '/',
		// App är vår "layout" komponent som innehåller navigering och Outlet.
		// Outlet används för att rendera underliggande children routes.
		element: <App />,
		children: [
			{
				index: true, // path: ""
				element: <Resultatvisare />,
			},
			{
				path: 'register/station',
				element: <StationRegistrering />,
			},
			{
				path: 'register/participant',
				element: <Registrering />,
			},
			{
				path: 'register/time',
				element: <RegistreringStoppTid />,
			},
			{
				path: 'admin',
				element: <Admin />,
			},
		],
	},
]);

export default router;
