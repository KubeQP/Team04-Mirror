import {useTable} from "react-table";
import {useMemo} from "react";

const Table = ({data}) => {
    const{
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow
    } = useTable ({data});

    return (
        <div className="TableContainer">
            <table{...getTableProps}>
                <thead>
                    {headerGroups.map((headerGroup) => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map((column) => (
                            <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                            {column.render("Header")}
                            <span>
                                {column.isSorted
                                ? column.isSortedDesc
                                    ? " 🔽"
                                    : " 🔼"
                                : ""}
                            </span>
                            </th>
                        ))}
                        </tr>
                    ))}
                    </thead>
                    <tbody {...getTableBodyProps()}>
                    {rows.map((row) => {
                        prepareRow(row);
                        return (
                        <tr {...row.getRowProps()}>
                            {row.cells.map((cell) => (
                            <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                            ))}
                        </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};


export default Table;

/*export default function Table ({twoDArray}: Readonly<data>){
    return (
        <div>

        </div>
    )
}*/