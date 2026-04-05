
import { db } from "./firebase.js";

import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const input = document.getElementById("inputTarea");
const inputFecha = document.getElementById("inputFecha");
const inputHora = document.getElementById("inputHora");
const boton = document.getElementById("btnAgregar");

const listaHoy = document.getElementById("listaHoy");
const listaManana = document.getElementById("listaManana");
const listaProximos = document.getElementById("listaProximos");

const verMasContainer = document.getElementById("verMasContainer");
const verMasMananaContainer = document.getElementById("verMasMananaContainer");

const resumenHoy = document.getElementById("resumenHoy");

let tareas = [];
let mostrarTodoProximos = false;
let mostrarTodoManana = false;
let timersActivos = {};
// 🔔 permiso
async function pedirPermiso() {
  await Notification.requestPermission();
}

// 🔹 fechas
function hoy() {
  return new Date().toISOString().split("T")[0];
}

function manana() {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + 1);
  return fecha.toISOString().split("T")[0];
}

// 🔥 crear timestamp
function crearTimestamp(fecha, hora) {
  const [year, month, day] = fecha.split("-");
  const [h, m] = hora.split(":");
  return new Date(year, month - 1, day, h, m).getTime();
}

// 🔔 notificación
async function mostrarNotificacion(texto) {
  if (Notification.permission === "granted") {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      registration.showNotification("📅 Agenda", {
        body: texto,
        icon: "icon-192.png"
      });
    }
  }
}

// 🔄 marcar como notificada
async function marcarComoNotificada(id) {
  await updateDoc(doc(db, "tareas", id), {
    notified: true
  });
}

// 🔥 programar notificaciones PRO
function programarNotificaciones(tareas) {
  const ahora = Date.now();

  tareas.forEach(tarea => {
    if (!tarea.timestamp || tarea.notified) return;

    // 🚫 evitar duplicados
    if (timersActivos[tarea.id]) return;

    const tiempoRestante = tarea.timestamp - ahora;

    if (tiempoRestante <= 0) return;

    timersActivos[tarea.id] = true;

    // ⏰ exacta
    setTimeout(() => {
      mostrarNotificacion("⏰ " + tarea.texto);
      marcarComoNotificada(tarea.id);
      delete timersActivos[tarea.id];
    }, tiempoRestante);

    // ⏳ aviso previo
    const avisoPrevio = tiempoRestante - (5 * 60 * 1000);

    if (avisoPrevio > 0) {
      setTimeout(() => {
        mostrarNotificacion("⏳ En 5 min: " + tarea.texto);
      }, avisoPrevio);
    }
  });
}

// 🔹 pintar (igual que tenías)
function pintarTareas() {
  listaHoy.innerHTML = "";
  listaManana.innerHTML = "";
  listaProximos.innerHTML = "";
  verMasContainer.innerHTML = "";
  verMasMananaContainer.innerHTML = "";

  let tareasProximas = [];
  let tareasManana = [];
  let pendientesHoy = 0;

  tareas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  tareas.forEach((tarea) => {
    const li = document.createElement("li");

    const span = document.createElement("span");
    span.textContent = tarea.texto + " ⏰ " + (tarea.hora || "");
    li.appendChild(span);

    if (tarea.fecha === hoy() && !tarea.hecho) pendientesHoy++;

    if (tarea.hecho) {
      li.style.textDecoration = "line-through";
      li.style.opacity = "0.5";
    } else if (tarea.fecha === hoy()) {
      li.style.background = "#ffe5e5";
      li.style.border = "2px solid red";
    }

    li.addEventListener("click", async function () {
      await updateDoc(doc(db, "tareas", tarea.id), {
        hecho: !tarea.hecho
      });
      cargarTareas();
    });

    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "X";

    btnEliminar.addEventListener("click", async function (e) {
      e.stopPropagation();
      await deleteDoc(doc(db, "tareas", tarea.id));
      cargarTareas();
    });

    li.appendChild(btnEliminar);

    if (tarea.fecha === hoy()) {
      listaHoy.appendChild(li);
    } else if (tarea.fecha === manana()) {
      tareasManana.push(li);
    } else {
      tareasProximas.push(li);
    }
  });

  resumenHoy.textContent = pendientesHoy === 0 
    ? "🟢 Todo al día"
    : "🔴 Hoy: " + pendientesHoy + " pendientes";

  let mostrarManana = mostrarTodoManana ? tareasManana : tareasManana.slice(0, 3);
  mostrarManana.forEach(li => listaManana.appendChild(li));

  if (tareasManana.length > 3) {
    const btn = document.createElement("button");
    btn.textContent = mostrarTodoManana ? "Ver menos" : "Ver más";
    btn.addEventListener("click", () => {
      mostrarTodoManana = !mostrarTodoManana;
      pintarTareas();
    });
    verMasMananaContainer.appendChild(btn);
  }

  

 
}

// 🔹 añadir tarea (ACTUALIZADO)
boton.addEventListener("click", async function () {
  const texto = input.value;
  const fecha = inputFecha.value || hoy();
  const hora = inputHora.value || "09:00";

  if (texto === "") return;

  const timestamp = crearTimestamp(fecha, hora);

  await addDoc(collection(db, "tareas"), {
    texto,
    fecha,
    hora,
    timestamp,
    hecho: false,
    notified: false
  });

  input.value = "";
  inputFecha.value = hoy();
  inputHora.value = "09:00";

  cargarTareas();
});

// 🔹 cargar
async function cargarTareas() {
  tareas = [];

  const querySnapshot = await getDocs(collection(db, "tareas"));

  querySnapshot.forEach((docu) => {
    tareas.push({
      id: docu.id,
      ...docu.data()
    });
  });

  pintarTareas();
  programarNotificaciones(tareas); // 🔥 clave
}

// 🔹 inicio
window.onload = function () { 
  input.focus();
  inputFecha.value = hoy();
  inputHora.value = "09:00";
  pedirPermiso();
};

// 🔹 navegación
const btnIrNotas = document.getElementById("btnIrNotas");

if (btnIrNotas) {
  btnIrNotas.addEventListener("click", () => {
    window.location.href = "notas.html";
  });
}

// 🔥 iniciar
cargarTareas();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js");
}
