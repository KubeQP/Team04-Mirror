
import { useState } from 'react';

export default function RegistreringStoppTid(){


  const [reg, setReg] = useState("");
  const [regLista, setRegLista] = useState<string[][]>([]);
  const addReg = () => {
    if (!reg.trim()) return;
    if (isNaN(Number(reg))) return;
    const regWithoutInitialZeros = reg.replace(/^0+/, '');
    const formattedReg = regWithoutInitialZeros.padStart(3, "0");

    const exists = regLista.some(r => r[0] === formattedReg);
      if (exists) {
        return;
      }


    //kommer inte behövas sen, byts ut mot tiden från databasen.
    const now = new Date();
    //const time = now.toISOString(); will be used later
    const formattedTime = now.toLocaleTimeString('sv-SE');

    setRegLista((prev) => [...prev, [formattedReg,String(formattedTime)]]);
    setReg('');
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
            <th>Stopptid</th>
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