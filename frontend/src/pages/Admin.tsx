// frontend/src/pages/Admin.tsx
import { useEffect, useState } from 'react';

import { getCompetitorData } from '../api/getCompetitorData';
import { getStationData } from '../api/getStationData';
import { getTimeData } from '../api/getTimeData';
import type { CompetitorData, StationData, TimeData } from '../types';

// src/pages/Admin.tsx
export default function Admin() {
	//declaring constants for the imports

	const [competitorData, setCompetitorData] = useState<Array<CompetitorData> | null>(null);
	const [competitorLoading, setCompetitorLoading] = useState(true);
	const [competitorError, setCompetitorError] = useState<string | null>(null);

	const [timeData, setTimeData] = useState<Array<TimeData> | null>(null);
	const [timeLoading, setTimeLoading] = useState(true);
	const [timeError, setTimeError] = useState<string | null>(null);

	const [stationData, setStationData] = useState<Array<StationData> | null>(null);
	const [stationLoading, setStationLoading] = useState(true);
	const [stationError, setStationError] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			// Competitor data
			try {
				const result = await getCompetitorData();
				setCompetitorData(result);
				console.log('Fetched competitor data');
			} catch (err: unknown) {
				if (err instanceof Error) setCompetitorError(err.message);
				else if (typeof err === 'string') setCompetitorError(err);
				else setCompetitorError('Ett okänt fel inträffade');
			} finally {
				setCompetitorLoading(false);
			}

			// Time data
			try {
				const result = await getTimeData();
				setTimeData(result);
				console.log('Fetched time data');
			} catch (err: unknown) {
				if (err instanceof Error) setTimeError(err.message);
				else if (typeof err === 'string') setTimeError(err);
				else setTimeError('Ett okänt fel inträffade');
			} finally {
				setTimeLoading(false);
			}

			// Station data
			try {
				const result = await getStationData();
				setStationData(result);
				console.log('Fetched station data');
			} catch (err: unknown) {
				if (err instanceof Error) setStationError(err.message);
				else if (typeof err === 'string') setStationError(err);
				else setStationError('Ett okänt fel inträffade');
			} finally {
				setStationLoading(false);
			}
		};

		fetchData();
	}, []);

	interface Cell {
		value: string;
		correct: boolean;
	}

	//Hjälp-funktion för att skriva tagen tid som HH:MM:SS
	function formatTime(timestamp?: string): string {
		if (!timestamp) return '-';
		return new Date(timestamp).toLocaleTimeString('sv-SE', { hour12: false });
	}

	// Hjälp-funktion räknar antal tider i en sträng
	function countTimesInString(value: string): number {
		const matches = value.match(/\b\d{2}:\d{2}:\d{2}\b/g);
		return matches ? matches.length : 0;
	}

	function calculateTotalTime(
		startTimes: { timestamp: string | number | Date }[],
		stopTimes: { timestamp: string | number | Date }[],
	): { value: string; correct: boolean } {
		// Kräver exakt en starttid och exakt en stoptid
		if (startTimes.length !== 1 || stopTimes.length !== 1) {
			return { value: '-', correct: false };
		}

		const start = new Date(startTimes[0].timestamp);
		const stop = new Date(stopTimes[0].timestamp);

		// Ogiltiga datum eller stop före start → "-"
		if (isNaN(start.getTime()) || isNaN(stop.getTime()) || stop <= start) {
			return { value: '-', correct: false };
		}

		const diffMs = stop.getTime() - start.getTime();
		const totalSeconds = Math.floor(diffMs / 1000);

		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;

		const formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

		return { value: formatted, correct: true };
	}

	//Table - Stations //fel: två tider för samma person i samma station
	const Array1: Cell[][] = [];
	const headerRow1: Cell[] = [
		{ value: 'Station', correct: true },
		{ value: 'Nr.', correct: true },
		{ value: 'Tid', correct: true },
	];
	Array1.push(headerRow1);
	timeData?.forEach((timeSlot) => {
		const stationValue: Cell = {
			value: stationData?.find((station) => station.id === timeSlot.station_id)?.station_name ?? '-',
			correct: true,
		}; //måste lägga till station //timeSlot.station_id
		const startNumber: Cell = {
			value: competitorData?.find((competitor) => competitor.id === timeSlot.competitor_id)?.start_number ?? '-',
			correct: true,
		};
		const timeStamp: Cell = { value: formatTime(timeSlot.timestamp), correct: true };

		const duplicates = timeData.filter(
			(t) =>
				t.id !== timeSlot.id &&
				(competitorData?.find((competitor) => competitor.id === t.competitor_id)?.start_number ?? '-') ===
					startNumber.value &&
				(t.station_id !== undefined ? t.station_id : '-') === timeSlot.station_id,
		);

		if (duplicates.length > 0) {
			stationValue.correct = false;
			startNumber.correct = false;
		}

		const competitorRow: Cell[] = [stationValue, startNumber, timeStamp];
		Array1.push(competitorRow);
	});

	//Table - Competitors //flera tider för en station, ingen tid.
	const Array2: Cell[][] = [];
	const headerRow2: Cell[] = [
		{ value: 'Nr.', correct: true },
		{ value: 'Namn', correct: true },
		{ value: 'Start', correct: true },
		{ value: 'Mål', correct: true },
		{ value: 'Totalt', correct: true },
	];
	Array2.push(headerRow2);
	competitorData?.forEach((competitor) => {
		const startNumber = { value: competitor.start_number, correct: true };
		const name = { value: competitor.name, correct: true };
		const matchingStartTimes =
			timeData?.filter(
				(time) =>
					time.competitor_id === competitor.id &&
					stationData?.find((station) => station.id === time.station_id)?.order === '0',
			) || [];
		const startTime = {
			// Vi mappar alla hittade tider, formaterar dem, och fogar ihop dem till en sträng
			value: matchingStartTimes.length > 0 ? matchingStartTimes.map((t) => formatTime(t.timestamp)).join(', ') : '-',
			correct: true,
		};
		const matchingStopTimes =
			timeData?.filter(
				(time) =>
					time.competitor_id === competitor.id &&
					stationData?.find((station) => station.id === time.station_id)?.order === '1',
			) || [];
		const stopTime = {
			// Vi mappar alla hittade tider, formaterar dem, och fogar ihop dem till en sträng
			value: matchingStopTimes.length > 0 ? matchingStopTimes.map((t) => formatTime(t.timestamp)).join(', ') : '-',
			correct: true,
		};
		const totalTime = calculateTotalTime(matchingStartTimes, matchingStopTimes);

		if (startTime.value === '-') startTime.correct = false;
		if (stopTime.value === '-') stopTime.correct = false;
		if (countTimesInString(startTime.value) > 1) startTime.correct = false;
		if (countTimesInString(stopTime.value) > 1) stopTime.correct = false;

		const competitorRow: Cell[] = [startNumber, name, startTime, stopTime, totalTime];
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
								<td key={cellIndex} className={cell.correct === false ? 'incorrect-cell' : ''}>
									{cell.value}{' '}
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
				{competitorLoading || timeLoading || stationLoading ? (
					<p>Laddar data...</p>
				) : competitorError ? (
					<p>Fel vid hämtning av tävlingsdeltagare: {competitorError}</p>
				) : timeError ? (
					<p>Fel vid hämtning av tiddata: {timeError}</p>
				) : stationError ? (
					<p>Fel vid hämtning av station data: {stationError}</p>
				) : (
					<div style={{ display: 'flex', gap: '20px' }}>
						<div className="Admin-wrapper">{createTable(Array1)}</div>
						<div className="Admin-wrapper">{createTable(Array2)}</div>
					</div>
				)}
			</div>
		</div>
	);
}
