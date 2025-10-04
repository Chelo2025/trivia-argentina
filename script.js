let preguntas = [];
let respuestasUsuario = [];
let nombre = "";
let cantidad = 0;
let indice = 0;
let correctas = 0;
let nivel = "principiante";

const campos = {
  signo: ["¿Qué signo zodiacal tenía {nombre}, nacido el {fecha_nacimiento}?", "signo"],
  nacionalidad: ["¿De qué nacionalidad era {nombre}?", "nacionalidad"],
  siglo: ["¿En qué siglo nació {nombre}?", "siglo"],
  edad_historica: ["¿A qué edad histórica pertenece {nombre}?", "edad_historica"],
  categoria: ["¿Cuál era la categoría profesional de {nombre}?", "categoria"]
};

const opcionesGlobales = {
  signo: ["Aries","Tauro","Géminis","Cáncer","Leo","Virgo","Libra","Escorpio","Sagitario","Capricornio","Acuario","Piscis"],
  nacionalidad: ["argentino","mexicano","italiano","francés","alemán","español","británico","estadounidense","japonés","ruso","checo","austriaco","brasileño"],
  siglo: ["Siglo XV","Siglo XVI","Siglo XVII","Siglo XVIII","Siglo XIX","Siglo XX"],
  edad_historica: ["Edad Media","Edad Moderna","Edad Contemporánea"],
  categoria: ["compositor","cantante","instrumentista","director"]
};

async function comenzarTrivia() {
  nombre = document.getElementById("nombre").value.trim();
  const tema = document.getElementById("tema").value;
  cantidad = parseInt(document.getElementById("cantidad").value);
  nivel = document.getElementById("nivel").value;

  const res = await fetch(`data/${tema}.json`);
  const data = await res.json();

  preguntas = generarPreguntasAleatorias(data).slice(0, cantidad);
  respuestasUsuario = [];
  indice = 0;
  correctas = 0;

  document.getElementById("inicio").style.display = "none";
  document.getElementById("trivia").style.display = "block";
  document.getElementById("final").style.display = "none";
  document.getElementById("saludo").innerText = `¡Vamos ${nombre}! Tema: ${tema}`;

  mostrarPregunta();
}

function generarPreguntasAleatorias(data) {
  return data.map(item => {
    const claves = Object.keys(campos).filter(c => item[c]);
    const clave = claves[Math.floor(Math.random() * claves.length)];
    const [plantilla, campoRespuesta] = campos[clave];
    const pregunta = plantilla
      .replace("{nombre}", item.nombre || "este personaje")
      .replace("{fecha_nacimiento}", item.fecha_nacimiento || "una fecha desconocida");
    const respuesta = item[campoRespuesta];
    const opciones = generarOpciones(campoRespuesta, respuesta);
    return {
      pregunta,
      respuesta,
      opciones,
      pista: `Empieza con "${respuesta.slice(0, 3)}..."`,
    };
  }).sort(() => 0.5 - Math.random());
}

function generarOpciones(campo, correcta) {
  const todas = opcionesGlobales[campo] || [];
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
  cont.innerHTML = `<h3>Pregunta ${indice + 1} de ${preguntas.length}</h3><p>${p.pregunta}</p>`;

  if (nivel === "principiante") {
    p.opciones.forEach(op => {
      const btn = document.createElement("button");
      btn.textContent = op;
      btn.onclick = () => responder(op);
      cont.appendChild(btn);
    });
  } else {
    cont.innerHTML += `
      <input type="text" id="respuesta" placeholder="Escribí tu respuesta">
      <button onclick="responderManual()">Responder</button>
      <p class="pista">Pista: ${p.pista}</p>
    `;
  }
}

function responder(opcion) {
  registrarRespuesta(opcion);
  avanzar();
}

function responderManual() {
  const respuesta = document.getElementById("respuesta").value.trim();
  registrarRespuesta(respuesta);
  avanzar();
}

function registrarRespuesta(usuario) {
  const correcta = preguntas[indice].respuesta;
  const esCorrecta = usuario.toLowerCase() === correcta.toLowerCase();
  if (esCorrecta) correctas++;
  respuestasUsuario.push({
    pregunta: preguntas[indice].pregunta,
    respuestaCorrecta: correcta,
    respuestaUsuario: usuario,
    esCorrecta
  });
}

function avanzar() {
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

  let resultado = `<strong>${nombre}, acertaste ${correctas} de ${preguntas.length} preguntas.</strong><br><br><ul>`;
  respuestasUsuario.forEach((r, i) => {
    resultado += `<li><strong>${i + 1}:</strong> ${r.pregunta}<br>
    Tu respuesta: <em>${r.respuestaUsuario}</em> ${r.esCorrecta ? "✅" : "❌"}<br>
    Respuesta correcta: <strong>${r.respuestaCorrecta}</strong></li><br>`;
  });
  resultado += `</ul>`;
  document.getElementById("resultado").innerHTML = resultado;
  lanzarConfeti();
}

function volverInicio() {
  document.getElementById("inicio").style.display = "block";
  document.getElementById("trivia").style.display = "none";
  document.getElementById("final").style.display = "none";
}

function lanzarConfeti() {
  import('https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.module.mjs').then(({default: confetti}) => {
    confetti({ particleCount: 200, spread: 70, origin: { y: 0.6 } });
  });
}
