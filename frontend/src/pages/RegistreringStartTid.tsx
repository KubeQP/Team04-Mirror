
import { useState } from 'react';

export default function RegisteringStartTid(){


  const [reg, setReg] = useState("");
  const [regLista, setRegLista] = useState<string[][]>([]);
  const addReg = async () => {
    if (!reg.trim()) return;
    if (isNaN(Number(reg))) return;
    const regWithoutInitialZeros = reg.replace(/^0+/, '');
    const formattedReg = regWithoutInitialZeros.padStart(3, "0");

    const exists = regLista.some(r => r[0] === formattedReg);
      if (exists) {
        return;
      }


    const time = new Date().toLocaleTimeString('sv-SE'); //kommer inte behövas sen, byts ut mot tiden från databasen.
    setRegLista((prev) => [...prev, [formattedReg,String(time)]]);
    setReg('');

    
    try {
      const res = await fetch("http://localhost:5173/competitor/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          start_number: formattedReg,
          timestamp: time
        })
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Error:", err.detail);
        return;
      }

      const data = await res.json();
      console.log("Time registered:", data);

    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  return (
    <div>
			<h2>Registrering:</h2>
			<input id="startNbrInput" value={reg} onChange= { (e) => setReg(e.target.value)} type="text" placeholder="Skriv startnummer här" />
      <button onClick={addReg} disabled={!reg}>Registrera</button>
      <table>
        <thead>
          <tr>
            <th>Startnummer</th>
            <th>Starttid</th>
          </tr>
        </thead>
        <tbody>
          {regLista.map((row, index) => (
            <tr key={index}>
              <td>{row[0]}</td>
              <td>{row[1]}</td>
            </tr>
          ))}
        </tbody>
      </table>

		</div>
  );

}