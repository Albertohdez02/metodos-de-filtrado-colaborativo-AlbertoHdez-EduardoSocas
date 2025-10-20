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
  const denominator = Math.sqrt(denomA) * Math.sqrt(denomB);
  return denominator === 0 ? 0 : numerator / denominator; // [-1,1] (normalmente [0,1])
}

/**
 * Calcula la similitud entre dos usuarios usando la distancia euclídea inversa.
 * 
 * Cuanto menor sea la distancia euclídea entre las valoraciones,
 * mayor será la similitud resultante.
 * 
 * @param userA - Valoraciones del primer usuario
 * @param userB - Valoraciones del segundo usuario
 * @returns Similitud en el rango (0, 1), donde 1 indica igualdad perfecta
 */

function euclideanSimilarity(userA: (number | null)[], userB: (number | null)[]): number {
  const commonIndex = commonRatedIndices(userA, userB);
  if (commonIndex.length === 0) return 0;
  let sumOfSquares = 0;
  // calcular la suma de las diferencias al cuadrado
  for (const i of commonIndex) {
    const diff = (userA[i] as number) - (userB[i] as number);
    sumOfSquares += diff * diff;
  }
  const dist = Math.sqrt(sumOfSquares);

  // convertir distancia en una similitud (mas distancia == menos similitud)
  return 1 / (1 + dist); // rango (0,1]
}

// funciones de calculo

/**
 * Calcula la matriz de similitud entre todos los usuarios
 * según la métrica elegida (Pearson, Cosine o Euclidean).
 *
 * También determina los vecinos más similares de cada usuario,
 * opcionalmente limitando el número de vecinos a `k`.
 *
 * @param ratingsMatrix - Matriz de utilidad (usuarios x ítems)
 * @param metric - Tipo de métrica de similitud a usar
 * @param k - Número opcional de vecinos más cercanos a conservar
 * @returns Un objeto con:
 *  - simMatrix: matriz NxN con los valores de similitud
 *  - neighbors: lista de vecinos ordenados por similitud para cada usuario
 */
export function computeSimilarities(
  ratingsMatrix: UtilityMatrix,
  metric: Metric,
  k?: number
): { simMatrix: number[][]; neighbors: Neighbor[][] } {
  const numUsers = ratingsMatrix.length;
  const simMatrix: number[][] = Array.from({ length: numUsers }, () => Array(numUsers).fill(0));

  // Seleccionar la función de similitud correspondiente
  const similarityFn =
    metric === "pearson" ? pearson :
    metric === "cosine" ? cosine :
    euclideanSimilarity;

  // Calcular la similitud entre cada par de usuarios (matriz simétrica)
  for (let userA = 0; userA < numUsers; userA++) {
    for (let userB = userA + 1; userB < numUsers; userB++) {
      const similarity = similarityFn(ratingsMatrix[userA], ratingsMatrix[userB]);
      simMatrix[userA][userB] = similarity;
      simMatrix[userB][userA] = similarity; // simétrica
    }
  }

  // Calcular y ordenar los vecinos más similares para cada usuario
  const neighbors: Neighbor[][] = Array.from({ length: numUsers }, () => []);

  for (let user = 0; user < numUsers; user++) {
    const neighborList: Neighbor[] = [];

    for (let otherUser = 0; otherUser < numUsers; otherUser++) {
      if (user !== otherUser) {
        neighborList.push({
          neighborIndex: otherUser,
          similarity: simMatrix[user][otherUser],
        });
      }
    }

    // Ordenar vecinos por similitud descendente
    neighborList.sort((a, b) => b.similarity - a.similarity);

    // Si se especifica k, quedarse con los k vecinos más similares
    neighbors[user] = typeof k === "number" ? neighborList.slice(0, k) : neighborList;
  }

  return { simMatrix, neighbors };
}


/**
 * Predice la valoración que un usuario daría a un ítem no valorado,
 * utilizando información de sus vecinos más similares.
 *
 * Puede usar dos estrategias:
 *  - "simple": promedio ponderado por similitud
 *  - "mean-diff": compensando por la media de cada usuario (más preciso)
 *
 * @param ratingsMatrix - Matriz de utilidad original
 * @param userIndex - Índice del usuario para quien se predice
 * @param itemIndex - Índice del ítem a predecir
 * @param kNeighbors - Lista de vecinos más similares del usuario
 * @param predictionType - Estrategia de predicción ("simple" o "mean-diff")
 * @param minRating - Valor mínimo permitido (opcional)
 * @param maxRating - Valor máximo permitido (opcional)
 * @returns Detalle completo de la predicción realizada
 */
export function predictForCell(
  ratingsMatrix: UtilityMatrix,
  userIndex: number,
  itemIndex: number,
  kNeighbors: Neighbor[],
  predictionType: PredictionType,
  minRating?: number,
  maxRating?: number
): PredictionDetail {
  const neighborsUsed: {
    neighborIndex: number;
    similarity: number;
    rating: number;
    neighborMean?: number;
  }[] = [];

  // Solo se usan vecinos que hayan valorado este ítem
  for (const neighbor of kNeighbors) {
    const neighborRating = ratingsMatrix[neighbor.neighborIndex][itemIndex];
    if (neighborRating !== null) {
      neighborsUsed.push({
        neighborIndex: neighbor.neighborIndex,
        similarity: neighbor.similarity,
        rating: neighborRating,
      });
    }
  }

  const userMean = meanOf(ratingsMatrix[userIndex]);
  let rawPrediction = userMean; // Valor por defecto si no hay vecinos válidos

  if (neighborsUsed.length > 0) {
    if (predictionType === "simple") {
      // --- Predicción simple: promedio ponderado por similitud ---
      let weightedSum = 0;
      let similaritySum = 0;

      for (const neighbor of neighborsUsed) {
        weightedSum += neighbor.similarity * neighbor.rating;
        similaritySum += Math.abs(neighbor.similarity);
      }

      rawPrediction = similaritySum === 0 ? userMean : weightedSum / similaritySum;
    } else {
      // --- Predicción con corrección de media (mean-diff) ---
      let weightedDiffSum = 0;
      let similaritySum = 0;

      for (const neighbor of neighborsUsed) {
        const neighborMean = meanOf(ratingsMatrix[neighbor.neighborIndex]);
        neighbor.neighborMean = neighborMean;
        weightedDiffSum += neighbor.similarity * (neighbor.rating - neighborMean);
        similaritySum += Math.abs(neighbor.similarity);
      }

      rawPrediction = similaritySum === 0 ? userMean : userMean + weightedDiffSum / similaritySum;
    }
  }

  // Aplicar límites opcionales
  let finalPrediction = rawPrediction;
  if (typeof minRating === "number") finalPrediction = Math.max(finalPrediction, minRating);
  if (typeof maxRating === "number") finalPrediction = Math.min(finalPrediction, maxRating);

  return {
    user: userIndex,
    item: itemIndex,
    neighborsUsed,
    rawPrediction,
    finalPrediction,
    formula: predictionType,
  };
}


/**
 * Calcula todas las predicciones posibles sobre la matriz de utilidad,
 * completando los valores faltantes y generando recomendaciones para cada usuario.
 *
 * @param ratingsMatrix - Matriz original (usuarios x ítems)
 * @param metric - Métrica de similitud a utilizar
 * @param kNeighbors - Número de vecinos más similares a usar por usuario
 * @param predictionType - Tipo de fórmula de predicción ("simple" o "mean-diff")
 * @param minRating - Valor mínimo permitido para las predicciones (opcional)
 * @param maxRating - Valor máximo permitido para las predicciones (opcional)
 * @returns Un objeto con toda la información del proceso:
 *  - completedMatrix: matriz con valores predichos
 *  - simMatrix: matriz de similitudes
 *  - neighbors: vecinos usados
 *  - predictions: detalles de cada predicción individual
 *  - recommendations: ítems recomendados por usuario, ordenados por puntuación
 */
export function predictMatrix(
  ratingsMatrix: UtilityMatrix,
  metric: Metric,
  kNeighbors: number,
  predictionType: PredictionType,
  minRating?: number,
  maxRating?: number
): RecommenderResult {
  const numUsers = ratingsMatrix.length;
  const numItems = ratingsMatrix[0]?.length ?? 0;

  // Calcular similitudes entre todos los usuarios
  const { simMatrix, neighbors } = computeSimilarities(ratingsMatrix, metric, kNeighbors);

  // Crear una copia de la matriz original para ir completando
  const completedMatrix: number[][] = Array.from({ length: numUsers }, (_, userIndex) =>
    Array.from({ length: numItems }, (_, itemIndex) =>
      ratingsMatrix[userIndex][itemIndex] === null
        ? NaN
        : (ratingsMatrix[userIndex][itemIndex] as number)
    )
  );

  const predictions: PredictionDetail[] = [];

  // Recorrer toda la matriz para generar las predicciones faltantes
  for (let userIndex = 0; userIndex < numUsers; userIndex++) {
    for (let itemIndex = 0; itemIndex < numItems; itemIndex++) {
      if (ratingsMatrix[userIndex][itemIndex] === null) {
        const predictionDetail = predictForCell(
          ratingsMatrix,
          userIndex,
          itemIndex,
          neighbors[userIndex],
          predictionType,
          minRating,
          maxRating
        );

        predictions.push(predictionDetail);
        completedMatrix[userIndex][itemIndex] = predictionDetail.finalPrediction;
      }
    }
  }

  // Generar lista de recomendaciones por usuario (ordenadas descendentemente)
  const recommendations = ratingsMatrix.map((_, userIndex) => {
    const userRecs: { item: number; predicted: number }[] = [];

    for (let itemIndex = 0; itemIndex < numItems; itemIndex++) {
      if (ratingsMatrix[userIndex][itemIndex] === null) {
        userRecs.push({
          item: itemIndex,
          predicted: completedMatrix[userIndex][itemIndex],
        });
      }
    }

    userRecs.sort((a, b) => b.predicted - a.predicted);
    return { user: userIndex, recommendations: userRecs };
  });

  return { completedMatrix, simMatrix, neighbors, predictions, recommendations };
}

