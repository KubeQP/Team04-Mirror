// frontend/src/pages/Sida2.tsx
import { useEffect, useState } from 'react';

import { getCompetitorData } from '../api/getCompetitorData';
import { getTimeData } from '../api/getTimeData';
import type { CompetitorData, TimeData } from '../types';

export default function Resultatvisare() {
	const [competitorData, setCompetitorData] = useState<Array<CompetitorData> | null>(null);
	const [competitorLoading, setCompetitorLoading] = useState(true);
	const [competitorError, setCompetitorError] = useState<string | null>(null);

	const [timeData, setTimeData] = useState<Array<TimeData> | null>(null);
	const [timeLoading, setTimeLoading] = useState(true);
	const [timeError, setTimeError] = useState<string | null>(null);

	const mappedData = competitorData?.map((competitor) => (
		<div key={competitor.id}>
			<h3>Name: {competitor.name}</h3>
			<h3>Start number: {competitor.start_number}</h3>
			<h3>Timestamp: {timeData?.find((time) => time.competitor_id === competitor.id)?.timestamp}</h3>
			<hr />
		</div>
	));

	useEffect(() => {
		const fetchData = async () => {
			try {
				const result = await getCompetitorData();
				setCompetitorData(result);
			} catch (err: unknown) {
				if (err instanceof Error) {
					setCompetitorError(err.message);
				} else if (typeof err === 'string') {
					setCompetitorError(err);
				} else {
					setCompetitorError('Ett okänt fel inträffade');
				}
			} finally {
				setCompetitorLoading(false);
			}

			try {
				const result = await getTimeData();
				setTimeData(result);
			} catch (err: unknown) {
				if (err instanceof Error) {
					setTimeError(err.message);
				} else if (typeof err === 'string') {
					setTimeError(err);
				} else {
					setTimeError('Ett okänt fel inträffade');
				}
			} finally {
				setTimeLoading(false);
				console.log(competitorData);
				console.log(mappedData);
			}
		};

		fetchData();
	}, [competitorData, mappedData]);

	console.log(competitorData);

	return (
		<div>
			<h2>Innehåll på Resultatvisare</h2>
			<p>
				Nedan innehåll laddas dynamiskt!{' '}
				<span className="text-muted text-semibold">*Oooh... Such wow! Much awesome!*</span>
			</p>

			<div className="card">
				{(competitorLoading || timeLoading) && <p>Laddar innehåll...</p>}
				{(competitorError || timeError) && <p style={{ color: 'red' }}>Fel: {competitorError || timeError}</p>}
				{competitorData && mappedData}
			</div>
		</div>
	);
}
