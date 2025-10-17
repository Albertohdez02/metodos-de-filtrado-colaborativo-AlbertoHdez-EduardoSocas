import React from "react";

interface MetricSelectorProps {
  onChange: (metric: string) => void;
}

const MetricSelector: React.FC<MetricSelectorProps> = ({ onChange }) => {
  return (
    <div className="bg-white text-gray-800 p-4 rounded-xl shadow">
      <label className="block font-semibold mb-2">Métrica de similitud:</label>
      <select
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded p-2"
      >
        <option value="pearson">Correlación de Pearson</option>
        <option value="cosine">Coseno</option>
        <option value="euclidean">Distancia Euclídea</option>
      </select>
    </div>
  );
};

export default MetricSelector;

