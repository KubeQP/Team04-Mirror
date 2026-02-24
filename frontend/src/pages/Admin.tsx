
import { useCallback, useEffect, useState } from 'react';

import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
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

	const [resultView, setResultView] = useState<'startnummer' | 'resultat'>('startnummer');

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
					(t) => t.competitor_id === a.id && stationData?.find((s) => s.id === t.station_id)?.order === '0',
				);
				const aStop = timeData?.find(
					(t) => t.competitor_id === a.id && stationData?.find((s) => s.id === t.station_id)?.order === '1',
				);

				const bStart = timeData?.find(
					(t) => t.competitor_id === b.id && stationData?.find((s) => s.id === t.station_id)?.order === '0',
				);
				const bStop = timeData?.find(
					(t) => t.competitor_id === b.id && stationData?.find((s) => s.id === t.station_id)?.order === '1',
				);

				const aTotal =
					aStart && aStop ? new Date(aStop.timestamp).getTime() - new Date(aStart.timestamp).getTime() : Infinity;

				const bTotal =
					bStart && bStop ? new Date(bStop.timestamp).getTime() - new Date(bStart.timestamp).getTime() : Infinity;

				return aTotal - bTotal;
			})
		: [];


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
			return (
				<TableCell className={cell.correct === false ? 'bg-destructive text-destructive-foreground border' : ''}>
					{cell.value}
				</TableCell>
			);

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
							(t) => t.competitor_id === c.id && stationData?.find((s) => s.id === t.station_id)?.order === '0',
						);
						const stop = timeData?.find(
							(t) => t.competitor_id === c.id && stationData?.find((s) => s.id === t.station_id)?.order === '1',
						);
						return start && stop ? new Date(stop.timestamp).getTime() - new Date(start.timestamp).getTime() : Infinity;
					};
					return getTotal(a) - getTotal(b);
				})
		: [];

	const competitorTable: Cell[][] = [];
	const headerRow2: Cell[] = [
		{ value: 'Nr.', correct: true, mutable: false, id: 0 },
		{ value: 'Namn', correct: true, mutable: false, id: 0 },
	];
		stationData?.forEach((station) => {
			headerRow2.push({
				value: station.station_name,
				correct: true,
				mutable: false,
				id: station.id,
			});
		});
		headerRow2.push({
		value: 'Totalt',
		correct: true,
		mutable: false,
		id: 0,
		});
	competitorTable.push(headerRow2);

	competitorsToRender.forEach((competitor) => {
	const competitorRow: Cell[] = [
		{ value: competitor.start_number, correct: true, mutable: false, id: competitor.id },
		{ value: competitor.name, correct: true, mutable: false, id: competitor.id },
	];

	// Get all times for this competitor
	const allTimes =
		timeData?.filter((t) => t.competitor_id === competitor.id) || [];

	// Sort by timestamp (important for total calculation)
	const sortedTimes = [...allTimes].sort(
		(a, b) =>
		new Date(a.timestamp).getTime() -
		new Date(b.timestamp).getTime()
	);

	// 🔹 Add one column per station
	stationData?.forEach((station) => {
		const stationTimes = sortedTimes.filter(
		(t) => t.station_id === station.id
		);

		const value =
		stationTimes.map((t) => formatTime(t.timestamp)).join(', ') || '-';

		competitorRow.push({
		value,
		correct: stationTimes.length === 1, // exactly one scan = valid
		mutable: false,
		id: competitor.id,
		});
	});

  // 🔹 Calculate total from first → last station
  let totalCell: Cell = {
    value: '-',
    correct: false,
    mutable: false,
    id: competitor.id,
  };

  if (stationData && stationData.length >= 2) {
  const firstStation = stationData[0];
  const lastStation = stationData[stationData.length - 1];

  const startTimeEntry = allTimes.find((t) => t.station_id === firstStation.id);
  const endTimeEntry = allTimes.find((t) => t.station_id === lastStation.id);

  if (startTimeEntry && endTimeEntry) {
    const result = calculateTotalTime([startTimeEntry], [endTimeEntry]);
    totalCell = {
      value: result.value,
      correct: result.correct,
      mutable: false,
      id: competitor.id,
    };
  }
}


  competitorRow.push(totalCell);

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
							<div className="flex">
								<h2 className="text-lg font-semibold mb-2 flex-1">Tävlande</h2>
								<Select value={resultView} onValueChange={(view: 'resultat' | 'startnummer') => setResultView(view)}>
									<SelectTrigger className="w-full max-w-48">
										<SelectValue placeholder="Välj station" />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectLabel>Sortering</SelectLabel>
											<SelectItem key="resultat" value="resultat">
												Resultat
											</SelectItem>
											<SelectItem key="startnummer" value="startnummer">
												Startnummer
											</SelectItem>
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>
							{createTable(competitorTable)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
