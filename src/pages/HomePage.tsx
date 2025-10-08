import FileUploader from "../components/FileUploader.tsx";
import MetricSelector from "../components/MetricSelector.tsx";
import NeighborsSelector from "../components/NeighborsSelector.tsx";
import PredictionTypeSelector from "../components/PredictionTypeSelector.tsx";
import ResultsTable from "../components/ResultsTable.tsx";

export default function HomePage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Sistema de recomendación</h1>
      <FileUploader />
      <MetricSelector />
      <NeighborsSelector />
      <PredictionTypeSelector />
      <ResultsTable />
    </div>
  );
}
