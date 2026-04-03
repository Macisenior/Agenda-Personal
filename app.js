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
// 🔔 permiso notificaciones
async function pedirPermiso() {
  const permiso = await Notification.requestPermission();

  if (permiso === "granted") {
    console.log("Permiso concedido 🔔");
  } else {
    console.log("Permiso denegado ❌");
  }
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

// 🔹 pintar
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

    // contar pendientes
    if (tarea.fecha === hoy() && !tarea.hecho) {
      pendientesHoy++;
    }

    // estilos
    if (tarea.hecho) {
      li.style.textDecoration = "line-through";
      li.style.opacity = "0.5";
    } else if (tarea.fecha === hoy()) {
      li.style.background = "#ffe5e5";
      li.style.border = "2px solid red";
    }

    // marcar hecho
    li.addEventListener("click", async function () {
      await updateDoc(doc(db, "tareas", tarea.id), {
        hecho: !tarea.hecho
      });
      cargarTareas();
    });

    // eliminar
    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "X";

    btnEliminar.addEventListener("click", async function (e) {
      e.stopPropagation();
      await deleteDoc(doc(db, "tareas", tarea.id));
      cargarTareas();
    });

    li.appendChild(btnEliminar);

    // separar
    if (tarea.fecha === hoy()) {
      listaHoy.appendChild(li);
    } else if (tarea.fecha === manana()) {
      tareasManana.push(li);
    } else {
      tareasProximas.push(li);
    }
  });

  // 🔴 resumen (AHORA CORRECTO)
  if (pendientesHoy === 0) {
    resumenHoy.textContent = "🟢 Todo al día";
  } else {
    resumenHoy.textContent = "🔴 Hoy: " + pendientesHoy + " pendientes";
  }

  // 🔥 mañana
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

  // 🔥 próximos
  let mostrarProx = mostrarTodoProximos ? tareasProximas : tareasProximas.slice(0, 3);

  mostrarProx.forEach(li => listaProximos.appendChild(li));

  if (tareasProximas.length > 3) {
    const btn = document.createElement("button");
    btn.textContent = mostrarTodoProximos ? "Ver menos" : "Ver más";

    btn.addEventListener("click", () => {
      mostrarTodoProximos = !mostrarTodoProximos;
      pintarTareas();
    });

    verMasContainer.appendChild(btn);
  }
}

// 🔹 añadir
boton.addEventListener("click", async function () {
  const texto = input.value;
  const fecha = inputFecha.value || hoy();

  if (texto === "") return;

 await addDoc(collection(db, "tareas"), {
  texto,
  fecha,
  hora: inputHora.value || "09:00",
  hecho: false
}); 
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
  input.value = "";
  inputFecha.value = hoy();
  input.focus();

  cargarTareas();
});

// 🔹 cargar
async function cargarTareas() {
  tareas = [];
const ahora = horaActual();

tareas.forEach(t => {
  if (
    t.fecha === hoy() &&
    !t.hecho &&
    t.hora &&
    t.hora.slice(0,5) === ahora
  ) {
    mostrarNotificacion("⏰ " + t.texto);
  }
});
  const querySnapshot = await getDocs(collection(db, "tareas"));

  querySnapshot.forEach((docu) => {
    tareas.push({
      id: docu.id,
      ...docu.data()
    });
  });

  pintarTareas();
    const pendientesHoy = tareas.filter(t => 
    t.fecha === hoy() && !t.hecho
  );

  if (pendientesHoy.length > 0) {
    mostrarNotificacion("Tienes " + pendientesHoy.length + " tareas pendientes hoy");
  }
}


// 🔹 enter
input.addEventListener("keydown", function (e) {
  if (e.key === "Enter") boton.click();
});

// 🔹 inicio
window.onload = function () { 
  input.focus();
  inputFecha.value = hoy();
  inputHora.value = "09:00";
  pedirPermiso();
};
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
function setHoy() {
  inputFecha.value = hoy();
}

function setManana() {
  inputFecha.value = manana();
}

window.setHoy = setHoy;
window.setManana = setManana;

// 🔥 iniciar app
cargarTareas();
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js");
}
function horaActual() {
  const ahora = new Date();
  return ahora.toTimeString().slice(0,5);
}setInterval(() => {
  cargarTareas();
}, 60000);