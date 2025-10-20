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

/**
 * Calcula la media (promedio) de las valoraciones de un usuario.
 * Ignora los valores `null` (ítems no valorados).
 *
 * @param ratings - Array de valoraciones de un usuario (número o null)
 * @returns La media de las valoraciones existentes, o 0 si no hay ninguna
 */

function meanOf(ratings: (number | null)[]): number {
  let sum = 0;    // Suma acumulada de las valoraciones válidas
  let count = 0;  //Número de valoraciones válidas
  for (const value of ratings) {
    if (value !== null) { 
      sum += value; 
      count++; 
    }
  }
  //Evitar división por cero si no hay valoraciones
  return count === 0 ? 0 : sum / count;
}

/**
 * Devuelve los índices de los ítems que han sido valorados
 * tanto por el usuario A como por el usuario B.
 *
 * @param userA - Valoraciones del primer usuario
 * @param userB - Valoraciones del segundo usuario
 * @returns Array con los índices de los ítems en común
 */

function commonRatedIndices(userA: (number | null)[], userB: (number | null)[]): number[] {
  const commonIndex: number[] = [];
  for (let i = 0; i < userA.length; i++) {
    if (userA[i] !== null && userB[i] !== null) {
       commonIndex.push(i); // Ambos usuarios valoraron este ítem
    }
  }
  return commonIndex;
}

// funciones de similar¡dad 

/**
 * Calcula la similitud entre dos usuarios usando la correlación de Pearson.
 * 
 * La correlación de Pearson mide la relación lineal entre los patrones de valoración
 * de dos usuarios, normalizando las diferencias de escala y tendencia.
 * 
 * @param userA - Valoraciones del primer usuario
 * @param userB - Valoraciones del segundo usuario
 * @returns Valor de similitud en el rango [-1, 1]
 */

function pearson(userA: (number | null)[], userB: (number | null)[]): number {
  const commonIndex = commonRatedIndices(userA, userB);
  const numberOfCommonIndexes = commonIndex.length;
  //si no hay ítems en común, la similitud es 0
  if (numberOfCommonIndexes === 0) return 0;

  // calcular medias de las valoraciones en común
  let sumA = 0, sumB = 0;
  for (const i of commonIndex) { 
    sumA += userA[i] as number;
    sumB += userB[i] as number; 
  }
  const meanA = sumA / numberOfCommonIndexes;
  const meanB = sumB / numberOfCommonIndexes;

  // calcular numerador y denominadores
  let numerator = 0, denomA = 0, denomB = 0;
  for (const i of commonIndex) {
    const diffUserA = (userA[i] as number) - meanA;
    const diffUserB = (userB[i] as number) - meanB;
    numerator += diffUserA * diffUserB;
    denomA += diffUserA * diffUserA;
    denomB += diffUserB * diffUserB;
  }
  const denomitnator = Math.sqrt(denomA) * Math.sqrt(denomB);
  // evitar división por cero
  return denomitnator === 0 ? 0 : numerator / denomitnator; // [-1,1]
}

/**
 * Calcula la similitud del coseno entre dos usuarios.
 * 
 * Mide el ángulo entre los vectores de valoraciones de ambos usuarios.
 * Valores cercanos a 1 indican vectores con dirección similar.
 * 
 * @param userA - Valoraciones del primer usuario
 * @param userB - Valoraciones del segundo usuario
 * @returns Valor de similitud en el rango [-1, 1] (normalmente entre [0, 1])
 */

function cosine(userA: (number | null)[], userB: (number | null)[]): number {
  const commonIndex = commonRatedIndices(userA, userB);
  if (commonIndex.length === 0) return 0;
  let numerator = 0, denomA = 0, denomB = 0;
  for (const i of commonIndex) {
    const va = userA[i] as number, vb = userB[i] as number;
    numerator += va * vb; denomA += va * va; denomB += vb * vb;
  }
  const denom = Math.sqrt(denomA) * Math.sqrt(denomB);
  return denom === 0 ? 0 : numerator / denom; // [-1,1] (normalmente [0,1])
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
