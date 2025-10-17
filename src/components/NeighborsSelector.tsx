import React from "react";

interface NeighborsSelectorProps {
  onChange: (k: number) => void;
}

const NeighborsSelector: React.FC<NeighborsSelectorProps> = ({ onChange }) => {
  return (
    <div className="bg-white text-gray-800 p-4 rounded-xl shadow">
      <label className="block font-semibold mb-2">Número de vecinos:</label>
      <input
        type="number"
        min="1"
        placeholder="Introduce un número"
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full border rounded p-2"
      />
    </div>
  );
};

export default NeighborsSelector;
