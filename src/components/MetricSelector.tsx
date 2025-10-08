export default function MetricSelector() {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <label className="block font-semibold mb-2">Métrica de similitud:</label>
      <select className="border rounded p-2 w-full">
        <option value="pearson">Correlación de Pearson</option>
        <option value="cosine">Distancia coseno</option>
        <option value="euclidean">Distancia euclídea</option>
      </select>
    </div>
  );
}
