let preguntas = [];
let nombre = "";
let cantidad = 0;
let indice = 0;
let correctas = 0;
let nivel = "principiante";
let tiempoLimite = 20000;

async function comenzarTrivia() {
  nombre = document.getElementById("nombre").value;
  const tema = document.getElementById("tema").value;
  cantidad = parseInt(document.getElementById("cantidad").value);
  nivel = document.getElementById("nivel").value;

  const res = await fetch(`data/${tema}.json`);
  const data = await res.json();

  preguntas = generarPreguntas(data).sort(() => 0.5 - Math.random()).slice(0, cantidad);

  document.getElementById("inicio").style.display = "none";
  document.getElementById("trivia").style.display = "block";
  document.getElementById("saludo").innerText = `¡Vamos ${nombre}! Tema: ${tema}`;
  mostrarPregunta();
}

function generarPreguntas(data) {
  return data.map(item => {
    const respuesta = item.nacionalidad || item.origen || "argentino";
    const opciones = generarOpciones(respuesta);
    return {
      pregunta: `¿De qué nacionalidad era ${item.descripcion || item.nombre}?`,
      opciones: opciones,
      respuesta: respuesta,
      pista: `Empieza con "${respuesta.slice(0, 3)}..."`
    };
  });
}

function generarOpciones(correcta) {
  const todas = ["argentino", "mexicano", "italiano", "francés", "alemán", "español", "británico", "estadounidense", "japonés", "ruso"];
  const opciones = [correcta];
  while (opciones.length < 4) {
    const op = todas[Math.floor(Math.random() * todas.length)];
    if (!opciones.includes(op)) opciones.push(op);
  }
  return opciones.sort(() => 0.5 - Math.random());
}

function mostrarPregunta() {
  const p = preguntas[indice];
  const cont = document.getElementById("pregunta-container");
  cont.innerHTML = `<h3>${p.pregunta}</h3>`;

  if (nivel === "principiante") {
    cont.innerHTML += p.opciones.map(op => `<button onclick="responder('${op}')">${op}</button>`).join("");
  } else {
    cont.innerHTML += `
      <input type="text" id="respuesta" placeholder="Escribí tu respuesta">
      <button onclick="responderManual()">Responder</button>
      <p class="pista">Pista: ${p.pista}</p>
    `;
  }

  setTimeout(() => {
    if (indice < preguntas.length) {
      indice++;
      mostrarPregunta();
    } else {
      mostrarFinal();
    }
  }, tiempoLimite);
}

function responder(opcion) {
  if (opcion === preguntas[indice].respuesta) correctas++;
  indice++;
  if (indice < preguntas.length) {
    mostrarPregunta();
  } else {
    mostrarFinal();
  }
}

function responderManual() {
  const respuesta = document.getElementById("respuesta").value.trim().toLowerCase();
  const correcta = preguntas[indice].respuesta.toLowerCase();
  if (respuesta === correcta) correctas++;
  indice++;
  if (indice < preguntas.length) {
    mostrarPregunta();
  } else {
    mostrarFinal();
  }
}

function mostrarFinal() {
  document.getElementById("trivia").style.display = "none";
  document.getElementById("final").style.display = "block";
  document.getElementById("resultado").innerText = `${nombre}, acertaste ${correctas} de ${cantidad} preguntas.`;
  lanzarConfeti();
}

function lanzarConfeti() {
  import('https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.module.mjs').then(({default: confetti}) => {
    confetti({ particleCount: 200, spread: 70, origin: { y: 0.6 } });
  });
}
