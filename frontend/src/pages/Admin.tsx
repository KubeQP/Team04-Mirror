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


export default function Admin() {
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
	//// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [resultView] = useState<'startnummer' | 'resultat'>('startnummer');


	// Fetch data
	const fetchData = async () => {
		try {
			const competitors = await getCompetitorData();
			setCompetitorData(competitors);
			console.log('Fetched competitor data');
		} catch (err: unknown) {
			if (err instanceof Error) setCompetitorError(err.message);
			else if (typeof err === 'string') setCompetitorError(err);
			else setCompetitorError('Ett okänt fel inträffade');
		} finally {
			setCompetitorLoading(false);
		}
		
		try {
			const times = await getTimeData();
			setTimeData(times);
			console.log('Fetched time data');
		} catch (err: unknown) {
			if (err instanceof Error) setTimeError(err.message);
			else if (typeof err === 'string') setTimeError(err);
			else setTimeError('Ett okänt fel inträffade');
		} finally {
			setTimeLoading(false);
		}
		
		try {
			const stations = await getStationData();
			setStationData(stations);
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
	// Hjälpfunktioner
	function formatTime(timestamp?: string): string {
		if (!timestamp) return '-';
		return new Date(timestamp).toLocaleTimeString('sv-SE', { hour12: false });
	}

	const competitorsByResult = competitorData
		? [...competitorData].sort((a, b) => {
				const aStart = timeData?.find(
					(t) =>
						t.competitor_id === a.id &&
						stationData?.find((s) => s.id === t.station_id)?.order === '0',
				);
				const aStop = timeData?.find(
					(t) =>
						t.competitor_id === a.id &&
						stationData?.find((s) => s.id === t.station_id)?.order === '1',
				);

				const bStart = timeData?.find(
					(t) =>
						t.competitor_id === b.id &&
						stationData?.find((s) => s.id === t.station_id)?.order === '0',
				);
				const bStop = timeData?.find(
					(t) =>
						t.competitor_id === b.id &&
						stationData?.find((s) => s.id === t.station_id)?.order === '1',
				);

				const aTotal =
					aStart && aStop
						? new Date(aStop.timestamp).getTime() -
						  new Date(aStart.timestamp).getTime()
						: Infinity;

				const bTotal =
					bStart && bStop
						? new Date(bStop.timestamp).getTime() -
						  new Date(bStart.timestamp).getTime()
						: Infinity;

				return aTotal - bTotal;
		  })
		: [];


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


	// Redigerbar cell
	function EditableCell({ cell, rowIndex, cellIndex }: { cell: Cell; rowIndex: number; cellIndex: number }) {
		const [value, setValue] = useState(cell.value);

		useEffect(() => setValue(cell.value), [cell.value]);

		if (!cell.mutable)
			return <TableCell className={cell.correct === false ? 'bg-destructive text-destructive-foreground border' : ''}>{cell.value}</TableCell>;

		return (
			<TableCell className={cell.correct === false ? 'bg-destructive text-destructive-foreground border' : ''}>
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

	// Uppdatera cell
	async function handleCellUpdate(rowIndex: number, cellIndex: number, newValue: string) {
		setStationTable((prev) => {
			const updated = [...prev];
			updated[rowIndex + 1][cellIndex] = { ...updated[rowIndex + 1][cellIndex], value: newValue };
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


	// Bygg stationstabell
	useEffect(() => {
		if (!timeData || !stationData || !competitorData) return;

		const table: Cell[][] = [];
		table.push([
			{ value: 'Station', correct: true, mutable: false, id: 0 },
			{ value: 'Nr.', correct: true, mutable: false, id: 0 },
			{ value: 'Tid', correct: true, mutable: false, id: 0 },
		]);

		timeData.forEach((timeSlot) => {
			const station = stationData.find((s) => s.id === timeSlot.station_id);
			const competitor = competitorData.find((c) => c.id === timeSlot.competitor_id);

			table.push([
				{ value: station?.station_name ?? '-', correct: true, mutable: false, id: station?.id ?? 0 },
				{ value: competitor?.start_number ?? '-', correct: true, mutable: true, id: timeSlot.id },
				{ value: formatTime(timeSlot.timestamp), correct: true, mutable: false, id: timeSlot.id },
			]);
		});

		setStationTable(validateStationDuplicates(table));
	}, [timeData, stationData, competitorData, validateStationDuplicates]);

	// Bygg tävlandetable
	const competitorsToRender: CompetitorData[] = competitorData
  		? resultView === 'startnummer'
    		? [...competitorData].sort((a, b) => Number(a.start_number) - Number(b.start_number))
    		: competitorsByResult.sort((a, b) => {
				const getTotal = (c: CompetitorData) => {
					const start = timeData?.find(
						(t) =>
						t.competitor_id === c.id &&
						stationData?.find((s) => s.id === t.station_id)?.order === '0'
					);
					const stop = timeData?.find(
						(t) =>
						t.competitor_id === c.id &&
						stationData?.find((s) => s.id === t.station_id)?.order === '1'
					);
					return start && stop
						? new Date(stop.timestamp).getTime() - new Date(start.timestamp).getTime()
						: Infinity;
					};
				return getTotal(a) - getTotal(b);
      })
  : [];


	const competitorTable: Cell[][] = [];
	const headerRow2: Cell[] = [
		{ value: 'Nr.', correct: true, mutable: false, id: 0 },
		{ value: 'Namn', correct: true, mutable: false, id: 0 },
		{ value: 'Start', correct: true, mutable: false, id: 0 },
		{ value: 'Mål', correct: true, mutable: false, id: 0 },
		{ value: 'Totalt', correct: true, mutable: false, id: 0 },
	];
	competitorTable.push(headerRow2);

	competitorsToRender.forEach((competitor) => {
		const startTimes = timeData?.filter(
			(t) => t.competitor_id === competitor.id && stationData?.find((s) => s.id === t.station_id)?.order === '0',
		) || [];
		const stopTimes = timeData?.filter(
			(t) => t.competitor_id === competitor.id && stationData?.find((s) => s.id === t.station_id)?.order === '1',
		) || [];

		const startTime = { value: startTimes.map((t) => formatTime(t.timestamp)).join(', ') || '-', correct: true, mutable: false, id: competitor.id };
		const stopTime = { value: stopTimes.map((t) => formatTime(t.timestamp)).join(', ') || '-', correct: true, mutable: false, id: competitor.id };
		const totalTimeRaw = calculateTotalTime(startTimes, stopTimes);

		const totalTime: Cell = {
			value: totalTimeRaw.value,
			correct: totalTimeRaw.correct,
			mutable: false,
			id: competitor.id,
		};


		if (startTime.value === '-' || countTimesInString(startTime.value) > 1) startTime.correct = false;
		if (stopTime.value === '-' || countTimesInString(stopTime.value) > 1) stopTime.correct = false;

		if (countTimesInString(startTime.value) > 1) startTime.correct = false;
		if (countTimesInString(stopTime.value) > 1) stopTime.correct = false;

		const competitorRow: Cell[] = [
			{ value: competitor.start_number, correct: true, mutable: false, id: competitor.id },
			{ value: competitor.name, correct: true, mutable: false, id: competitor.id },
			startTime,
			stopTime, 
			totalTime,
		];
		competitorTable.push(competitorRow);

	});

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
