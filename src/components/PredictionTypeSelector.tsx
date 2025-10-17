import React from "react";

interface PredictionTypeSelectorProps {
  onChange: (type: string) => void;
}

const PredictionTypeSelector: React.FC<PredictionTypeSelectorProps> = ({ onChange }) => {
  return (
    <div className="bg-white text-gray-800 p-4 rounded-xl shadow">
      <label className="block font-semibold mb-2">Tipo de predicción:</label>
      <select
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded p-2"
      >
        <option value="">Selecciona una opción</option>
        <option value="simple">Media simple</option>
        <option value="mean-diff">Diferencia con la media</option>
      </select>
    </div>
  );
};

export default PredictionTypeSelector;

