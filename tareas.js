
import { db } from "./firebase.js";

import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const lista = document.getElementById("listaTareas");
const buscador = document.getElementById("buscadorTareas");

let tareas = [];

// 🔹 cargar
async function cargarTareas() {
  tareas = [];

  const snap = await getDocs(collection(db, "tareas"));

  snap.forEach(docu => {
    tareas.push({
      id: docu.id,
      ...docu.data()
    });
  });

  pintarTareas();
}

// 🔹 pintar
function pintarTareas(filtro = "") {
  lista.innerHTML = "";

  let filtradas = tareas.filter(t => 
    t.texto.toLowerCase().includes(filtro.toLowerCase())
  );

  // ordenar por fecha
  filtradas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  filtradas.forEach(tarea => {
    const li = document.createElement("li");

    // 📝 texto
    const texto = document.createElement("span");
   
texto.textContent = `${tarea.texto}`;
const hoyStr = new Date().toISOString().split("T")[0];

if (tarea.fecha === hoyStr) {
  fecha.style.color = "red";
} 
const fecha = document.createElement("div");
fecha.style.fontSize = "12px";
fecha.style.opacity = "0.6";
fecha.textContent = `📅 ${tarea.fecha} ⏰ ${tarea.hora || ""}`;

li.appendChild(texto);
li.appendChild(fecha);
    // 🔘 botones
    const cont = document.createElement("div");

    // ✔️ hecho
    const btnCheck = document.createElement("button");
    btnCheck.textContent = tarea.hecho ? "✅" : "⬜";

    btnCheck.addEventListener("click", async (e) => {
      e.stopPropagation();
      await updateDoc(doc(db, "tareas", tarea.id), {
        hecho: !tarea.hecho
      });
      cargarTareas();
    });

    // ❌ eliminar
    const btnDelete = document.createElement("button");
    btnDelete.textContent = "🗑️";

    btnDelete.addEventListener("click", async (e) => {
      e.stopPropagation();
      await deleteDoc(doc(db, "tareas", tarea.id));
      cargarTareas();
    });

    cont.appendChild(btnCheck);
    cont.appendChild(btnDelete);

    li.appendChild(texto);
    li.appendChild(cont);

    // estilo si hecha
    if (tarea.hecho) {
      li.style.textDecoration = "line-through";
      li.style.opacity = "0.5";
    }

    lista.appendChild(li);
  });
}

// 🔎 buscador
buscador.addEventListener("input", (e) => {
  pintarTareas(e.target.value);
});

// 🔥 iniciar
cargarTareas();

