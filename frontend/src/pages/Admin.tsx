// frontend/src/pages/Admin.tsx
import { useEffect, useState } from 'react';

import { getCompetitorData } from '../api/getCompetitorData';
import { getTimeData } from '../api/getTimeData';
import type { CompetitorData, TimeData } from '../types';

function formatRegisteredTime(timestamp?: string): string {
	if (!timestamp) return '-';

    const [datePart] = timestamp.split('T');
	const [, timePart] = timestamp.split('T');
	if (!timePart) return '-';

	const [h, m, s] = timePart.split(':');

	return `${datePart}, ${Number(h)}:${Number(m)}:${Number(s.split('.')[0])}`;
}

export default function Admin() {
	const [competitorData, setCompetitorData] = useState<Array<CompetitorData> | null>(null);
	const [competitorLoading, setCompetitorLoading] = useState(true);
	const [competitorError, setCompetitorError] = useState<string | null>(null);

	const [timeData, setTimeData] = useState<Array<TimeData> | null>(null);
	const [timeLoading, setTimeLoading] = useState(true);
	const [timeError, setTimeError] = useState<string | null>(null);

	// NYA STATE FÖR REDIGERBAR TABELL
	const [editableArray1, setEditableArray1] = useState<string[][]>([]);
	const [editableArray2, setEditableArray2] = useState<string[][]>([]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const result = await getCompetitorData();
				setCompetitorData(result);
			} catch (err: unknown) {
				if (err instanceof Error) setCompetitorError(err.message);
				else if (typeof err === 'string') setCompetitorError(err);
				else setCompetitorError('Ett okänt fel inträffade');
			} finally {
				setCompetitorLoading(false);
			}

			try {
				const result = await getTimeData();
				setTimeData(result);
			} catch (err: unknown) {
				if (err instanceof Error) setTimeError(err.message);
				else if (typeof err === 'string') setTimeError(err);
				else setTimeError('Ett okänt fel inträffade');
			} finally {
				setTimeLoading(false);
			}
		};

		fetchData();
	}, []);

	
	// Bygger tabellerna som string[][]
	let TempArray1: string[] = [];
	const Array1: string[][] = [];
	Array1.push(['Station', 'Nbr.', 'Tid']);
	competitorData?.forEach((competitor) => {
		TempArray1.push('-');
		TempArray1.push(competitor.start_number);
		TempArray1.push(formatRegisteredTime(timeData?.find((time) => time.competitor_id === competitor.id)?.timestamp));
		Array1.push(TempArray1);
		TempArray1 = [];
	});

	let TempArray2: string[] = [];
	const Array2: string[][] = [];
	Array2.push(['Nr.', 'Namn', 'Start', 'Mål', 'Totalt']);
	competitorData?.forEach((competitor) => {
		TempArray2.push(competitor.start_number);
		TempArray2.push(competitor.name);
		TempArray2.push(formatRegisteredTime(timeData?.find((time) => time.competitor_id === competitor.id)?.timestamp));
		TempArray2.push('-');
		TempArray2.push('-');
		Array2.push(TempArray2);
		TempArray2 = [];
	});

	// Initiera editable state när data laddas
	useEffect(() => {
		if (Array1.length > 0) setEditableArray1(Array1);
		if (Array2.length > 0) setEditableArray2(Array2);
	}, [competitorData, timeData]);

	type EditableCellProps = {
		value: string;
		onChange: (value: string) => void;
	};

	function EditableCell({ value, onChange }: EditableCellProps) {
		return (
			<td
				contentEditable
				suppressContentEditableWarning
				onBlur={e =>
					onChange(e.currentTarget.textContent ?? "")
				}
				style={{
					padding: "0.5rem",
					border: "1px solid #ddd",
					whiteSpace: "nowrap",
				}}
				>
				{value}
    		</td>
		);
	}

	
	// REDIGERBAR CREATE TABLE
	function createTable(
		tableData: string[][],
		setTableData: React.Dispatch<React.SetStateAction<string[][]>>
	) {
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
								<td key={cellIndex}>
									<EditableCell
										value = {cell}
										onChange={(newValue) =>{
											const newData = [...tableData];
											newData[rowIndex + 1][cellIndex] = newValue;
											setTableData(newData);
										}}
									/>
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
					<div style={{ display: 'flex', flexDirection: 'row', gap: '20px' }}>
						
						{createTable(editableArray1, setEditableArray1)}
						
						{createTable(editableArray2, setEditableArray2)}
						
					</div>
				)}
			</div>
            <button
                onClick={() => {
                    console.log('Sparar tabell-data...');
                    console.log('Table 1:', editableArray1);
                    console.log('Table 2:', editableArray2);
                    // TODO: här skicka editableArray1 och editableArray2 till backend?
                }}
                style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
            >
                Save
            </button>
		</div>
	);
}
