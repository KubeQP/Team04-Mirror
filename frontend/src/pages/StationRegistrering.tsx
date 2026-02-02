
import { useEffect,useState } from 'react';
import { useOutletContext } from "react-router-dom";

type Competitor = {
  start_number: string;
  name: string;
}

type OutletCtx = {
  competitorsVersion: number;
  notifyCompetitorAdded: () => void;
};

export default function Registrering(){

  const { notifyCompetitorAdded } = useOutletContext<OutletCtx>();

  const [reg, setReg] = useState("");
  const [name, setName] = useState("");
  const [competitors, setCompetitors] = useState<Competitor[]>([]);

  const fetchCompetitors = async () => {
    const res = await fetch("http://localhost:8000/competitors/");
    if (!res.ok) return;
    const data = await res.json();
    setCompetitors(data);
  };

  useEffect(() => {
    fetchCompetitors();
  }, []);


  const addReg = async () => {

    console.log("add reg");


    if (!reg.trim()) return;
    if (isNaN(Number(reg))) return;
    if (!name.trim()) return;

    const regWithoutInitialZeros = reg.replace(/^0+/, '');
    const formattedReg = regWithoutInitialZeros.padStart(3, "0");

    const exists = competitors.some(r => r.start_number === formattedReg);
      if (exists) {
        return;
      }


    //const time = new Date().toLocaleTimeString('sv-SE'); //kommer inte behövas sen, byts ut mot tiden från databasen.
    //const now = new Date();
    //const time = now.toISOString();
    //const formattedTime = now.toLocaleTimeString('sv-SE');

    
    try {
      const res = await fetch("http://localhost:8000/stations/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          start_number: formattedReg,
          name: name
        })
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Error:", err.detail);
        return;
      }
      

      const data = await res.json();
      console.log("Time registered:", data);

      // NU uppdaterar vi från databasen
      await fetchCompetitors();

      
      setReg("");
      setName("");

      notifyCompetitorAdded();
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  return (
    <div></div>
  );

}