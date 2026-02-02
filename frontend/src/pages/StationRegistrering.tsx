import { useEffect, useState } from 'react';

type Station = {
	station_name: string;
	order: string;
};

export default function StationRegistrering() {
	const [stationName, setStationName] = useState('');
	const [order, setOrder] = useState('');
	const [stations, setStations] = useState<Station[]>([]);

	const fetchStations = async () => {
		const res = await fetch('http://localhost:8000/stations/getstations');
		if (!res.ok) return;
		const data = await res.json();
		setStations(data);
	};

	useEffect(() => {
		fetchStations();
	}, []);

	const addStation = async () => {
		console.log('add station');

		if (!stationName.trim()) return;
		if (!order.trim()) return;

		try {
			const res = await fetch('http://localhost:8000/stations/registerstation', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					station_name: stationName,
					order: order,
				}),
			});

			if (!res.ok) {
				const err = await res.json();
				console.error('Error:', err.detail);
				return;
			}

			const data = await res.json();
			console.log('Station registered:', data);

			// NU uppdaterar vi från databasen
			await fetchStations();

			setOrder('');
			setStationName('');
		} catch (err) {
			console.error('Fetch error:', err);
		}
	};

	return (
		<div>
			<h2>StationRegistrering:</h2>
			<input
				id="stationNamnInput"
				value={stationName}
				onChange={(e) => setStationName(e.target.value)}
				type="text"
				placeholder="Skriv stationsnamn här"
			/>
			<input
				id="orderInput"
				value={order}
				onChange={(e) => setOrder(e.target.value)}
				type="text"
				placeholder="Skriv ordning här"
			/>
			<button onClick={addStation} disabled={!order.trim() || !stationName.trim()}>
				Registrera Station
			</button>
			<table>
				<thead>
					<tr>
						<th>Station</th>
						<th>ordning</th>
					</tr>
				</thead>
				<tbody>
					{stations.map((c) => (
						<tr key={c.station_name}>
							<td>{c.station_name}</td>
							<td>{c.order}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
