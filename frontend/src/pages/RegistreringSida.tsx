
import { useState } from 'react';

export default function RegisteringSida(){


  const [reg, setReg] = useState("");
  const regLista: string[] = [];
  const addReg = () => {
    regLista.push(reg);
  };

  return (
    <div>
			<h2>Registrering:</h2>
			<input id="startNbrInput" value={reg} onChange= { (e) => setReg(e.target.value)} type="text" placeholder="Skriv startnummer här" />
      <button onClick={addReg}>Registrera</button>
      <ul id="registrationsList"></ul>
      
		</div>
  );

}
