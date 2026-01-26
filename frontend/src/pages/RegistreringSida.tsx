
import { useState } from 'react';

export default function RegisteringSida(){


  const [reg, setReg] = useState("");
  const [name, setName] = useState("");
  const [regLista, setRegLista] = useState<string[][]>([]);
  const addReg = () => {
    if (!reg.trim()) return;
    if (isNaN(Number(reg))) return;
    const regWithoutInitialZeros = reg.replace(/^0+/, '');
    const formattedReg = regWithoutInitialZeros.padStart(3, "0");


    const time = new Date().toLocaleTimeString('sv-SE'); //kommer inte behövas sen, byts ut mot tiden från databasen.
    setRegLista((prev) => [...prev, [formattedReg, name,String(time)]]);
    setReg('');
    setName('');
  };

  return (
    <div>
			<h2>Registrering:</h2>
			<input id="startNbrInput" value={reg} onChange= { (e) => setReg(e.target.value)} type="text" placeholder="Skriv startnummer här" />
      <input id="startNameInput" value={name} onChange= { (e) => setName(e.target.value)} type="text" placeholder="Skriv namn här" />
      <button onClick={addReg} disabled={!reg || !name}>Registrera</button>
      <table>
        <thead>
          <tr>
            <th>Startnummer</th>
            <th>Namn</th>
            <th>Tid</th>
          </tr>
        </thead>
        <tbody>
          {regLista.map((row, index) => (
            <tr key={index}>
              <td>{row[0]}</td>
              <td>{row[1]}</td>
              <td>{row[2]}</td>
            </tr>
          ))}
        </tbody>
      </table>

		</div>
  );

}
