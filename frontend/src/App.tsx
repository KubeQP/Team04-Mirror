import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';

import ThemeToggle from './components/ThemeToggle';

export default function App() {
  const [competitorsVersion, setCompetitorsVersion] = useState(0);

  const notifyCompetitorAdded = () => {
    setCompetitorsVersion(v => v + 1);
  };

  return (
    <div id="app-container">
      <header>
        <div className="theme-button">
          <ThemeToggle />
        </div>
        <h1>Tidtagning</h1>
        <nav id="main-nav">
          <Link to="/">Startsida</Link>
          <Link to="/stationregistrering">StationRegistrering</Link>
          <Link to="/registrering">Registrering</Link>
          <Link to="/registreringstopptid">RegistreringStoppTid</Link>
          <Link to="/resultatvisare">Resultatvisare</Link>
					<Link to="/admin">Admin</Link>
        </nav>
        <hr />
      </header>

      <main>
        <Outlet context={{ competitorsVersion, notifyCompetitorAdded }} />
      </main>
    </div>
  );
}
