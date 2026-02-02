// frontend/src/pages/Admin.tsx
import { useEffect, useState } from 'react';

import { getCompetitorData } from '../api/getCompetitorData';
import { getTimeData } from '../api/getTimeData';
import type { CompetitorData, TimeData } from '../types';

// src/pages/Admin.tsx
export default function Admin() {
	//declaring constants for the imports

	const [competitorData, setCompetitorData] = useState<Array<CompetitorData> | null>(null);
	const [competitorLoading, setCompetitorLoading] = useState(true);
	const [competitorError, setCompetitorError] = useState<string | null>(null);

	const [timeData, setTimeData] = useState<Array<TimeData> | null>(null);
	const [timeLoading, setTimeLoading] = useState(true);
	const [timeError, setTimeError] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const result = await getCompetitorData();
				setCompetitorData(result);
				console.log('fetched data');
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
			}
		};

		fetchData();
	}, []);

	//Table - Stations
	let TempArray1: string[] = [];
	const Array1: string[][] = [];
	Array1.push(['Station', 'Nbr.', 'Tid']);
	competitorData?.forEach((competitor) => {
		TempArray1.push('-');
		TempArray1.push(competitor.start_number);
		TempArray1.push(timeData?.find((time) => time.competitor_id === competitor.id)?.timestamp ?? '-');
		Array1.push(TempArray1);
		TempArray1 = [];
	});

	//Table - Competitors
	let TempArray2: string[] = [];
	const Array2: string[][] = [];
	Array2.push(['Nr.', 'Namn', 'Start', 'Mål', 'Totalt']);
	competitorData?.forEach((competitor) => {
		TempArray2.push(competitor.start_number);
		TempArray2.push(competitor.name);
		TempArray2.push(timeData?.find((time) => time.competitor_id === competitor.id)?.timestamp ?? '-');
		TempArray2.push('-');
		TempArray2.push('-');
		Array2.push(TempArray2);
		TempArray2 = [];
	});

	//dynamic table creation
	function createTable(tableData: string[][]) {
		if (tableData.length === 0) return null;

		const [headerRow, ...bodyRows] = tableData;

		return (
			<table>
				<thead>
					<tr>
						{headerRow.map((header, index) => (
							<th key={index}>{header}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{bodyRows.map((row, rowIndex) => (
						<tr key={rowIndex}>
							{row.map((cell, cellIndex) => (
								<td key={cellIndex}>{cell}
								<input defaultValue={cell}/>
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		);
	}

	return (
		<div>
			<h2>Admin Sida</h2>
			<p>Välkommen till administrationssidan.</p>
			<div className="Admin-tables">
				{competitorLoading || timeLoading ? (
					<p>Laddar data...</p>
				) : competitorError ? (
					<p>Fel vid hämtning av tävlingsdeltagare: {competitorError}</p>
				) : timeError ? (
					<p>Fel vid hämtning av tiddata: {timeError}</p>
				) : (
					<div style={{ display: 'flex', gap: '20px' }}>
						{createTable(Array1)}
						{createTable(Array2)}
					</div>
				)}
			</div>
		</div>
	);
}
