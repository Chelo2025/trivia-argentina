// Variables globales
let preguntas = [];
let respuestasUsuario = [];
let nombre = "";
let cantidad = 0;
let indice = 0;
let correctas = 0;
let nivel = "principiante";

// Configuración
const tiempoLimite = 20000;
const signosZodiacales = [
  "Aries", "Tauro", "Géminis", "Cáncer", "Leo", "Virgo",
  "Libra", "Escorpio", "Sagitario", "Capricornio", "Acuario", "Piscis"
];

// Inicio del juego
async function comenzarTrivia() {
  nombre = document.getElementById("nombre").value.trim();
  const tema = document.getElementById("tema").value;
  cantidad = parseInt(document.getElementById("cantidad").value);
  nivel = document.getElementById("nivel").value;

  const res = await fetch(`data/${tema}.json`);
  const data = await res.json();

  preguntas = generarPreguntas(data).sort(() => 0.5 - Math.random()).slice(0, cantidad);
  respuestasUsuario = [];
  indice = 0;
  correctas = 0;

  document.getElementById("inicio").style.display = "none";
  document.getElementById("trivia").style.display = "block";
  document.getElementById("final").style.display = "none";
  document.getElementById("saludo").innerText = `¡Vamos ${nombre}! Tema: ${tema}`;

  mostrarPregunta();
}

// Generar preguntas desde JSON
function generarPreguntas(data) {
  return data.map(item => {
    const nombre = item.nombre?.trim() || "este personaje";
    const fecha = item.fecha_nacimiento?.toString().trim() || "una fecha desconocida";
    const respuesta = item.signo?.trim() || "Capricornio";
    const opciones = generarOpciones(respuesta);
    return {
      pregunta: `¿Qué signo zodiacal tenía ${nombre}, nacido en ${fecha}?`,
      opciones,
      respuesta,
      pista: `Empieza con "${respuesta.slice(0, 3)}..."`
    };
  });
}

// Generar opciones aleatorias
function generarOpciones(correcta) {
  const opciones = [correcta];
  while (opciones.length < 4) {
    const op = signosZodiacales[Math.floor(Math.random() * signosZodiacales.length)];
    if (!opciones.includes(op)) opciones.push(op);
  }
  return opciones.sort(() => 0.5 - Math.random());
}

// Mostrar pregunta actual
function mostrarPregunta() {
  const p = preguntas[indice];
  const cont = document.getElementById("pregunta-container");
  cont.innerHTML = `<h3>Pregunta ${indice + 1} de ${cantidad}</h3><p>${p.pregunta}</p>`;

  if (nivel === "principiante") {
    cont.innerHTML += p.opciones.map(op => `<button onclick="responder('${op}')">${op}</button>`).join("");
  } else {
    cont.innerHTML += `
      <input type="text" id="respuesta" placeholder="Escribí tu respuesta">
      <button onclick="responderManual()">Responder</button>
      <p class="pista">Pista: ${p.pista}</p>
    `;
  }
}

// Validar respuesta (principiante)
function responder(opcion) {
  registrarRespuesta(opcion);
  avanzar();
}

// Validar respuesta (avanzado)
function responderManual() {
  const respuesta = document.getElementById("respuesta").value.trim();
  registrarRespuesta(respuesta);
  avanzar();
}

// Registrar respuesta y verificar
function registrarRespuesta(respuestaUsuario) {
  const correcta = preguntas[indice].respuesta;
  const esCorrecta = respuestaUsuario.toLowerCase() === correcta.toLowerCase();
  if (esCorrecta) correctas++;
  respuestasUsuario.push({
    pregunta: preguntas[indice].pregunta,
    respuestaCorrecta: correcta,
    respuestaUsuario,
    esCorrecta
  });
}

// Avanzar a la siguiente pregunta o finalizar
function avanzar() {
  indice++;
  if (indice < preguntas.length) {
    mostrarPregunta();
  } else {
    mostrarFinal();
  }
}

// Mostrar resultado final
function mostrarFinal() {
  document.getElementById("trivia").style.display = "none";
  document.getElementById("final").style.display = "block";

  let resultado = `<strong>${nombre}, acertaste ${correctas} de ${cantidad} preguntas.</strong><br><br><ul>`;
  respuestasUsuario.forEach((r, i) => {
    resultado += `<li><strong>Pregunta ${i + 1}:</strong> ${r.pregunta}<br>
    Tu respuesta: <em>${r.respuestaUsuario}</em> ${r.esCorrecta ? "✅" : "❌"}<br>
    Respuesta correcta: <strong>${r.respuestaCorrecta}</strong></li><br>`;
  });
  resultado += `</ul>`;
  document.getElementById("resultado").innerHTML = resultado;

  lanzarConfeti();
}

// Volver al inicio
function volverInicio() {
  document.getElementById("inicio").style.display = "block";
  document.getElementById("trivia").style.display = "none";
  document.getElementById("final").style.display = "none";
}

// Celebración final
function lanzarConfeti() {
  import('https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.module.mjs').then(({default: confetti}) => {
    confetti({ particleCount: 200, spread: 70, origin: { y: 0.6 } });
  });
}

