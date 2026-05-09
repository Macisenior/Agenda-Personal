import { db } from "./firebase.js";
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const calendario = document.getElementById("calendario");
const contenedor = document.getElementById("tareasDia");
let fechaActual = new Date();

const tituloMes = document.getElementById("tituloMes");
let tareas = [];

// 🔹 generar calendario
function generarCalendario() {
 const hoy = new Date();

const mes = fechaActual.getMonth();
const año = fechaActual.getFullYear();

 let primerDia = new Date(año, mes, 1).getDay();

primerDia = primerDia === 0 ? 6 : primerDia - 1;
  const diasMes = new Date(año, mes + 1, 0).getDate();

  calendario.innerHTML = "";
const nombresMeses = [
  "Enero", "Febrero", "Marzo",
  "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre",
  "Octubre", "Noviembre", "Diciembre"
];

tituloMes.textContent = `${nombresMeses[mes]} ${año}`;
  // espacios vacíos inicio
  for (let i = 0; i < primerDia; i++) {
    calendario.innerHTML += "<div></div>";
  }

  // días del mes
  
  for (let d = 1; d <= diasMes; d++) {

    const fecha = `${año}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    const tareasDelDia = tareas.filter(t => t.fecha === fecha);

    let clase = "dia";

    // hoy
    const esHoy = d === hoy.getDate() && mes === hoy.getMonth();
    if (esHoy) clase += " hoy";

    // tareas
    if (tareasDelDia.length > 0) {
      clase += " tiene-tareas";
    }

    const div = document.createElement("div");
    div.className = clase;
    div.innerHTML = `
  ${d}
  ${tareasDelDia.length > 0 ? `<span class="contador">${tareasDelDia.length}</span>` : ""}
`;

    div.addEventListener("click", () => {
      mostrarTareasDelDia(fecha);
    });

    calendario.appendChild(div);
  }
}

// 🔹 mostrar tareas
function mostrarTareasDelDia(fecha) {
  const tareasDelDia = tareas.filter(t => t.fecha === fecha);

  contenedor.innerHTML = `<h3>📅 Tareas</h3>`;

  if (tareasDelDia.length === 0) {
    contenedor.innerHTML += "<p>No hay tareas</p>";
    return;
  }

  tareasDelDia.forEach(t => {
    const label = document.createElement("label");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = t.hecho || false;

    // 🔥 aquí luego guardaremos en Firebase
   checkbox.addEventListener("change", async () => {
  const tareaRef = doc(db, "tareas", t.id);

  await updateDoc(tareaRef, {
    hecho: checkbox.checked
  });

  texto.style.textDecoration = checkbox.checked ? "line-through" : "none";
  texto.style.opacity = checkbox.checked ? "0.6" : "1";
});

   label.style.display = "flex";
label.style.alignItems = "center";
label.style.gap = "10px";

label.appendChild(checkbox);

const texto = document.createElement("span");
texto.textContent = t.texto;

label.appendChild(texto);

    contenedor.appendChild(label);
  });
}

// 🔹 cargar tareas
async function cargarTareas() {
  tareas = [];

  const snapshot = await getDocs(collection(db, "tareas"));

  snapshot.forEach(docu => {
    tareas.push({
      id: docu.id, // 🔥 IMPORTANTE
      ...docu.data()
    });
  });

  generarCalendario();
}

// 🔹 iniciar
cargarTareas();
document.getElementById("btnAnterior").addEventListener("click", () => {
  fechaActual.setMonth(fechaActual.getMonth() - 1);
  generarCalendario();
});

document.getElementById("btnSiguiente").addEventListener("click", () => {
  fechaActual.setMonth(fechaActual.getMonth() + 1);
  generarCalendario();
});