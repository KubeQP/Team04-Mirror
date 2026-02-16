// frontend/src/pages/Admin.tsx
import { useCallback, useEffect, useState } from 'react';

import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { getCompetitorData } from '../api/getCompetitorData';
import { getStationData } from '../api/getStationData';
import { getTimeData } from '../api/getTimeData';
import { editTimeData } from '../api/putTimeData';
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

	const [stationTable, setStationTable] = useState<Cell[][]>([]);

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

	useEffect(() => {
		fetchData();
	}, []);

	interface Cell {
		value: string;
		correct: boolean;
		mutable: boolean;
		id: number;
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
	): { value: string; correct: boolean; mutable: false; id: 0 } {
		// Kräver exakt en starttid och exakt en stoptid
		if (startTimes.length !== 1 || stopTimes.length !== 1) {
			return { value: '-', correct: false, mutable: false, id: 0 };
		}

		const start = new Date(startTimes[0].timestamp);
		const stop = new Date(stopTimes[0].timestamp);

		// Ogiltiga datum eller stop före start → "-"
		if (isNaN(start.getTime()) || isNaN(stop.getTime()) || stop <= start) {
			return { value: '-', correct: false, mutable: false, id: 0 };
		}

		const diffMs = stop.getTime() - start.getTime();
		const totalSeconds = Math.floor(diffMs / 1000);

		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;

		const formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

		return { value: formatted, correct: true, mutable: false, id: 0 };
	}

	function EditableCell({ cell, rowIndex, cellIndex }: { cell: Cell; rowIndex: number; cellIndex: number }) {
		const [value, setValue] = useState(cell.value);

		useEffect(() => {
			setValue(cell.value);
		}, [cell.value]);

		if (!cell.mutable) {
			return (
				<TableCell className={cell.correct === false ? 'bg-destructive text-destructive-foreground' : ''}>
					{cell.value}
				</TableCell>
			);
		}

		return (
			<TableCell className={cell.correct === false ? 'bg-destructive text-destructive-foreground' : ''}>
				<Input
					value={value}
					onChange={(e) => setValue(e.target.value)}
					onBlur={() => handleCellUpdate(rowIndex, cellIndex, value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter') e.currentTarget.blur();
					}}
					className="h-8"
				/>
			</TableCell>
		);
	}

	async function handleCellUpdate(rowIndex: number, cellIndex: number, newValue: string) {
		setStationTable((prev) => {
			const updated = [...prev];
			updated[rowIndex + 1][cellIndex] = {
				...updated[rowIndex + 1][cellIndex],
				value: newValue,
			};
			const validated = validateStationDuplicates(updated);

			return validated;
		});

		const row = stationTable[rowIndex + 1];
		const timeId = row[2].id;

		const competitor = competitorData?.find((c) => c.start_number === newValue);

		if (!competitor) {
			setStationTable((prev) => {
				const updated = [...prev];
				updated[rowIndex + 1][1] = {
					...updated[rowIndex + 1][1],
					correct: false,
				};
				const validated = validateStationDuplicates(updated);

				return validated;
			});

			return;
		}

		setTimeData((prev) => prev?.map((t) => (t.id === timeId ? { ...t, competitor_id: competitor.id } : t)) ?? null);

		await editTimeData({
			id: timeId,
			competitor_id: competitor.id,
			timestamp: timeData?.find((t) => t.id === timeId)?.timestamp ?? '-',
			station_id: row[0].id,
		});
	}

	const validateStationDuplicates = useCallback((table: Cell[][]): Cell[][] => {
		const updated = table.map((row) => [...row]);

		const seen = new Map<string, number[]>();

		for (let i = 1; i < updated.length; i++) {
			const row = updated[i];

			const stationId = row[0].id;
			const startNumber = row[1].value;

			const key = `${stationId}-${startNumber}`;

			if (!seen.has(key)) {
				seen.set(key, [i]);
			} else {
				seen.get(key)?.push(i);
			}
		}

		seen.forEach((indexes) => {
			if (indexes.length > 1) {
				indexes.forEach((i) => {
					updated[i][0] = { ...updated[i][0], correct: false };
					updated[i][1] = { ...updated[i][1], correct: false };
				});
			}
		});

		return updated;
	}, []);

	useEffect(() => {
		if (!timeData || !stationData || !competitorData) return;

		const table: Cell[][] = [];

		const headerRow: Cell[] = [
			{ value: 'Station', correct: true, mutable: false, id: 0 },
			{ value: 'Nr.', correct: true, mutable: false, id: 0 },
			{ value: 'Tid', correct: true, mutable: false, id: 0 },
		];

		table.push(headerRow);

		timeData.forEach((timeSlot) => {
			const station = stationData.find((s) => s.id === timeSlot.station_id);
			const competitor = competitorData.find((c) => c.id === timeSlot.competitor_id);

			const stationCell: Cell = {
				value: station?.station_name ?? '-',
				correct: true,
				mutable: false,
				id: station?.id ?? 0,
			};

			const numberCell: Cell = {
				value: competitor?.start_number ?? '-',
				correct: true,
				mutable: true,
				id: timeSlot.id,
			};

			const timeCell: Cell = {
				value: formatTime(timeSlot.timestamp),
				correct: true,
				mutable: false,
				id: timeSlot.id,
			};

			table.push([stationCell, numberCell, timeCell]);
		});

		const validated = validateStationDuplicates(table);
		setStationTable(validated);
	}, [timeData, stationData, competitorData, validateStationDuplicates]);

	//Table - Competitors //flera tider för en station, ingen tid.
	const competitorTable: Cell[][] = [];
	const headerRow2: Cell[] = [
		{ value: 'Nr.', correct: true, mutable: false, id: 0 },
		{ value: 'Namn', correct: true, mutable: false, id: 0 },
		{ value: 'Start', correct: true, mutable: false, id: 0 },
		{ value: 'Mål', correct: true, mutable: false, id: 0 },
		{ value: 'Totalt', correct: true, mutable: false, id: 0 },
	];

	competitorTable.push(headerRow2);
	competitorData?.forEach((competitor) => {
		const startNumber = { value: competitor.start_number, correct: true, mutable: false, id: competitor.id };
		const name = { value: competitor.name, correct: true, mutable: false, id: competitor.id };
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
			mutable: false,
			id: competitor.id,
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
			mutable: false,
			id: competitor.id,
		};
		const totalTime = calculateTotalTime(matchingStartTimes, matchingStopTimes);

		if (startTime.value === '-') startTime.correct = false;
		if (stopTime.value === '-') stopTime.correct = false;
		if (countTimesInString(startTime.value) > 1) startTime.correct = false;
		if (countTimesInString(stopTime.value) > 1) stopTime.correct = false;

		const competitorRow: Cell[] = [startNumber, name, startTime, stopTime, totalTime];
		competitorTable.push(competitorRow);
	});

	//dynamic table creation

	function createTable(tableData: Cell[][]) {
		if (tableData.length === 0) return null;
		const [headerRow, ...bodyRows] = tableData;

		return (
			<ScrollArea className="h-[70vh] rounded-md border px-4">
				<Table>
					<TableHeader>
						<TableRow className="h-14">
							{headerRow.map((header, index) => (
								<TableHead key={index}>{header.value}</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{bodyRows.map((row, rowIndex) => (
							<TableRow key={rowIndex}>
								{row.map((cell, cellIndex) => (
									<EditableCell key={cellIndex} cell={cell} rowIndex={rowIndex} cellIndex={cellIndex} />
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</ScrollArea>
		);
	}

	return (
		<div>
			<h1 className="text-xl font-bold pb-4">Adminsida:</h1>
			<div>
				{competitorLoading || timeLoading || stationLoading ? (
					<p>Laddar data...</p>
				) : competitorError ? (
					<p>Fel vid hämtning av tävlingsdeltagare: {competitorError}</p>
				) : timeError ? (
					<p>Fel vid hämtning av tiddata: {timeError}</p>
				) : stationError ? (
					<p>Fel vid hämtning av stationsdata: {stationError}</p>
				) : (
					<div className="flex gap-6">
						<div className="w-1/3">
							<h2 className="text-lg font-semibold mb-2">Stationer</h2>
							{createTable(stationTable)}
						</div>
						<div className="w-2/3">
							<h2 className="text-lg font-semibold mb-2">Tävlande</h2>
							{createTable(competitorTable)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
