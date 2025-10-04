// ======================= VARIABLES =======================
let questions = [];
let userAnswers = [];
let currentIndex = 0;
let correctCount = 0;
let playerName = "";
let questionCount = 0;
let level = "principiante";

// ======================= CONFIGURACIÓN =======================
const zodiacSigns = [
  "Aries", "Tauro", "Géminis", "Cáncer", "Leo", "Virgo",
  "Libra", "Escorpio", "Sagitario", "Capricornio", "Acuario", "Piscis"
];

// ======================= INICIO =======================
document.querySelector("button[onclick='comenzarTrivia()']").addEventListener("click", comenzarTrivia);

async function comenzarTrivia() {
  playerName = document.getElementById("nombre").value.trim();
  const topic = document.getElementById("tema").value;
  questionCount = parseInt(document.getElementById("cantidad").value);
  level = document.getElementById("nivel").value;

  const res = await fetch(`data/${topic}.json`);
  const data = await res.json();

  questions = buildQuestions(data);
  questions = shuffleArray(questions).slice(0, questionCount);
  userAnswers = [];
  currentIndex = 0;
  correctCount = 0;

  showSection("trivia");
  document.getElementById("saludo").textContent = `¡Vamos ${playerName}! Tema: ${topic}`;
  renderQuestion();
}

// ======================= CONSTRUCCIÓN DE PREGUNTAS =======================
function buildQuestions(data) {
  return data.map(item => {
    const name = item.nombre?.trim() || "este personaje";
    const birth = item.fecha_nacimiento?.toString().trim() || "una fecha desconocida";
    const answer = item.signo?.trim() || "Capricornio";
    const options = generateOptions(answer);
    return {
      text: `¿Qué signo zodiacal tenía ${name}, nacido en ${birth}?`,
      answer,
      options,
      hint: `Empieza con "${answer.slice(0, 3)}..."`
    };
  });
}

function generateOptions(correct) {
  const options = [correct];
  while (options.length < 4) {
    const random = zodiacSigns[Math.floor(Math.random() * zodiacSigns.length)];
    if (!options.includes(random)) options.push(random);
  }
  return shuffleArray(options);
}

// ======================= RENDER DE PREGUNTA =======================
function renderQuestion() {
  const q = questions[currentIndex];
  const container = document.getElementById("pregunta-container");
  container.innerHTML = `<h3>Pregunta ${currentIndex + 1} de ${questionCount}</h3><p>${q.text}</p>`;

  if (level === "principiante") {
    q.options.forEach(option => {
      const btn = document.createElement("button");
      btn.textContent = option;
      btn.onclick = () => handleAnswer(option);
      container.appendChild(btn);
    });
  } else {
    container.innerHTML += `
      <input type="text" id="respuesta" placeholder="Escribí tu respuesta">
      <button onclick="handleWrittenAnswer()">Responder</button>
      <p class="pista">${q.hint}</p>
    `;
  }
}

// ======================= VALIDACIÓN DE RESPUESTA =======================
function handleAnswer(selected) {
  registerAnswer(selected);
  nextQuestion();
}

function handleWrittenAnswer() {
  const input = document.getElementById("respuesta").value.trim();
  registerAnswer(input);
  nextQuestion();
}

function registerAnswer(userInput) {
  const correct = questions[currentIndex].answer;
  const isCorrect = userInput.toLowerCase() === correct.toLowerCase();
  if (isCorrect) correctCount++;
  userAnswers.push({
    question: questions[currentIndex].text,
    correct,
    user: userInput,
    isCorrect
  });
}

function nextQuestion() {
  currentIndex++;
  if (currentIndex < questions.length) {
    renderQuestion();
  } else {
    showResults();
  }
}

// ======================= RESULTADOS =======================
function showResults() {
  showSection("final");
  const result = document.getElementById("resultado");
  result.innerHTML = `<strong>${playerName}, acertaste ${correctCount} de ${questionCount} preguntas.</strong><br><br><ul>`;
  userAnswers.forEach((r, i) => {
    result.innerHTML += `<li><strong>Pregunta ${i + 1}:</strong> ${r.question}<br>
    Tu respuesta: <em>${r.user}</em> ${r.isCorrect ? "✅" : "❌"}<br>
    Respuesta correcta: <strong>${r.correct}</strong></li><br>`;
  });
  result.innerHTML += `</ul>`;
  lanzarConfeti();
}

// ======================= UTILIDADES =======================
function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

function showSection(id) {
  document.getElementById("inicio").style.display = "none";
  document.getElementById("trivia").style.display = "none";
  document.getElementById("final").style.display = "none";
  document.getElementById(id).style.display = "block";
}

function volverInicio() {
  showSection("inicio");
}

function lanzarConfeti() {
  import('https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.module.mjs').then(({default: confetti}) => {
    confetti({ particleCount: 200, spread: 70, origin: { y: 0.6 } });
  });
}
