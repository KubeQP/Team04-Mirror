
import { CrownIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { getCompetitorData } from '../api/getCompetitorData';
import { getStationData } from '../api/getStationData';
import { getTimeData } from '../api/getTimeData';
import type { CompetitorData, StationData, TimeData } from '../types';

export default function Resultatvisare() {
  const [competitorData, setCompetitorData] = useState<CompetitorData[] | null>(null);
  const [competitorLoading, setCompetitorLoading] = useState(true);
  const [competitorError, setCompetitorError] = useState<string | null>(null);

  const [timeData, setTimeData] = useState<TimeData[] | null>(null);
  const [timeLoading, setTimeLoading] = useState(true);
  const [timeError, setTimeError] = useState<string | null>(null);

  const [stationData, setStationData] = useState<StationData[] | null>(null);
  const [stationLoading, setStationLoading] = useState(true);
  const [stationError, setStationError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try { setCompetitorData(await getCompetitorData()); }
      catch (err: unknown) { setCompetitorError(err instanceof Error ? err.message : typeof err === 'string' ? err : 'Okänt fel'); }
      finally { setCompetitorLoading(false); }

      try { setTimeData(await getTimeData()); }
      catch (err: unknown) { setTimeError(err instanceof Error ? err.message : typeof err === 'string' ? err : 'Okänt fel'); }
      finally { setTimeLoading(false); }

      try { setStationData(await getStationData()); }
      catch (err: unknown) { setStationError(err instanceof Error ? err.message : typeof err === 'string' ? err : 'Okänt fel'); }
      finally { setStationLoading(false); }
    };
    fetchData();
  }, []);

  function formatTotalTime(totalSeconds: number) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  }

  interface ResultObject {
    Rang: number;
    Nr: string;
    Name: string;
    Total: number;
    stationTimes: string[];
  }

  // Compute results and table only if data exists
// ==============================
// COMPUTE RESULTS + TABLE
// ==============================

let Results: ResultObject[] = [];
let tableArray: string[][] = [];

if (competitorData && timeData && stationData) {

  // Remove index 0 if that is some placeholder.
  // We assume after slice(1):
  // index 0 = Start
  // last index = Finish
  const relevantStations = stationData;

  Results = competitorData.map(competitor => {

    // Collect exactly one timestamp per station
    const allStationTimes: (Date | null)[] = relevantStations.map(station => {

      const matches = timeData.filter(td =>
        td.competitor_id === competitor.id &&
        td.station_id === station.id
      );

      // Must be exactly one timestamp
      if (matches.length !== 1) return null;

      const date = new Date(matches[0].timestamp);
      return isNaN(date.getTime()) ? null : date;
    });

    const start = allStationTimes[0];
    const finish = allStationTimes[allStationTimes.length - 1];

    // Must have valid start + finish
    if (!start || !finish) return null;

    const stationTimes: string[] = [];

    // ==================
    // START COLUMN
    // ==================
    stationTimes.push(start.toLocaleTimeString());

    // ==================
    // TID 1..N (exclude start + finish)
    // ==================
    for (let i = 1; i < allStationTimes.length - 1; i++) {
      const t = allStationTimes[i];
      stationTimes.push(t ? t.toLocaleTimeString() : '-');
    }

    // ==================
    // MÅL COLUMN
    // ==================
    stationTimes.push(finish.toLocaleTimeString());

    // ==================
    // DEL 1..N (between every station)
    // ==================
    for (let i = 1; i < allStationTimes.length; i++) {
      const prev = allStationTimes[i - 1];
      const curr = allStationTimes[i];

      if (prev && curr && curr > prev) {
        const diffSeconds =
          Math.round((curr.getTime() - prev.getTime()) / 1000);

        stationTimes.push(formatTotalTime(diffSeconds));
      } else {
        stationTimes.push('-');
      }
    }

    // ==================
    // TOTAL TIME
    // ==================
    const totalSeconds =
      Math.round((finish.getTime() - start.getTime())/ 1000);

    return {
      Rang: 0,
      Nr: competitor.start_number,
      Name: competitor.name,
      Total: totalSeconds,
      stationTimes
    };

  }).filter((r): r is ResultObject => r !== null);

  // ==================
  // SORT + RANK
  // ==================
  Results.sort((a, b) => a.Total - b.Total);
  Results.forEach((r, i) => r.Rang = i + 1);

  // ==================
  // BUILD HEADER
  // ==================

  const headerRow: string[] = [
    'Rang',
    'Nr.',
    'Namn',
    'Starttid'
  ];

  const stationCount = relevantStations.length;
  // includes start + sectors + finish

  // Tid 1..N  (exclude start + finish)
  for (let i = 1; i < stationCount - 1; i++) {
    headerRow.push(`Tidpunkt ${relevantStations[i].station_name}`);
  }

  // Mål
  headerRow.push('Måltid');

  // Del 1..N  (between each station)
  for (let i = 1; i < stationCount; i++) {
    headerRow.push(relevantStations[i].station_name);
  }

  headerRow.push('Totaltid');

  // ==================
  // BUILD TABLE ARRAY
  // ==================

  tableArray = [
    headerRow,
    ...Results.map(r => [
      r.Rang.toString(),
      r.Nr,
      r.Name,
      ...r.stationTimes,
      formatTotalTime(r.Total)
    ])
  ];
}

  function createTable(tableData: string[][]) {
    if (!tableData.length) return null;
    const [header, ...body] = tableData;
    return (
      <ScrollArea className="rounded-md border px-4 h-[80vh]">
        <Table>
          <TableHeader className="h-12">
            <TableRow>{header.map((h,i) => <TableHead key={i}>{h}</TableHead>)}</TableRow>
          </TableHeader>
          <TableBody>
            {body.map((row, ri) => (
              <TableRow key={ri}>
                {row.map((cell, ci) => (
                  <TableCell key={ci} className={ci===0?'font-medium text-base':''}>
                    {ci===0 && cell==='1' ? (
                      <div className="flex items-center gap-2">
                        {cell}<CrownIcon className="size-6 text-yellow-500"/>
                      </div>
                    ) : cell}
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