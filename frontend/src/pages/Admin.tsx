// frontend/src/pages/Admin.tsx
import { useEffect, useState } from 'react';
import type { ExampleTable } from '../types';

// src/pages/Admin.tsx
export default function Admin(){
    //declaring constants for the tables

    const exampleData1 = [["Nr", "Namn", "Start", "Mål", "Tid", "Totalt"], 
    ["1", "AA", "-", "-", "-"]];
    const exampleData2 = [["Station","Nr","Tid"], 
    ["s1", "1", "-"]];

    const[data1, setData1] = useState<string[][]|null>(null);
    const [loading1, setLoading1] = useState(true);
    const [error1, setError1] = useState<string | null>(null);
    
    const [data2, setData2] = useState<string[][] | null>(null);
    const [loading2, setLoading2] = useState(false);
    const [error2, setError2] = useState<string | null>(null);
    
    //fetching data from api OR setting to the example data
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

    //dynamic table creation
    function createTable(tableData: string[][]) {
        return (
            <table>
            <tbody>
                {tableData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                    ))}
                </tr>
                ))}
            </tbody>
            </table>
        );
    }


    return(
        <div>
            <h2>Admin Sida</h2>
            <p>Välkommen till administrationssidan.</p>
            {data1 && createTable(data1)}
            {data2 && createTable(data2)}
        </div>
    )
}