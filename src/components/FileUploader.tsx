export default function FileUploader() {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <label className="block font-semibold mb-2">Sube la matriz de utilidad:</label>
      <input type="file" accept=".txt,.csv" />
    </div>
  );
}
