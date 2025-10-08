export default function PredictionTypeSelector() {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <label htmlFor="predictionType" className="block text-sm font-semibold mb-2">
        Tipo de predicción
      </label>

      <select
        id="predictionType"
        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        defaultValue=""
      >
        <option value="" disabled>
          Selecciona una opción
        </option>
        <option value="simple">Predicción simple</option>
        <option value="mean-diff">Diferencia con la media</option>
      </select>
    </div>
  );
}
