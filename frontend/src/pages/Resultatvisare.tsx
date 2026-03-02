import { CrownIcon } from 'lucide-react';
import { type JSX, useCallback, useEffect, useState } from 'react';

import { useCompetition } from '@/components/Competition';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { getCompetitorData } from '../api/getCompetitorData';
import { getStationData } from '../api/getStationData';
import { getTimeData } from '../api/getTimeData';
import type { CompetitorData, StationData, TimeData } from '../types';

export default function Resultatvisare() {
	//declaring constants for the imports
	const { competition } = useCompetition();

	const [competitorData, setCompetitorData] = useState<Array<CompetitorData> | null>(null);
	const [competitorLoading, setCompetitorLoading] = useState(true);
	const [competitorError, setCompetitorError] = useState<string | null>(null);

	const [timeData, setTimeData] = useState<TimeData[] | null>(null);
	const [timeLoading, setTimeLoading] = useState(true);
	const [timeError, setTimeError] = useState<string | null>(null);

	const [stationData, setStationData] = useState<StationData[] | null>(null);
	const [stationLoading, setStationLoading] = useState(true);
	const [stationError, setStationError] = useState<string | null>(null);

	const fetchData = useCallback(async () => {
		// Competitor data
		try {
			const result = await getCompetitorData();
			setCompetitorData(result.filter((c) => c.competition_id === competition));
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
			setTimeData(result.filter((c) => c.competition_id === competition));
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
			setStationData(result.filter((c) => c.competition_id === competition));
			console.log('Fetched station data');
		} catch (err: unknown) {
			if (err instanceof Error) setStationError(err.message);
			else if (typeof err === 'string') setStationError(err);
			else setStationError('Ett okänt fel inträffade');
		} finally {
			setStationLoading(false);
		}
	}, [competition]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				setCompetitorData(await getCompetitorData());
			} catch (err: unknown) {
				setCompetitorError(err instanceof Error ? err.message : typeof err === 'string' ? err : 'Okänt fel');
			} finally {
				setCompetitorLoading(false);
			}

			try {
				setTimeData(await getTimeData());
			} catch (err: unknown) {
				setTimeError(err instanceof Error ? err.message : typeof err === 'string' ? err : 'Okänt fel');
			} finally {
				setTimeLoading(false);
			}

			try {
				setStationData(await getStationData());
			} catch (err: unknown) {
				setStationError(err instanceof Error ? err.message : typeof err === 'string' ? err : 'Okänt fel');
			} finally {
				setStationLoading(false);
			}
		};
		fetchData();
	}, [fetchData]);

	function formatTotalTime(totalSeconds: number) {
		const h = Math.floor(totalSeconds / 3600);
		const m = Math.floor((totalSeconds % 3600) / 60);
		const s = totalSeconds % 60;
		return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
	}

	interface ResultObject {
		Rang: number;
		Nr: string;
		Name: string;
		Total: number;
		stationTimes: (JSX.Element | string)[];
	}

	let Results: ResultObject[] = [];
	let tableArray: (string | JSX.Element)[][] = [];

	if (competitorData && timeData && stationData) {
		const relevantStations = stationData;

		Results = competitorData
			.map((competitor) => {
				// Collect exactly one timestamp per station
				const allStationTimes: (Date | null)[] = relevantStations.map((station) => {
					const matches = timeData.filter((td) => td.competitor_id === competitor.id && td.station_id === station.id);

					// Must be exactly one timestamp
					if (matches.length !== 1) return null;

					const date = new Date(matches[0].timestamp);
					return isNaN(date.getTime()) ? null : date;
				});

				const start = allStationTimes[0];
				const finish = allStationTimes[allStationTimes.length - 1] || null;

				for (let i = 1; i < allStationTimes.length; i++) {
					const prev = allStationTimes[i - 1];
					const curr = allStationTimes[i];

					if (prev && curr && curr < prev) {
						return null;
					}
				}

				// Must have valid start + finish
				if (!start) return null;

				const stationTimes: (JSX.Element | string)[] = [];

				for (let i = 0; i < allStationTimes.length; i++) {
					const curr = allStationTimes[i];
					const prev = i > 0 ? allStationTimes[i - 1] : null;

					if (!curr) {
						stationTimes.push('-');
						continue;
					}

					const timeString = curr.toLocaleTimeString();

					if (i === 0) {
						stationTimes.push(timeString);
						continue;
					}

					if (prev && curr > prev) {
						const diffSeconds = Math.round((curr.getTime() - prev.getTime()) / 1000);

						stationTimes.push(
							<div className="flex flex-col">
								<span>{timeString}</span>
								<span className="text-xs text-muted-foreground">+{formatTotalTime(diffSeconds)}</span>
							</div>,
						);
					} else {
						stationTimes.push(timeString);
					}
				}
				const totalSeconds = finish ? Math.round((finish.getTime() - start.getTime()) / 1000) : -1;

				return {
					Rang: 0,
					Nr: competitor.start_number,
					Name: competitor.name,
					Total: totalSeconds,
					stationTimes,
				};
			})
			.filter((r): r is ResultObject => r !== null);

		Results.sort((a, b) => {
			if (a.Total < 0) return 1;
			if (b.Total < 0) return -1;
			return a.Total - b.Total;
		});
		Results.forEach((r, i) => (r.Rang = i + 1));

		const headerRow: string[] = ['Rang', 'Nr.', 'Namn', ...relevantStations.map((s) => s.station_name), 'Totaltid'];

		tableArray = [
			headerRow,
			...Results.map((r) => [
				r.Rang.toString(),
				r.Nr,
				r.Name,
				...r.stationTimes,
				r.Total >= 0 ? formatTotalTime(r.Total) : '-',
			]),
		];
	}

	function createTable(tableData: (string | JSX.Element)[][]) {
		if (!tableData.length) return null;
		const [header, ...body] = tableData;
		return (
			<ScrollArea className="rounded-md border px-4 h-[80vh]">
				<Table>
					<TableHeader className="h-12">
						<TableRow>
							{header.map((h, i) => (
								<TableHead key={i}>{h}</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{body.map((row, ri) => (
							<TableRow key={ri}>
								{row.map((cell, ci) => (
									<TableCell key={ci} className={ci === 0 ? 'font-medium text-base' : ''}>
										{ci === 0 && cell === '1' ? (
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
