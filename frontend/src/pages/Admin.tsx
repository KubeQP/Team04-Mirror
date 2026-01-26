// frontend/src/pages/Admin.tsx
//import { useState } from 'react';

// src/pages/Admin.tsx
export default function Admin(){

    return(
        <div>
            <h2>Admin Sida</h2>
            <p>Välkommen till administrationssidan.</p>   

            <div className = "a">
                {/* Första table */}
                <table className = "test">
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
                <table className = "b">
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
        </div>
    )
}