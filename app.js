const input = document.getElementById("inputTarea");
const inputFecha = document.getElementById("inputFecha");
const boton = document.getElementById("btnAgregar");

const listaHoy = document.getElementById("listaHoy");
const listaManana = document.getElementById("listaManana");
const listaProximos = document.getElementById("listaProximos");
const verMasContainer = document.getElementById("verMasContainer");
let mostrarTodoProximos = false;
const resumenHoy = document.getElementById("resumenHoy");
const verMasMananaContainer = document.getElementById("verMasMananaContainer");
let tareas = JSON.parse(localStorage.getItem("tareas")) || [];
let mostrarTodoManana = false;
// 🔹 obtener hoy
function hoy() {
  const fecha = new Date();
  return fecha.toISOString().split("T")[0];
}

// 🔹 obtener mañana
function manana() {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + 1);
  return fecha.toISOString().split("T")[0];
}

// 🔹 pintar tareas
function pintarTareas() {
  let pendientesHoy = 0;
  listaHoy.innerHTML = "";
  listaManana.innerHTML = "";
  listaProximos.innerHTML = "";
  verMasMananaContainer.innerHTML = ""; 
  verMasContainer.innerHTML = ""; 
  let tareasProximas = [];
let tareasManana = [];
  // ordenar por fecha
  tareas.sort((a, b) => {
    return new Date(a.fecha) - new Date(b.fecha);
  });

  tareas.forEach(function(tarea, index) {
    const li = document.createElement("li");

    const span = document.createElement("span");
    span.textContent = tarea.texto;
    li.appendChild(span);
if (tarea.fecha === hoy() && !tarea.hecho) {
  pendientesHoy++;
}
if (pendientesHoy === 0) {
  resumenHoy.textContent = "🟢 Todo al día";
} else {
  resumenHoy.textContent = "🔴 Hoy: " + pendientesHoy + " pendientes";
}
    // tachado
   if (tarea.hecho) {
  li.style.textDecoration = "line-through";
  li.style.opacity = "0.5";
} else if (tarea.fecha === hoy()) {
  li.style.background = "#ffe5e5"; // rojo suave
  li.style.border = "2px solid red";
}
    // marcar hecho
    li.addEventListener("click", function() {
      tareas[index].hecho = !tareas[index].hecho;
      guardarYActualizar();
    });

    // botón eliminar
    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "X";
    btnEliminar.style.marginLeft = "10px";

    btnEliminar.addEventListener("click", function(e) {
      e.stopPropagation();
      tareas.splice(index, 1);
      guardarYActualizar();
    });

    li.appendChild(btnEliminar);

    // separar por fecha
    if (tarea.fecha === hoy()) {
      listaHoy.appendChild(li);
    }
     else if (tarea.fecha === manana()) {
     tareasManana.push(li);
    } else {
      tareasProximas.push(li);
    }
  });
// 🔥 mostrar mañana (limitado o completo)
let tareasMostrarManana = mostrarTodoManana
  ? tareasManana
  : tareasManana.slice(0, 3);

tareasMostrarManana.forEach(li => {
  listaManana.appendChild(li);
});

// 🔥 botón ver más
if (tareasManana.length > 3) {
  const btnVerMasManana = document.createElement("button");
  btnVerMasManana.textContent = mostrarTodoManana ? "Ver menos" : "Ver más";

  btnVerMasManana.addEventListener("click", function() {
    mostrarTodoManana = !mostrarTodoManana;
    pintarTareas();
  });

verMasMananaContainer.appendChild(btnVerMasManana);
  
}
  // 🔥 mostrar próximos (limitado o completo)
  let tareasMostrar = mostrarTodoProximos
    ? tareasProximas
    : tareasProximas.slice(0, 3);

  tareasMostrar.forEach(li => {
    listaProximos.appendChild(li);
  });

  // 🔥 botón ver más
  if (tareasProximas.length > 3) {
    const btnVerMas = document.createElement("button");
    btnVerMas.textContent = mostrarTodoProximos ? "Ver menos" : "Ver más";

    btnVerMas.addEventListener("click", function() {
      mostrarTodoProximos = !mostrarTodoProximos;
      pintarTareas();
    });

    verMasContainer.appendChild(btnVerMas);
  }
}
// 🔹 guardar
function guardarYActualizar() {
  localStorage.setItem("tareas", JSON.stringify(tareas));
  pintarTareas();
}

// 🔹 añadir tarea
boton.addEventListener("click", function() {
  const texto = input.value;
  const fecha = inputFecha.value || hoy();

  if (texto === "") return;

  tareas.push({
    texto: texto,
    fecha: fecha,
    hecho: false
  });

  // 🔥 limpiar y actualizar
  input.value = "";
 inputFecha.value = hoy();
  input.focus();

  guardarYActualizar();
});

// 🔹 ENTER para añadir
input.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    boton.click();
  }
});

// 🔹 focus al cargar
window.onload = function() {
  input.focus();
  inputFecha.value = hoy(); // 🔥 esto es lo nuevo
};

// 🔹 botones rápidos
function setHoy() {
  inputFecha.value = hoy();
}

function setManana() {
  inputFecha.value = manana();
}

// 🔹 iniciar
pintarTareas();