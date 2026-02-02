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

	interface Cell {
		value: string
		correct: boolean
	}

	//Hjälp-funktion för att skriva tagen tid som HH:MM:SS
	function formatTime(timestamp?: string): string {
		if (!timestamp) return "-";
	return new Date(timestamp).toLocaleTimeString("sv-SE", { hour12: false });
	}
	const formatDuration = (ms: number): string => {
		if (ms < 0) return "00:00.00";

		const totalSeconds = Math.floor(ms / 1000);
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		
		// Vi tar resten av millisekunderna och delar med 10 för att få hundradelar (0-99)
		const centiseconds = Math.floor((ms % 1000) / 10);

		return `${minutes.toString().padStart(2, '0')}:${seconds
			.toString()
			.padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
		};

	// Hjälp-funktion räknar antal tider i en sträng	
	function countTimesInString(value: string): number {
		const matches = value.match(/\b\d{2}:\d{2}:\d{2}\b/g);
		return matches ? matches.length : 0;
	}

	const calculateTotalTime = (startTimes: any[], stopTimes: any[]): Cell => {
	// Kontrollera om det finns exakt ett värde i varje
	if (startTimes.length === 1 && stopTimes.length === 1) {
		const start = startTimes[0].timestamp;
		const stop = stopTimes[0].timestamp;

		// Här kan du lägga till din faktiska tidsuträkning (t.ex. stop - start)
		// Jag använder en placeholder-funktion 'formatDuration' här
		return {
		value: formatDuration(stop - start), 
		correct: true
		};
	}

	// Om det finns 0 eller fler än 1 värde
	return { 
		value: '-', 
		correct: startTimes.length === 0 && stopTimes.length === 0 // Sant om tom, falskt om för många
	};
	};


	//Table - Stations //fel: två tider för samma person i samma station
	const Array1: Cell[][] = [];
	const headerRow1: Cell[] = [
		{ value: "Station", correct: true },
		{ value: "Nr.", correct: true },
		{ value: "Tid", correct: true }
	];
	Array1.push(headerRow1);
	timeData?.forEach((timeSlot) => {
		const stationValue: Cell = {value: timeSlot.station_id !== undefined ? timeSlot.station_id.toString() : "-", correct: true}; //måste lägga till station //timeSlot.station_id
  		const startNumber: Cell = {value: competitorData?.find(competitor => competitor.id === timeSlot.competitor_id)?.start_number ?? '-', correct: true};
  		const timeStamp: Cell = {value: formatTime(timeSlot.timestamp),correct: true};


		const duplicates = timeData.filter(
			(t) => t.id !== timeSlot.id 
				&& (competitorData?.find(competitor => competitor.id === t.competitor_id)?.start_number ?? '-') === startNumber.value
				&& (t.station_id !== undefined ? t.station_id.toString() : "-") === stationValue.value
		);

		if (duplicates.length > 0) {
			stationValue.correct = false;
			startNumber.correct = false;
		}

		const competitorRow: Cell[] = [
			stationValue,
			startNumber,
			timeStamp
		]
		Array1.push(competitorRow);

	});

	//Table - Competitors //flera tider för en station, ingen tid.
	const Array2: Cell[][] = [];
	const headerRow2: Cell[] = [
		{value: "Nr.", correct: true},
		{value: "Namn", correct: true},
		{value: "Start", correct: true},
		{value: "Mål", correct: true},
		{value: "Totalt", correct: true}
	]
	Array2.push(headerRow2);
	competitorData?.forEach((competitor) => {

		const startNumber = {value: competitor.start_number, correct: true}
		const name = {value: competitor.name, correct: true}
		const matchingStartTimes = timeData?.filter((time) => time.competitor_id === competitor.id && time.station_id === 0) || [];
		const startTime = {
		// Vi mappar alla hittade tider, formaterar dem, och fogar ihop dem till en sträng
		value: matchingStartTimes.length > 0 
			? matchingStartTimes.map(t => formatTime(t.timestamp)).join(', ') 
			: '-', 
		correct: true 
		};
		const matchingStopTimes = timeData?.filter((time) => time.competitor_id === competitor.id && time.station_id === 1) || [];
		const stopTime = {
		// Vi mappar alla hittade tider, formaterar dem, och fogar ihop dem till en sträng
		value: matchingStopTimes.length > 0 
			? matchingStopTimes.map(t => formatTime(t.timestamp)).join(', ') 
			: '-', 
		correct: true 
		};
		const totalTime = calculateTotalTime(matchingStartTimes, matchingStopTimes)
		
		if (startTime.value === '-') 
			startTime.correct = false
		if (stopTime.value === '-') 
			stopTime.correct = false
		if (countTimesInString(startTime.value) > 1) 
  			startTime.correct = false;
		if (countTimesInString(stopTime.value) > 1) 
  			stopTime.correct = false;



		const competitorRow: Cell[] = [
			startNumber,
			name,
			startTime,
			stopTime,
			totalTime
		]
		Array2.push(competitorRow);
	});

	//dynamic table creation
	function createTable(tableData: Cell[][]) {
		if (tableData.length === 0) return null;

		const [headerRow, ...bodyRows] = tableData;

		return (
			<table>
				<thead>
					<tr>
						{headerRow.map((header, index) => (
							<th key={index}>{header.value}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{bodyRows.map((row, rowIndex) => (
						<tr key={rowIndex}>
							{row.map((cell, cellIndex) => (
								<td key={cellIndex} style={{backgroundColor: cell.correct === false ? 'red' : undefined}}>{cell.value} </td>
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
