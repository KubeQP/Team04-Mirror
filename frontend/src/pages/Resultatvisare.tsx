// frontend/src/pages/Admin.tsx
import { CrownIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { getCompetitorData } from '../api/getCompetitorData';
import { getStationData } from '../api/getStationData';
import { getTimeData } from '../api/getTimeData';
import type { CompetitorData, StationData, TimeData } from '../types';

// src/pages/Admin.tsx
export default function Resultatvisare() {
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

	function calculateTotalTime(
		startTimes: { timestamp: string | number | Date }[],
		stopTimes: { timestamp: string | number | Date }[],
	): { value: number; correct: boolean } {
		// Kräver exakt en starttid och exakt en stoptid
		if (startTimes.length !== 1 || stopTimes.length !== 1) {
			return { value: -1, correct: false };
		}

		const start = new Date(startTimes[0].timestamp);
		const stop = new Date(stopTimes[0].timestamp);

		// Ogiltiga datum eller stop före start → "-"
		if (isNaN(start.getTime()) || isNaN(stop.getTime()) || stop <= start) {
			return { value: -1, correct: false };
		}

		const diffMs = stop.getTime() - start.getTime();
		const totalSeconds = Math.floor(diffMs / 1000);

		return { value: totalSeconds, correct: true };
	}

	function formatTotalTime(totalSeconds: number) {
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;

		const formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

		return formatted;
	}

	interface ResultObject {
		Rang: number;
		Nr: string;
		Name: string;
		Total: number;
	}
	//tableArray - Competitors //flera tider för en station, ingen tid.
	const Results: ResultObject[] = [];
	const headerRow: string[] = ['Rang', 'Nr.', 'Namn', 'Totalt'];

	competitorData?.forEach((competitor) => {
		const startNumber = { value: competitor.start_number, correct: true };
		const name = { value: competitor.name, correct: true };
		const matchingStartTimes =
			timeData?.filter(
				(time) =>
					time.competitor_id === competitor.id &&
					stationData?.find((station) => station.id === time.station_id)?.order === '0',
			) || [];

		const matchingStopTimes =
			timeData?.filter(
				(time) =>
					time.competitor_id === competitor.id &&
					stationData?.find((station) => station.id === time.station_id)?.order === '1',
			) || [];

		const totalTime = calculateTotalTime(matchingStartTimes, matchingStopTimes);

		if (totalTime.value != -1) {
			const competitorRow: ResultObject = { Rang: 0, Nr: startNumber.value, Name: name.value, Total: totalTime.value };
			Results.push(competitorRow);
		}
	});

	Results.sort((a, b) => a.Total - b.Total);

	for (let i: number = 0; i < Results.length; i++) {
		Results[i].Rang = i + 1;
	}

	const tableArray: string[][] = [];
	tableArray.push(headerRow);

	Results?.forEach((ResultObject) => {
		const tempArray: string[] = [];
		tempArray.push(ResultObject.Rang.toString());
		tempArray.push(ResultObject.Nr);
		tempArray.push(ResultObject.Name);
		tempArray.push(formatTotalTime(ResultObject.Total));
		tableArray.push(tempArray);
	});
	//dynamic table creation
	function createTable(tableData: string[][]) {
		if (tableData.length === 0) return null;

		const [headerRow, ...bodyRows] = tableData;

		return (
			<ScrollArea className="rounded-md border px-4 h-[80vh]">
				<Table>
					<TableHeader>
						<TableRow>
							{headerRow.map((header, index) => (
								<TableHead key={index}>{header}</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{bodyRows.map((row, rowIndex) => (
							<TableRow key={rowIndex}>
								{row.map((cell, cellIndex) => (
									<TableCell className={cellIndex === 0 ? 'font-medium text-base' : ''} key={cellIndex}>
										{cellIndex === 0 && cell === '1' ? (
											<div className="flex items-center gap-2">
												{cell}
												<CrownIcon className="size-6 text-yellow-500" />
											</div>
										) : (
											cell
										)}
									</TableCell>
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
			<h1 className="text-xl font-bold pb-2">Resultatvisare:</h1>
			<div>
				{competitorLoading || timeLoading || stationLoading ? (
					<p>Laddar data...</p>
				) : competitorError ? (
					<p>Fel vid hämtning av tävlingsdeltagare: {competitorError}</p>
				) : timeError ? (
					<p>Fel vid hämtning av tiddata: {timeError}</p>
				) : stationError ? (
					<p>Fel vid hämtning av station data: {stationError}</p>
				) : (
					<div>{createTable(tableArray)}</div>
				)}
			</div>
		</div>
	);
}
