
import { useState } from 'react';

export default function RegisteringStartTid(){


  const [reg, setReg] = useState("");
  const [name, setName] = useState("");
  const [regLista, setRegLista] = useState<[string, string, string][]>([]);
  const addReg = async () => {

    if (!reg.trim()) return;
    if (isNaN(Number(reg))) return;
    if (!name.trim()) return;

    const regWithoutInitialZeros = reg.replace(/^0+/, '');
    const formattedReg = regWithoutInitialZeros.padStart(3, "0");

    const exists = regLista.some(r => r[0] === formattedReg);
      if (exists) {
        return;
      }


    //const time = new Date().toLocaleTimeString('sv-SE'); //kommer inte behövas sen, byts ut mot tiden från databasen.
    const now = new Date();
    const time = now.toISOString();
    const formattedTime = now.toLocaleTimeString('sv-SE');
    setRegLista((prev) => [...prev, [formattedReg,String(formattedTime),name]]);
    setReg('');
    setName('');

    
    try {
      const res = await fetch("http://localhost:8000/competitors/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          start_number: formattedReg,
          timestamp: time,
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

    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  return (
    <div>
			<h2>Registrering:</h2>
			<input 
      id="startNbrInput" 
      value={reg} onChange= { (e) => setReg(e.target.value)} 
      type="text" 
      placeholder="Skriv startnummer här" 
      />
      <input
        id="nameInput"
        value={name}
        onChange={(e) => setName(e.target.value)}
        type="text"
        placeholder="Skriv namn här"
      />
      <button onClick={addReg} disabled={!reg}>Registrera</button>
      <table>
        <thead>
          <tr>
            <th>Startnummer</th>
            <th>Starttid</th>
            <th>Namn</th>
          </tr>
        </thead>
        <tbody>
            {regLista.map(([startNbr, time, name], index) => (
              <tr key={index}>
                <td>{startNbr}</td>
                <td>{time}</td>
                <td>{name}</td>
              </tr>
            ))}
        </tbody>
      </table>

		</div>
  );

}