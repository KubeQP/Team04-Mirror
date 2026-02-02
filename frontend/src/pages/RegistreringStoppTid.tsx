// src/pages/RegistreringStoppTid.tsx
import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

import { getCompetitorData } from "../api/getCompetitorData";
import { getStationData } from "../api/getStationData";

type Competitor = {
  start_number: string;
  name: string;
};

type Station = {
  id: number;
  station_name: string;
  order: string;
}


type TimeEntryOut = {
  id?: number;
  competitor_id?: number;
  station_id?: number;
  timestamp: string;
};

type OutletCtx = {
  competitorsVersion: number;
  notifyCompetitorAdded: () => void; // finns, men används inte här
};


export default function RegistreringStoppTid() {
  const { competitorsVersion } = useOutletContext<OutletCtx>();

  const [competitors, setCompetitors] = useState<Competitor[]>([]);

  const [selectedStartNumber, setSelectedStartNumber] = useState<string>("");

  const [msg, setMsg] = useState<string>("");

  const [selectedStationId, setSelectedStationId] = useState<number | "">("");
  const [stations, setStations] = useState<Station[]>([]);

const fetchData = async () => {
    try {
      const result = await getCompetitorData();
      setCompetitors(result);
      console.log('fetched comps');
    } catch (err: unknown) {
      console.log(err);
    }


    try{
      const res = await getStationData();
      setStations(res);
      console.log('fetched stations')
    } catch (err: unknown){
      console.log(err);
    }
  };
/*
  const fetchStations = async () => {
    const res = await fetch("http://localhost:8000/stations/getstations");
    if (!res.ok) return;
    const data: Station[] = await res.json();
    setStations(data);

    if (selectedStationId === "" && data.length > 0) {
      setSelectedStationId(data[0].id);
    }
  };

  const fetchCompetitors = async () => {
    try {
      const res = await fetch("http://localhost:8000/competitors/");
      if (!res.ok) {
        setMsg(`Kunde inte hämta tävlande (status ${res.status})`);
        return;
      }
      const data: Competitor[] = await res.json();
      setCompetitors(data);

      // Om inget valt än, välj första i listan
      if (!selectedStartNumber && data.length > 0) {
        setSelectedStartNumber(data[0].start_number);
      }

      // Om det valda startnumret inte längre finns (t.ex. reset av DB), välj första
      if (selectedStartNumber && !data.some(c => c.start_number === selectedStartNumber)) {
        setSelectedStartNumber(data[0]?.start_number ?? "");
      }
    } catch (err) {
      console.error(err);
      setMsg("Kunde inte kontakta servern för att hämta tävlande.");
    }
  };
  */

  // Hämta vid första mount
  useEffect(() => {
    fetchData();
  }, []);

  // Hämta igen när någon registrerar en ny tävlande på registreringssidan
  useEffect(() => {
    fetchData();
  }, [competitorsVersion]);


  const selectedCompetitor = useMemo(
    () => competitors.find(c => c.start_number === selectedStartNumber),
    [competitors, selectedStartNumber]
  );

  const recordStopTimeNow = async () => {
    if (!selectedStartNumber) {
      setMsg("Välj en tävlande först.");
      return;
    }
    if (selectedStationId === "") {
      setMsg("Välj en station först.");
      return;
    }

    setMsg("Registrerar stopptid...");

    try {
      const res = await fetch("http://localhost:8000/times/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_number: selectedStartNumber,
          station_id: selectedStationId,
          timestamp: new Date().toISOString(),
        }),
      });

      // Läs text först så du alltid kan se fel även om backend inte skickar JSON
      const text = await res.text();

      if (!res.ok) {
        // backend kan skicka {"detail": "..."} men ibland bara text
        try {
          const maybeJson = JSON.parse(text);
          setMsg(maybeJson?.detail ?? `Fel vid registrering (status ${res.status})`);
        } catch {
          setMsg(text || `Fel vid registrering (status ${res.status})`);
        }
        return;
      }

      // Om du vill använda svaret:
      let saved: TimeEntryOut | null = null;
      try {
        saved = JSON.parse(text);
      } catch {
        saved = null;
      }

      const who = selectedCompetitor ? `${selectedCompetitor.name} (${selectedStartNumber})` : selectedStartNumber;
      const when = saved?.timestamp ? new Date(saved.timestamp).toLocaleTimeString("sv-SE") : new Date().toLocaleTimeString("sv-SE");

      setMsg(`Stopptid registrerad för ${who} kl ${when}`);
      console.log("Saved time entry:", saved);
    } catch (err) {
      console.error(err);
      setMsg("Kunde inte kontakta servern för att registrera tid.");
    }
  };

  return (
    <div>
      <h2>Registrering Stopptid</h2>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <label>
          Välj tävlande:&nbsp;
          <select
            value={selectedStartNumber}
            onChange={(e) => setSelectedStartNumber(e.target.value)}
            disabled={competitors.length === 0}
          >
            {competitors.map((c) => (
              <option key={c.start_number} value={c.start_number}>
                {c.start_number} — {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Välj station:&nbsp;
          <select
            value={selectedStationId}
            onChange={(e) => setSelectedStationId(Number(e.target.value))}
            disabled={stations.length === 0}
          >
            {stations.map((c) => (
              <option key={c.id} value={c.id}>
                {c.station_name}
              </option>
            ))}
          </select>
        </label>

        <button type="button" onClick={recordStopTimeNow} disabled={!selectedStartNumber}>
          Registrera stopptid nu
        </button>

        <button type="button" onClick={fetchData}>
          Uppdatera lista
        </button>
      </div>

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}

      <hr />

      <h3>Alla tävlande</h3>
      <table>
        <thead>
          <tr>
            <th>Startnummer</th>
            <th>Namn</th>
          </tr>
        </thead>
        <tbody>
          {competitors.map((c) => (
            <tr key={c.start_number}>
              <td>{c.start_number}</td>
              <td>{c.name}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {competitors.length === 0 && <p>Inga tävlande hittades. Registrera någon först.</p>}
    </div>
  );
}