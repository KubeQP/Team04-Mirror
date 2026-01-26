
import { useState } from 'react';

export default function RegisteringSida(){


  const [reg, setReg] = useState("");
  const [regLista, setRegLista] = useState<string[]>([]);
  const addReg = () => {
    if (!reg.trim()) return;
    if (isNaN(Number(reg))) return;
    const regWithoutInitialZeros = reg.replace(/^0+/, '');
    const formattedReg = regWithoutInitialZeros.padStart(3, "0");

    setRegLista((prev) => [...prev, formattedReg]);
    setReg('');
  };

  return (
    <div>
			<h2>Registrering:</h2>
			<input id="startNbrInput" value={reg} onChange= { (e) => setReg(e.target.value)} type="text" placeholder="Skriv startnummer här" />
      <button onClick={addReg}>Registrera</button>
      <ul>
        {regLista.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
		</div>
  );

}
