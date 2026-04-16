
import { db } from "./firebase.js";

import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc ,
   setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js";

 const messaging = getMessaging();
const input = document.getElementById("inputTarea");
const inputFecha = document.getElementById("inputFecha");
const inputHora = document.getElementById("inputHora");
const boton = document.getElementById("btnAgregar");

const listaHoy = document.getElementById("listaHoy");
const listaManana = document.getElementById("listaManana");
const listaProximos = document.getElementById("listaProximos");

const verMasContainer = document.getElementById("verMasContainer");
const verMasMananaContainer = document.getElementById("verMasMananaContainer");
const btnIrContactos = document.getElementById("btnIrContactos");

if (btnIrContactos) {
  btnIrContactos.addEventListener("click", () => {
    window.location.href = "contactos.html";
  });
}
const inputAviso = document.getElementById("inputAviso");
const btnIrCalendario = document.getElementById("btnIrCalendario");

if (btnIrCalendario) {
  btnIrCalendario.addEventListener("click", () => {
    window.location.href = "calendario.html";
  });
}


 

const resumenHoy = document.getElementById("resumenHoy");
navigator.serviceWorker.register("./firebase-messaging-sw.js");
let tareas = [];
let mostrarTodoProximos = false;
let mostrarTodoManana = false;
let timersActivos = {};
let registration;

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js")
    .then(reg => {
      registration = reg;
      console.log("Service Worker registrado");
    });
}
// 🔔 permiso
async function pedirPermiso() {
  await Notification.requestPermission();
}

// 🔹 fechas
function hoy() {
  const fecha = new Date();
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function manana() {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + 1);

  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
setInterval(() => {
  cargarTareas();
}, 60000);
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

    // evitar duplicados
    if (timersActivos[tarea.id]) return;

    const tiempoRestante = tarea.timestamp - ahora;

    // evitar pasado
    if (tiempoRestante <= 0) return;

    timersActivos[tarea.id] = {};

    // ⏰ NOTIFICACIÓN EXACTA
    timersActivos[tarea.id].exacto = setTimeout(() => {
      mostrarNotificacion("⏰ " + tarea.texto);
      marcarComoNotificada(tarea.id);
      delete timersActivos[tarea.id];
    }, tiempoRestante);

    // 🔔 AVISOS INTELIGENTES
    const avisos = [
      { tiempo: 24 * 60 * 60 * 1000, texto: "📅 Mañana: " },
      { tiempo: 60 * 60 * 1000, texto: "⏳ En 1 hora: " },
      { tiempo: 5 * 60 * 1000, texto: "⏳ En 5 min: " }
    ];

    avisos.forEach(aviso => {
      const tiempoAviso = tiempoRestante - aviso.tiempo;

      if (tiempoAviso > 0) {
        setTimeout(() => {
          mostrarNotificacion(aviso.texto + tarea.texto);
        }, tiempoAviso);
      }
    });
  });
}
function limpiarTimers() {
  Object.values(timersActivos).forEach(t => {
    if (t.exacto) clearTimeout(t.exacto);
    if (t.previo) clearTimeout(t.previo);
  });
   timersActivos = {};
 }
 
async function activarNotificacionesPush() {
  try {
    const permiso = await Notification.requestPermission();

    if (permiso === "granted") {

      const registration = await navigator.serviceWorker.ready;

      const token = await getToken(messaging, {
        vapidKey: "BMwWV2k0c0nnGpzoOzk3t19Rb456zhbwO_C-abo2lqmvsgsdoPTZpjPyBaESicn3Ml-njY40ygQ6Ztd0VMvHUbU",
        serviceWorkerRegistration: registration
      });

      console.log("TOKEN:", token);

      // 🔥 GUARDAR TOKEN EN FIREBASE
      await setDoc(doc(db, "tokens", token), {
        token: token
      });

    } else {
      console.log("Permiso denegado");
    }

  } catch (error) {
    console.error("Error en push:", error);
  }
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
  const aviso = parseInt(inputAviso.value);

  if (texto === "") return;

  const timestamp = crearTimestamp(fecha, hora);

  await addDoc(collection(db, "tareas"), {
    texto,
    fecha,
    hora,
    timestamp,
    aviso, // 🔥 ahora sí
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
 limpiarTimers(); 
  tareas = [];

  const querySnapshot = await getDocs(collection(db, "tareas"));

  querySnapshot.forEach((docu) => {
    tareas.push({
      id: docu.id,
      ...docu.data()
    });
  });

  pintarTareas();
 // programarNotificaciones(tareas); // 🔥 clave
}

// 🔹 inicio
window.onload = function () { 
  input.focus();
  inputFecha.value = hoy();
  inputHora.value = "09:00";
  pedirPermiso();
  activarNotificacionesPush();
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

window.setHoy = function () {
  inputFecha.value = hoy();
};

window.setManana = function () {
  inputFecha.value = manana();
};


