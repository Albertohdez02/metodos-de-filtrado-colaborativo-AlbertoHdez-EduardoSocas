# 🎯 Sistemas de Recomendación · Filtrado Colaborativo

Aplicación web desarrollada en **React + TypeScript + Express**, que implementa un **sistema de recomendación colaborativo**.  

El proyecto permite subir una matriz de utilidad, elegir la métrica de similitud y el tipo de predicción,
y obtener las recomendaciones resultantes con sus detalles de cálculo.

-----------------------------------------------------------------------------

## 👨‍💻 Autores

- Alberto Antonio Hernández Hernández (alu0101433905)
- Eduardo Socas Luis (alu0101404622)

Universidad de La Laguna  
Grado en Ingeniería Informática – Curso 2025/2026  
Asignatura: *Gestión de Conocimiento de las Organizaciones*


-----------------------------------------------------------------------------

## ⚙️ Requisitos previos

Asegúrate de tener instalado en tu sistema:

- 🟩 Node.js ≥ 18
- 📦 npm ≥ 9 (instalado junto con Node)
- 💻 Git (opcional para clonar el repo)

Verifica tu versión con:
```
  node -v
  npm -v
```
-----------------------------------------------------------------------------

## 🚀 Instalación

Clona el proyecto y entra en el directorio raíz:
```
  git clone <URL_DEL_REPOSITORIO>
  cd metodos-de-filtrado-colaborativo-AlbertoHdez-EduardoSocas
```

Instala todas las dependencias:
```
  npm install
```

Compilar el proyecto:
```
  npm run build
```
-----------------------------------------------------------------------------

## 🖥️ Ejecución del proyecto

La aplicación tiene **dos partes**:
un **frontend React** (Vite) y un **backend Express** (TypeScript).

1️⃣ Levantar el backend:

  npm run server

  ✅ Backend corriendo en http:localhost:3000

2️⃣ Levantar el frontend:

  npm run dev

  ➜ Local: http:localhost:5173/

Abre ese enlace en tu navegador.

-----------------------------------------------------------------------------

## 🧠 Uso de la aplicación

1. Sube un archivo `.txt` con el formato:

  <valor mínimo>
  <valor máximo>
  <matriz de utilidad>

  Ejemplo:
  0.000
  5.000
  3.0 - 4.0
  2.5 3.0 -
  - 4.5 4.0

  (El carácter "-" representa una valoración desconocida.)

2. Selecciona:
  - Métrica de similitud → Pearson, Coseno o Euclídea.
  - Número de vecinos (k).
  - Tipo de predicción → Media simple o Diferencia con la media.

3. Pulsa "Calcular predicciones".

4. El sistema:
  - Calcula las similaridades entre usuarios.
  - Selecciona los k vecinos más similares.
  - Predice las valoraciones faltantes.
  - Muestra las recomendaciones finales.

-----------------------------------------------------------------------------

## 📊 Resultados mostrados

| Sección | Descripción |
|----------|--------------|
| **Matriz de utilidad** | La matriz original con predicciones rellenadas. |
| **Similaridad (simMatrix)** | Matriz NxN de similitudes entre usuarios. |
| **Vecinos** | Listado de los k vecinos más similares por usuario. |
| **Cálculo de predicciones** | Detalle de cada predicción (vecinos usados, fórmula, valores). |
| **Recomendaciones** | Ítems sugeridos a cada usuario, ordenados por valoración predicha. |

-----------------------------------------------------------------------------

## 🧱 Tecnologías utilizadas

| Área | Herramienta |
|------|--------------|
| Frontend | ⚛️ React + TypeScript + TailwindCSS |
| Backend | 🟦 Node.js + Express + TypeScript |
| Build | ⚡ Vite |
| Ejecución TS | 🧩 tsx |
| Estilo | 🎨 TailwindCSS |

-----------------------------------------------------------------------------

## 🧰 Scripts disponibles

| Comando | Descripción |
|----------|--------------|
| npm run dev | Inicia el servidor de desarrollo de Vite (frontend) |
| npm run server | Inicia el backend con Express (tsx en modo watch) |
| npm run build | Compila el frontend para producción |
| npm run preview | Previsualiza la app compilada |

-----------------------------------------------------------------------------

## 🧪 Ejemplo de prueba rápida

1. Ir al [este repositorio](https://github.com/ull-cs/gestion-conocimiento/tree/main/recommeder-systems/examples-utility-matrices) y descargue un fichero .txt con una matriz:
2. Inicia backend y frontend como se indica arriba.
3. Sube el fichero desde la app → el sistema calculará y mostrará las predicciones.


