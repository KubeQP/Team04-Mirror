// frontend/src/pages/Admin.tsx
import { useEffect, useState } from 'react';
import type { ExampleTable } from '../types';

// src/pages/Admin.tsx
export default function Admin(){
    var exampleData1 = [["Nr", "Namn", "Start", "Mål", "Tid", "Totalt"], 
    ["1", "AA", "-", "-", "-"]];
    var exampleData2 = [["Station","Nr","Tid"], 
    ["s1", "1", "-"]];

    const[data1, setData1] = useState<string[][]|null>(null);
    const [loading1, setLoading1] = useState(true);
    const [error1, setError1] = useState<string | null>(null);
    
    const [data2, setData2] = useState<string[][] | null>(null);
    const [loading2, setLoading2] = useState(false);
    const [error2, setError2] = useState<string | null>(null);
    
    useEffect(() =>{
        const fetchData = async()=>{
        try{
            const result1 = await getTable1();
            setData1 (result1);

            const result2 = await getTable2();
            setData2 (result2);
        }
        catch(err: unknown){
            setData1(exampleData1);
            setData2(exampleData2);

            if (err instanceof Error) {
					setError1(err.message);
				} else if (typeof err === 'string') {
					setError1(err);
				} else {
					setError1('Ett okänt fel inträffade');
				}
        }
        finally{
            setLoading1(false);
            setLoading2(false);
        }
    }
    fetchData();
    })

    return(
        <div>
            <h2>Admin Sida</h2>
            <p>Välkommen till administrationssidan.</p>

            {/* Första table */}
            <table>
                <thead>
                    <tr>
                        <th>Nr.</th>
                        <th>Namn</th>
                        <th>Start</th>
                        <th>Mål</th>
                        <th>Tid</th>
                        <th>Totalt</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1</td>
                        <td>AA</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td>2</td>
                        <td>BB</td>
                        <td>-</td>
                        <td>2 tider!</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td>3</td>
                        <td>CC</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td>4</td>
                        <td>DD</td>
                        <td>-</td>
                        <td>X</td>
                        <td>?</td>
                    </tr>
                </tbody>
            </table>

            {/* Station table */}
            <table>
                <thead>
                    <tr>
                        <th>Station</th>
                        <th>Nr.</th>
                        <th>Tid</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>S</td>
                        <td>1</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td>S</td>
                        <td>2</td>
                        <td>-</td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}