// Configuración de Supabase
const SUPABASE_URL = "https://hassxrmxjvrktqmmyvcv.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhhc3N4cm14anZya3RxbW15dmN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMTc4MzgsImV4cCI6MjA5NDY5MzgzOH0.UaxlYNomjhsbv3cMa8Hn9hVwhylFLqSP9O_iwUYqOK8";
const SUPABASE_TABLE = "responses"; // Ajusta el nombre de la tabla si es necesario

let responses = [];
let pieChart = null;
let sentimentChart = null;
let currentFilter = "Todos";

// Elementos del DOM
const surveyForm = document.getElementById("surveyForm");
const groupSelect = document.getElementById("groupSelect");
const satisfactionInput = document.getElementById("satisfactionInput");
const starsDisplay = document.getElementById("starsDisplay");
const commentArea = document.getElementById("commentArea");
const filterSelect = document.getElementById("filterSelect");
const responsesList = document.getElementById("responsesList");

// Event Listeners
surveyForm.addEventListener("submit", handleFormSubmit);
satisfactionInput.addEventListener("input", updateStarsDisplay);
filterSelect.addEventListener("change", handleFilterChange);

// Actualizar estrellas mientras se escribe
function updateStarsDisplay() {
  const value = parseInt(satisfactionInput.value) || 0;
  if (value >= 1 && value <= 5) {
    starsDisplay.textContent = "★".repeat(value) + "☆".repeat(5 - value);
  }
}

// Manejar envío del formulario
async function handleFormSubmit(e) {
  e.preventDefault();

  const group = groupSelect.value;
  const rating = parseInt(satisfactionInput.value, 10);
  const comment = commentArea.value || "";

  if (!group || Number.isNaN(rating)) {
    alert("Por favor completa el formulario");
    return;
  }

  if (rating < 1 || rating > 5) {
    alert("La puntuación debe ser un número entre 1 y 5.");
    return;
  }

  try {
    await insertResponse({ group, rating, comment });
    await loadResponses();

    // Limpiar formulario
    surveyForm.reset();
    starsDisplay.textContent = "☆☆☆☆☆";

    // Actualizar panel
    updatePanel();
  } catch (error) {
    console.error("Error guardando la respuesta:", error);
    alert(
      "No se pudo guardar la respuesta en la base de datos. Revisa la consola.",
    );
  }
}

// Manejar cambio de filtro
function handleFilterChange(e) {
  currentFilter = e.target.value;
  updatePanel();
}

// Obtener respuestas filtradas
function getFilteredResponses() {
  if (currentFilter === "Todos") {
    return responses;
  }
  return responses.filter((r) => r.group === currentFilter);
}

// Encabezados comunes para Supabase
function getSupabaseHeaders() {
  return {
    apikey: SUPABASE_KEY,
    "Content-Type": "application/json",
  };
}

// Cargar respuestas desde Supabase
async function loadResponses() {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?select=*&order=created_at.desc`,
      {
        headers: getSupabaseHeaders(),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Supabase load error: ${response.status} ${errorText}`);
    }

    responses = await response.json();
  } catch (error) {
    console.error("Error cargando respuestas:", error);
    responses = [];
  }
}

// Insertar una nueva respuesta en Supabase
async function insertResponse(payload) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`, {
    method: "POST",
    headers: getSupabaseHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase insert error: ${response.status} ${errorText}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// Calcular estadísticas
function calculateStats() {
  const filtered = getFilteredResponses();

  if (filtered.length === 0) {
    return {
      total: 0,
      median: 0,
      positivePercentage: 0,
      distribution: [0, 0, 0, 0, 0],
    };
  }

  // Total de respuestas
  const total = filtered.length;

  // Mediana
  const ratings = filtered.map((r) => r.rating).sort((a, b) => a - b);
  const median =
    ratings.length % 2 === 0
      ? (ratings[ratings.length / 2 - 1] + ratings[ratings.length / 2]) / 2
      : ratings[Math.floor(ratings.length / 2)];

  // Porcentaje positivo (4-5)
  const positiveCount = filtered.filter((r) => r.rating >= 4).length;
  const positivePercentage = Math.round((positiveCount / total) * 100);

  // Distribución
  const distribution = [0, 0, 0, 0, 0];
  filtered.forEach((r) => {
    distribution[r.rating - 1]++;
  });

  return {
    total,
    median: median.toFixed(1),
    positivePercentage,
    distribution,
  };
}

// Calcular estadísticas por grupo (para comparativa)
function getGroupStats() {
  const groups = ["Grupo A", "Grupo B", "Grupo C", "Grupo D"];
  const stats = {};

  groups.forEach((group) => {
    const groupResponses = responses.filter((r) => r.group === group);
    if (groupResponses.length === 0) {
      stats[group] = null;
    } else {
      const ratings = groupResponses.map((r) => r.rating).sort((a, b) => a - b);
      const median =
        ratings.length % 2 === 0
          ? (ratings[ratings.length / 2 - 1] + ratings[ratings.length / 2]) / 2
          : ratings[Math.floor(ratings.length / 2)];
      stats[group] = median;
    }
  });

  return stats;
}

// Actualizar panel completo
function updatePanel() {
  const stats = calculateStats();
  const filtered = getFilteredResponses();

  // Actualizar descripción
  const description =
    currentFilter === "Todos"
      ? `Los datos que se muestran corresponden a todas las respuestas recopiladas de todos los grupos.`
      : `Los datos que se muestran corresponden a las respuestas del ${currentFilter}.`;
  document.getElementById("panelDescription").textContent = description;

  // Actualizar métricas
  document.getElementById("totalResponses").textContent = stats.total;
  document.getElementById("medianValue").textContent = stats.median;
  document.getElementById("positivePercentage").textContent =
    stats.positivePercentage + "%";
  document.getElementById("analyzedGroup").textContent = currentFilter;

  // Actualizar distribución
  updateDistribution(stats.distribution, filtered.length);

  // Actualizar gráficos
  updatePieCharts(filtered);

  // Actualizar comparativa de mediana
  updateMedianComparison();

  // Actualizar lista de respuestas
  updateResponsesList();
}

// Actualizar barras de distribución
function updateDistribution(distribution, total) {
  for (let i = 0; i < 5; i++) {
    const count = distribution[i];
    const percentage = total > 0 ? (count / total) * 100 : 0;

    document.getElementById(`bar${i + 1}`).style.width = percentage + "%";
    document.getElementById(`count${i + 1}`).textContent = count;
  }
}

// Actualizar gráficos de pastel
function updatePieCharts(filtered) {
  if (filtered.length === 0) {
    // Si no hay datos, mostrar gráfico vacío
    updatePieChart([0, 0, 0, 0, 0], ["1 ★", "2 ★", "3 ★", "4 ★", "5 ★"]);
    updateSentimentChart([0, 0], ["No Positivas", "Positivas"]);
    return;
  }

  // Gráfico de distribución total
  const distribution = [0, 0, 0, 0, 0];
  filtered.forEach((r) => {
    distribution[r.rating - 1]++;
  });
  updatePieChart(distribution, ["1 ★", "2 ★", "3 ★", "4 ★", "5 ★"]);

  // Gráfico de sentimiento (positivas vs no positivas)
  const positive = filtered.filter((r) => r.rating >= 4).length;
  const negative = filtered.length - positive;
  updateSentimentChart(
    [negative, positive],
    ["No Positivas (1-3)", "Positivas (4-5)"],
  );
}

// Actualizar gráfico de pastel (general)
function updatePieChart(data, labels) {
  const ctx = document.getElementById("pieChart").getContext("2d");

  const colors = [
    "#ef4444", // Rojo para 1
    "#f97316", // Naranja para 2
    "#eab308", // Amarillo para 3
    "#84cc16", // Verde claro para 4
    "#22c55e", // Verde para 5
  ];

  if (pieChart) {
    pieChart.data.labels = labels;
    pieChart.data.datasets[0].data = data;
    pieChart.data.datasets[0].backgroundColor = colors;
    pieChart.update();
  } else {
    pieChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: colors,
            borderColor: "white",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 15,
              font: { size: 12 },
              usePointStyle: true,
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const value = context.parsed;
                const percentage =
                  total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return context.label + ": " + value + " (" + percentage + "%)";
              },
            },
          },
        },
      },
    });
  }
}

// Actualizar gráfico de sentimiento
function updateSentimentChart(data, labels) {
  const ctx = document.getElementById("sentimentChart").getContext("2d");

  if (sentimentChart) {
    sentimentChart.data.labels = labels;
    sentimentChart.data.datasets[0].data = data;
    sentimentChart.update();
  } else {
    sentimentChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: ["#ef4444", "#22c55e"],
            borderColor: "white",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 15,
              font: { size: 12 },
              usePointStyle: true,
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const value = context.parsed;
                const percentage =
                  total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return context.label + ": " + value + " (" + percentage + "%)";
              },
            },
          },
        },
      },
    });
  }
}

// Actualizar comparativa de mediana por grupo
function updateMedianComparison() {
  const stats = getGroupStats();
  const groups = ["Grupo A", "Grupo B", "Grupo C", "Grupo D"];
  const medians = [];

  groups.forEach((group) => {
    const median = stats[group];
    if (median !== null) {
      medians.push(median);
    }
  });

  const maxMedian = medians.length > 0 ? Math.max(...medians) : 5;

  groups.forEach((group) => {
    const median = stats[group];
    const barElement = document.getElementById(`medianBar${group.slice(-1)}`);
    const valueElement = document.getElementById(`median${group.slice(-1)}`);

    if (median !== null) {
      const percentage = (median / 5) * 100;
      barElement.style.width = percentage + "%";
      valueElement.textContent = median.toFixed(1);
    } else {
      barElement.style.width = "0%";
      valueElement.textContent = "-";
    }
  });
}

// Actualizar lista de respuestas
function updateResponsesList() {
  responsesList.innerHTML = "";

  // Mostrar respuestas en orden inverso (últimas primero)
  [...getFilteredResponses()].reverse().forEach((response) => {
    const responseItem = document.createElement("div");
    responseItem.className = `response-item score-${response.rating}`;

    const ratingStars =
      "★".repeat(response.rating) + "☆".repeat(5 - response.rating);

    responseItem.innerHTML = `
            <div class="response-header">
                <span class="response-group">${response.group}</span>
                <span class="response-rating">${ratingStars}</span>
            </div>
            ${response.comment ? `<div class="response-comment">${escapeHtml(response.comment)}</div>` : ""}
        `;

    responsesList.appendChild(responseItem);
  });
}

// Función para escapar HTML
function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Inicializar la página
async function init() {
  await loadResponses();
  updatePanel();
}

init();
