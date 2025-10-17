export type Metric = "pearson" | "cosine" | "euclidean";
export type PredictionType = "simple" | "mean-diff";
export type UtilityMatrix = (number | null)[][];

export interface Neighbor {
  neighborIndex: number;
  similarity: number;
}

export interface PredictionDetail {
  user: number;
  item: number;
  neighborsUsed: { neighborIndex: number; similarity: number; rating: number; neighborMean?: number }[];
  rawPrediction: number;
  finalPrediction: number;
  formula: PredictionType;
}

export interface RecommenderResult {
  completedMatrix: number[][];
  simMatrix: number[][];
  neighbors: Neighbor[][];
  predictions: PredictionDetail[];
  recommendations: { user: number; recommendations: { item: number; predicted: number }[] }[];
}

// funciones auxiliares

function meanOf(row: (number | null)[]): number {
  let s = 0, c = 0;
  for (const v of row) if (v !== null) { s += v; c++; }
  return c === 0 ? 0 : s / c;
}

function commonRatedIndices(a: (number | null)[], b: (number | null)[]): number[] {
  const idx: number[] = [];
  for (let i = 0; i < a.length; i++) if (a[i] !== null && b[i] !== null) idx.push(i);
  return idx;
}

// funciones de similar¡dad 

function pearson(a: (number | null)[], b: (number | null)[]): number {
  const idx = commonRatedIndices(a, b);
  const n = idx.length;
  if (n === 0) return 0;
  let sumA = 0, sumB = 0;
  for (const i of idx) { sumA += a[i] as number; sumB += b[i] as number; }
  const meanA = sumA / n, meanB = sumB / n;
  let num = 0, denA = 0, denB = 0;
  for (const i of idx) {
    const da = (a[i] as number) - meanA;
    const db = (b[i] as number) - meanB;
    num += da * db;
    denA += da * da;
    denB += db * db;
  }
  const denom = Math.sqrt(denA) * Math.sqrt(denB);
  return denom === 0 ? 0 : num / denom; // [-1,1]
}

function cosine(a: (number | null)[], b: (number | null)[]): number {
  const idx = commonRatedIndices(a, b);
  if (idx.length === 0) return 0;
  let dot = 0, na = 0, nb = 0;
  for (const i of idx) {
    const va = a[i] as number, vb = b[i] as number;
    dot += va * vb; na += va * va; nb += vb * vb;
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom; // [-1,1] (normalmente [0,1])
}

function euclideanSimilarity(a: (number | null)[], b: (number | null)[]): number {
  const idx = commonRatedIndices(a, b);
  if (idx.length === 0) return 0;
  let sumsq = 0;
  for (const i of idx) {
    const d = (a[i] as number) - (b[i] as number);
    sumsq += d * d;
  }
  const dist = Math.sqrt(sumsq);
  return 1 / (1 + dist); // (0,1]
}

// funciones de calculo

export function computeSimilarities(matrix: UtilityMatrix, metric: Metric, k?: number): {
  simMatrix: number[][],
  neighbors: Neighbor[][]
} {
  const n = matrix.length;
  const simMatrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  const metricFn = metric === "pearson" ? pearson : metric === "cosine" ? cosine : euclideanSimilarity;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const s = metricFn(matrix[i], matrix[j]);
      simMatrix[i][j] = s; simMatrix[j][i] = s;
    }
  }

  const neighbors: Neighbor[][] = Array.from({ length: n }, () => []);
  for (let i = 0; i < n; i++) {
    const row: Neighbor[] = [];
    for (let j = 0; j < n; j++) if (i !== j) row.push({ neighborIndex: j, similarity: simMatrix[i][j] });
    row.sort((a, b) => b.similarity - a.similarity);
    neighbors[i] = typeof k === "number" ? row.slice(0, k) : row;
  }

  return { simMatrix, neighbors };
}

export function predictForCell(
  matrix: UtilityMatrix,
  userIndex: number,
  itemIndex: number,
  kNeighbors: Neighbor[],
  predictionType: PredictionType,
  minRating?: number,
  maxRating?: number
): PredictionDetail {
  const neighborsUsed: { neighborIndex: number; similarity: number; rating: number; neighborMean?: number }[] = [];
  for (const n of kNeighbors) {
    const r = matrix[n.neighborIndex][itemIndex];
    if (r !== null) neighborsUsed.push({ neighborIndex: n.neighborIndex, similarity: n.similarity, rating: r });
  }

  const userMean = meanOf(matrix[userIndex]);
  let raw = userMean; // fallback si no hay vecinos con rating
  if (neighborsUsed.length > 0) {
    if (predictionType === "simple") {
      let num = 0, den = 0;
      for (const nu of neighborsUsed) { num += nu.similarity * nu.rating; den += Math.abs(nu.similarity); }
      raw = den === 0 ? userMean : num / den;
    } else {
      let num = 0, den = 0;
      for (const nu of neighborsUsed) {
        const neighMean = meanOf(matrix[nu.neighborIndex]);
        nu.neighborMean = neighMean;
        num += nu.similarity * (nu.rating - neighMean);
        den += Math.abs(nu.similarity);
      }
      raw = den === 0 ? userMean : userMean + num / den;
    }
  }

  let final = raw;
  if (typeof minRating === "number") final = Math.max(final, minRating);
  if (typeof maxRating === "number") final = Math.min(final, maxRating);

  return {
    user: userIndex,
    item: itemIndex,
    neighborsUsed,
    rawPrediction: raw,
    finalPrediction: final,
    formula: predictionType
  };
}

export function predictMatrix(
  matrix: UtilityMatrix,
  metric: Metric,
  kNeighbors: number,
  predictionType: PredictionType,
  minRating?: number,
  maxRating?: number
): RecommenderResult {
  const nUsers = matrix.length;
  const nItems = matrix[0]?.length ?? 0;

  const { simMatrix, neighbors } = computeSimilarities(matrix, metric, kNeighbors);

  const completedMatrix: number[][] = Array.from({ length: nUsers }, (_, u) =>
    Array.from({ length: nItems }, (_, it) => (matrix[u][it] === null ? NaN : (matrix[u][it] as number)))
  );

  const predictions: PredictionDetail[] = [];
  for (let u = 0; u < nUsers; u++) {
    for (let it = 0; it < nItems; it++) {
      if (matrix[u][it] === null) {
        const detail = predictForCell(matrix, u, it, neighbors[u], predictionType, minRating, maxRating);
        predictions.push(detail);
        completedMatrix[u][it] = detail.finalPrediction;
      }
    }
  }

  const recommendations: { user: number; recommendations: { item: number; predicted: number }[] }[] = [];
  for (let u = 0; u < nUsers; u++) {
    const recs: { item: number; predicted: number }[] = [];
    for (let it = 0; it < nItems; it++) {
      if (matrix[u][it] === null) recs.push({ item: it, predicted: completedMatrix[u][it] });
    }
    recs.sort((a, b) => b.predicted - a.predicted);
    recommendations.push({ user: u, recommendations: recs });
  }

  return { completedMatrix, simMatrix, neighbors, predictions, recommendations };
}
