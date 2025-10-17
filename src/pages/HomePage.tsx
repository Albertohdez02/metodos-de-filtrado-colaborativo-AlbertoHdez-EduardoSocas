import React, { useState } from "react";
import FileUploader from "../components/FileUploader";
import MetricSelector from "../components/MetricSelector";
import NeighborsSelector from "../components/NeighborsSelector";
import PredictionTypeSelector from "../components/PredictionTypeSelector";
import ResultsTable from "../components/ResultsTable";

type Neighbor = { neighborIndex: number; similarity: number };
type PredictionDetail = {
  user: number;
  item: number;
  neighborsUsed: { neighborIndex: number; similarity: number; rating: number; neighborMean?: number }[];
  rawPrediction: number;
  finalPrediction: number;
  formula: "simple" | "mean-diff";
};
type ApiResult = {
  utilityMatrix: (number | null)[][];
  // comprobacion de requisitos
  completedMatrix: number[][];
  simMatrix: number[][];
  neighbors: Neighbor[][];
  predictions: PredictionDetail[];
  recommendations: { user: number; recommendations: { item: number; predicted: number }[] }[];
  // eco de parámetros
  metric: "pearson" | "cosine" | "euclidean";
  k: number;
  predictionType: "simple" | "mean-diff";
  minRating?: number;
  maxRating?: number;
};

export default function HomePage() {
  const [fileText, setFileText] = useState<string | null>(null);
  const [metric, setMetric] = useState<"pearson" | "cosine" | "euclidean">("pearson");
  const [k, setK] = useState<number>(3);
  const [predictionType, setPredictionType] = useState<"simple" | "mean-diff">("mean-diff");
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);
  const canRun = !!fileText && k >= 1 && !!metric && !!predictionType;

  const handleFileLoaded = async (text: string) => setFileText(text);

  const handlePredict = async () => {
    if (!canRun) return;
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: fileText, metric, k, predictionType }),
      });
      if (!response.ok) {
        const txt = await response.text();
        throw new Error(txt || "HTTP error");
      }
      const data: ApiResult = await response.json();
      setResult(data);
      console.log("simMatrix:", data.simMatrix);
      console.log("neighbors:", data.neighbors);
      console.log("predictions (5 primeras):", data.predictions?.slice(0, 5));
      console.log("recommendations (3 primeros usuarios):", data.recommendations?.slice(0, 3));
    } catch (error) {
      console.error(" ERROR en la predicción:", error);
      alert("ERROR realizando la predicción. Revisa la consola del backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-6">Sistema de recomendación</h1>

      <div className="space-y-4 bg-gray-800 p-6 rounded-2xl shadow-lg">
        <FileUploader onFileLoaded={handleFileLoaded} />
        <MetricSelector onChange={(m) => setMetric(m as any)} />
        <NeighborsSelector onChange={(num) => setK(Number(num))} />
        <PredictionTypeSelector onChange={(t) => setPredictionType(t as any)} />

        <button
          onClick={handlePredict}
          disabled={!canRun || loading}
          className={`text-white font-semibold px-4 py-2 rounded-lg mt-4 ${
            !canRun || loading ? "bg-gray-600 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {loading ? "Calculando..." : "Calcular predicciones"}
        </button>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Resultados de la predicción</h2>
      <ResultsTable data={result} />
      <p className="text-gray-400 mt-4 text-sm">Aquí se mostrará la matriz de utilidad con las predicciones calculadas.</p>

      {/* verificación de requisitos */}
      {result && (
        <div className="mt-10 grid grid-cols-1 gap-6">
          <div className="bg-gray-800 p-4 rounded-xl">
            <h3 className="font-semibold mb-2">1) Similaridad (simMatrix)</h3>
            <p className="text-xs text-gray-400 mb-2">
              Matriz usuario×usuario. Mostrando un recorte 5×5:
            </p>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(result.simMatrix.slice(0, 5).map(r => r.slice(0, 5)), null, 2)}
            </pre>
          </div>

          <div className="bg-gray-800 p-4 rounded-xl">
            <h3 className="font-semibold mb-2">2) Vecinos seleccionados (top-k por usuario)</h3>
            <p className="text-xs text-gray-400 mb-2">Primeros 3 usuarios:</p>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(result.neighbors.slice(0, 3), null, 2)}
            </pre>
          </div>

          <div className="bg-gray-800 p-4 rounded-xl">
            <h3 className="font-semibold mb-2">3) Detalle del cálculo de predicciones (muestras)</h3>
            <p className="text-xs text-gray-400 mb-2">
              Cada entrada incluye vecinos usados, fórmula, predicción cruda y final.
            </p>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(result.predictions.slice(0, 5), null, 2)}
            </pre>
          </div>

          <div className="bg-gray-800 p-4 rounded-xl">
            <h3 className="font-semibold mb-2">4) Recomendaciones por usuario (top)</h3>
            <p className="text-xs text-gray-400 mb-2">Primeros 3 usuarios:</p>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(result.recommendations.slice(0, 3), null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
