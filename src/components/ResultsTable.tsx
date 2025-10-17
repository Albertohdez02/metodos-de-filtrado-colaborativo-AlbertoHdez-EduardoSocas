import React from "react";

interface ResultsTableProps {
  data: any;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="bg-gray-800 p-4 rounded-xl shadow text-gray-400">
        No hay resultados aún.
      </div>
    );
  }

  if (!data.utilityMatrix) {
    return (
      <div className="bg-gray-800 p-4 rounded-xl shadow text-red-400">
        Error: los datos recibidos no contienen una matriz válida.
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow overflow-x-auto">
      <table className="min-w-full border border-gray-700 text-center">
        <thead>
          <tr>
            <th className="border border-gray-700 px-4 py-2">Usuario</th>
            {data.utilityMatrix[0].map((_: any, i: number) => (
              <th key={i} className="border border-gray-700 px-4 py-2">
                Ítem {i + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.utilityMatrix.map((row: number[], i: number) => (
            <tr key={i}>
              <td className="border border-gray-700 px-4 py-2">U{i + 1}</td>
              {row.map((value: number | null, j: number) => (
                <td key={j} className="border border-gray-700 px-4 py-2">
                  {value === null ? "-" : value.toFixed(2)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;
