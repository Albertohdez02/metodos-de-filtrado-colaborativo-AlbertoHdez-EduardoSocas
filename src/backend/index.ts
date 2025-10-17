import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { predictMatrix } from "./recommender"; // sin .js

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));

/** Parser robusto para el formato:
 *  1ª línea: minRating
 *  2ª línea: maxRating
 *  Resto: matriz con valores o '-' (desconocidos)
 */
function parseUtilityFile(content: string) {
  // Normaliza saltos de línea y espacios
  const lines = content
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 3) {
    throw new Error("Fichero inválido: faltan líneas (min, max y al menos una fila de matriz).");
  }

  const minRating = Number(lines[0]);
  const maxRating = Number(lines[1]);
  if (!Number.isFinite(minRating) || !Number.isFinite(maxRating)) {
    throw new Error("Min/Max no son números válidos.");
  }
  if (minRating >= maxRating) {
    throw new Error("El mínimo debe ser menor que el máximo.");
  }

  // Convierte cada fila en números/null; separador por cualquier espacio
  const matrix = lines.slice(2).map((line, r) => {
    const cells = line.split(/\s+/).filter(Boolean);
    if (cells.length === 0) {
      throw new Error(`Fila ${r + 3} vacía en la matriz.`);
    }
    return cells.map((c) => (c === "-" ? null : Number(c)));
  });

  // Valida ancho constante
  const width = matrix[0].length;
  for (let i = 1; i < matrix.length; i++) {
    if (matrix[i].length !== width) {
      throw new Error(
        `Todas las filas deben tener el mismo número de columnas. Fila 3 tiene ${width}, fila ${
          i + 3
        } tiene ${matrix[i].length}.`
      );
    }
  }

  return { minRating, maxRating, matrix };
}

app.get("/", (_req, res) => res.send("Servidor de filtrado colaborativo activo 🚀"));

/** POST /api/predict
 * Body esperado (desde tu FileUploader):
 * { rawText: string, metric: "pearson"|"cosine"|"euclidean", k: number, predictionType: "simple"|"mean-diff" }
 */
app.post("/api/predict", (req, res) => {
  try {
    if (!req.body?.rawText || typeof req.body.rawText !== "string") {
      return res.status(400).json({ error: "Falta 'rawText' con el contenido del fichero." });
    }

    const { minRating, maxRating, matrix } = parseUtilityFile(req.body.rawText);

    const metric = (req.body.metric as "pearson" | "cosine" | "euclidean") || "pearson";
    const k = Number(req.body.k) || 3;
    const predictionType = (req.body.predictionType as "simple" | "mean-diff") || "simple";

    // Ejecuta el motor
    const result = predictMatrix(matrix, metric, k, predictionType, minRating, maxRating);

    // Alias para el frontend actual: ResultsTable usa 'utilityMatrix'.
    // Si tu 'predictMatrix' devuelve 'completedMatrix', devolvemos ambos.
    const payload = {
      ...result,
      utilityMatrix: result.completedMatrix ?? matrix, // compatibilidad
      minRating,
      maxRating,
      metric,
      k,
      predictionType,
    };

    return res.json(payload);
  } catch (error: any) {
    console.error("❌ Error en /api/predict:", error?.message || error);
    return res.status(400).json({ error: error?.message || "Error procesando el archivo." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend corriendo en http://localhost:${PORT}`);
});
