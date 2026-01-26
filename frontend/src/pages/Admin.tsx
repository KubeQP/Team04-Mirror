// frontend/src/pages/Admin.tsx
import { useEffect, useState } from 'react';
import { getCompetitorData } from '../api/getCompetitorData';
import { getTimeData } from '../api/getTimeData';
import type { ExampleTable } from '../types';

// src/pages/Admin.tsx
export default function Admin() {
	//declaring constants for the tables

	const exampleData1 = [
		['Nr', 'Namn', 'Start', 'Mål', 'Tid', 'Totalt'],
		['1', 'AA', '-', '-', '-'],
	];
	const exampleData2 = [
		['Station', 'Nr', 'Tid'],
		['s1', '1', '-'],
	];

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
				console.log("fetched data")
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
				
				console.log(Array);
			}
		};

		fetchData();
		
	}, []);

	

	let TempArray: string[] = [];
	let Array: string[][] = [];
	Array.push(["Nr.","Namn","Start","Mål","Totalt"]);
	competitorData?.forEach((competitor) => {
		TempArray.push(competitor.start_number);
		TempArray.push(competitor.name);
		TempArray.push(timeData?.find((time) => time.competitor_id === competitor.id)?.timestamp);
		Array.push(TempArray);
		TempArray = [];
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
								<td key={cellIndex}>{cell}</td>
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
			<div className="a">
				{Array && createTable(Array)}
			</div>
		</div>
	);
}
