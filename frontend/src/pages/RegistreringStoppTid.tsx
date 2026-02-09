// src/pages/RegistreringStoppTid.tsx
import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';

import { getCompetitorData } from '../api/getCompetitorData';
import { getStationData } from '../api/getStationData';

type Competitor = {
	start_number: string;
	name: string;
};

type Station = {
	id: number;
	station_name: string;
	order: string;
};

type TimeEntryOut = {
	id?: number;
	competitor_id?: number;
	station_id?: number;
	timestamp: string;
};

type OutletCtx = {
	competitorsVersion: number;
	notifyCompetitorAdded: () => void; // finns, men används inte här
};

export default function RegistreringStoppTid() {
	const { competitorsVersion } = useOutletContext<OutletCtx>();

	const [competitors, setCompetitors] = useState<Competitor[]>([]);

	const [selectedStartNumber, setSelectedStartNumber] = useState<string>('');

	const [msg, setMsg] = useState<string>('');

	const [selectedStationId, setSelectedStationId] = useState<number | ''>('');
	const [stations, setStations] = useState<Station[]>([]);

	//Used in the search for competitors when regestering stop times. As well as the associated drop down menu. 
	const [search, setSearch] = useState("");
	const filteredComp = competitors.filter(e => e.start_number.toLowerCase().includes(search.toLowerCase()));

	const fetchData = async () => {
		try {
			const result = await getCompetitorData();
			setCompetitors(result);
			console.log('fetched comps');
		} catch (err: unknown) {
			console.log(err);
		}

		try {
			const res = await getStationData();
			setStations(res);
			console.log('fetched stations');
		} catch (err: unknown) {
			console.log(err);
		}
	};
	/*
  const fetchStations = async () => {
    const res = await fetch("http://localhost:8000/stations/getstations");
    if (!res.ok) return;
    const data: Station[] = await res.json();
    setStations(data);

    if (selectedStationId === "" && data.length > 0) {
      setSelectedStationId(data[0].id);
    }
  };

	const fetchCompetitors = async () => {
		try {
			const res = await fetch('http://localhost:8000/competitors/');
			if (!res.ok) {
				setMsg(`Kunde inte hämta tävlande (status ${res.status})`);
				return;
			}
			const data: Competitor[] = await res.json();
			setCompetitors(data);

			// Om inget valt än, välj första i listan
			if (!selectedStartNumber && data.length > 0) {
				setSelectedStartNumber(data[0].start_number);
			}

      // Om det valda startnumret inte längre finns (t.ex. reset av DB), välj första
      if (selectedStartNumber && !data.some(c => c.start_number === selectedStartNumber)) {
        setSelectedStartNumber(data[0]?.start_number ?? "");
      }
    } catch (err) {
      console.error(err);
      setMsg("Kunde inte kontakta servern för att hämta tävlande.");
    }
  };
  */

	// Hämta vid första mount
	useEffect(() => {
		fetchData();
	}, []);

	// Hämta igen när någon registrerar en ny tävlande på registreringssidan
	useEffect(() => {
		fetchData();
	}, [competitorsVersion]);

	const selectedCompetitor = useMemo(
		() => competitors.find((c) => c.start_number === selectedStartNumber),
		[competitors, selectedStartNumber],
	);

	const recordStopTimeNow = async () => {
		if (!selectedStartNumber) {
			setMsg('Välj en tävlande först.');
			return;
		}
		if (selectedStationId === '') {
			setMsg('Välj en station först.');
			return;
		}

		setMsg('Registrerar stopptid...');

		try {
			const res = await fetch('http://localhost:8000/api/times/record', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					start_number: selectedStartNumber,
					station_id: selectedStationId,
					timestamp: new Date().toISOString(),
				}),
			});

			// Läs text först så du alltid kan se fel även om backend inte skickar JSON
			const text = await res.text();

			if (!res.ok) {
				// backend kan skicka {"detail": "..."} men ibland bara text
				try {
					const maybeJson = JSON.parse(text);
					setMsg(maybeJson?.detail ?? `Fel vid registrering (status ${res.status})`);
				} catch {
					setMsg(text || `Fel vid registrering (status ${res.status})`);
				}
				return;
			}
			if (!res.ok) {
				// backend kan skicka {"detail": "..."} men ibland bara text
				try {
					const maybeJson = JSON.parse(text);
					setMsg(maybeJson?.detail ?? `Fel vid registrering (status ${res.status})`);
				} catch {
					setMsg(text || `Fel vid registrering (status ${res.status})`);
				}
				return;
			}

			// Om du vill använda svaret:
			let saved: TimeEntryOut | null = null;
			try {
				saved = JSON.parse(text);
			} catch {
				saved = null;
			}

			const who = selectedCompetitor ? `${selectedCompetitor.name} (${selectedStartNumber})` : selectedStartNumber;
			const when = saved?.timestamp
				? new Date(saved.timestamp).toLocaleTimeString('sv-SE')
				: new Date().toLocaleTimeString('sv-SE');

			setMsg(`Stopptid registrerad för ${who} kl ${when}`);
			console.log('Saved time entry:', saved);
		} catch (err) {
			console.error(err);
			setMsg('Kunde inte kontakta servern för att registrera tid.');
		}
	};

	return (
		<div>
			<h2>Registrering Stopptid</h2>

			<div style={{ display: 'flex' }}>
				<label style={selectedStationId === '' ? {} : { width: '50%', color: '#808080' }}>
					{' '}
					{selectedStationId === ''
						? 'Välj station:'
						: 'Vald station: ' + stations.find((s) => s.id === selectedStationId)?.station_name}
					&nbsp;
				</label>
				{selectedStationId === '' ? (
					<select
						value={selectedStationId}
						onChange={(e) => setSelectedStationId(Number(e.target.value))}
						disabled={stations.length === 0}
					>
						<option value="" disabled selected>
							...
						</option>
						{stations.map((c) => (
							<option key={c.id} value={c.id}>
								{c.station_name}
							</option>
						))}
					</select>
				) : (
					<div
						style={{ display: 'flex', width: '50%', alignItems: 'right', justifyContent: 'end', padding: '4px 0px' }}
					>
						<button onClick={() => setSelectedStationId('')} style={{ padding: '0px 2px' }}>
							<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24">
								<title>back_2_fill</title>
								<g id="back_2_fill" fill="none" fill-rule="nonzero">
									<path d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002-.071.035-.02.004-.014-.004-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01-.017.428.005.02.01.013.104.074.015.004.012-.004.104-.074.012-.016.004-.017-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113-.013.002-.185.093-.01.01-.003.011.018.43.005.012.008.007.201.093c.012.004.023 0 .029-.008l.004-.014-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014-.034.614c0 .012.007.02.017.024l.015-.002.201-.093.01-.008.004-.011.017-.43-.003-.012-.01-.01-.184-.092Z" />
									<path
										fill="#09244BFF"
										d="M7.16 10.972A7 7 0 0 1 19.5 15.5a1.5 1.5 0 1 0 3 0c0-5.523-4.477-10-10-10a9.973 9.973 0 0 0-7.418 3.295L4.735 6.83a1.5 1.5 0 1 0-2.954.52l1.042 5.91c.069.391.29.74.617.968.403.282.934.345 1.385.202l5.644-.996a1.5 1.5 0 1 0-.52-2.954l-2.788.491Z"
									/>
								</g>
							</svg>
						</button>
					</div>
				)}
			</div>

			<div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
				<label>
					Välj tävlande:&nbsp;
					<input
						type="text"
						placeholder="searchComp"
						value={search}
						onChange={(e)=>setSearch(e.target.value)}

					></input>
				<select
					value={selectedStartNumber}
					onChange={(e) => setSelectedStartNumber(e.target.value)}
					>
					<option value="" disabled>Välj...</option>
					{filteredComp.map((c) => (
						<option key={c.start_number} value={c.start_number.toString()}>
						{c.start_number} — {c.name}
						</option>
					))}
				</select>


				</label>

				<button type="button" onClick={recordStopTimeNow} disabled={!selectedStartNumber || !selectedStationId}>
					Registrera stopptid nu
				</button>

				<button type="button" onClick={fetchData}>
					Uppdatera lista
				</button>
			</div>

			{msg && <p style={{ marginTop: 12 }}>{msg}</p>}

			<hr />

			<h3>Alla tävlande</h3>
			<table>
				<thead>
					<tr>
						<th>Startnummer</th>
						<th>Namn</th>
					</tr>
				</thead>
				<tbody>
					{competitors.map((c) => (
						<tr key={c.start_number}>
							<td>{c.start_number}</td>
							<td>{c.name}</td>
						</tr>
					))}
				</tbody>
			</table>

			{competitors.length === 0 && <p>Inga tävlande hittades. Registrera någon först.</p>}
		</div>
	);
}
