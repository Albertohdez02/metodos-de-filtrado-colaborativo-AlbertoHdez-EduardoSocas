export default function NeighbourSelector() {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <label htmlFor="neighbours" className="block text-sm font-semibold mb-2">
        Número de vecinos
      </label>
      <input
        id="neighbours"
        type="number"
        min="1"
        placeholder="Introduce un número"
        className="w-32 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
    </div>
  );
}
