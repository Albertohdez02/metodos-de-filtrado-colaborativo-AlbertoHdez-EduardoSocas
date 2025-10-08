export default function ResultsTable() {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md overflow-x-auto">
      <h2 className="text-lg font-semibold mb-4">Resultados de la predicción</h2>

      {/* Tabla de ejemplo vacía */}
      <table className="min-w-full border border-gray-200 rounded-md text-sm text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border-b">Usuario</th>
            <th className="px-4 py-2 border-b">Ítem 1</th>
            <th className="px-4 py-2 border-b">Ítem 2</th>
            <th className="px-4 py-2 border-b">Ítem 3</th>
            <th className="px-4 py-2 border-b">Ítem 4</th>
            <th className="px-4 py-2 border-b">Ítem 5</th>
          </tr>
        </thead>

        <tbody>
          {/* Filas de ejemplo (puedes borrarlas más tarde) */}
          <tr className="hover:bg-gray-50">
            <td className="px-4 py-2 border-b font-medium">U1</td>
            <td className="px-4 py-2 border-b">5.0</td>
            <td className="px-4 py-2 border-b">3.2</td>
            <td className="px-4 py-2 border-b">-</td>
            <td className="px-4 py-2 border-b">4.1</td>
            <td className="px-4 py-2 border-b">-</td>
          </tr>

          <tr className="hover:bg-gray-50">
            <td className="px-4 py-2 border-b font-medium">U2</td>
            <td className="px-4 py-2 border-b">3.1</td>
            <td className="px-4 py-2 border-b">-</td>
            <td className="px-4 py-2 border-b">2.4</td>
            <td className="px-4 py-2 border-b">3.2</td>
            <td className="px-4 py-2 border-b">3.3</td>
          </tr>
        </tbody>
      </table>

      {/* Texto de ayuda */}
      <p className="text-xs text-gray-500 mt-3">
        Aquí se mostrará la matriz de utilidad con las predicciones calculadas.
      </p>
    </div>
  );
}
