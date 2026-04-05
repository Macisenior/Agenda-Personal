
import { db } from "./firebase.js";

import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const inputNota = document.getElementById("inputNota");
const inputFecha = document.getElementById("inputFechaNota");
const btnAgregar = document.getElementById("btnAgregarNota");
const lista = document.getElementById("listaNotas");
const buscador = document.getElementById("buscadorNotas");

let notas = [];
let editandoId = null;

// 🔹 añadir / editar
btnAgregar.addEventListener("click", async () => {
  const texto = inputNota.value;
  const fecha = inputFecha.value;

  if (!texto) return;

  if (editandoId) {

await updateDoc(doc(db, "notas", editandoId), {
  texto,
  fecha,
  importante: inputImportante.checked
});


    editandoId = null;
    btnAgregar.textContent = "Añadir nota";
  } else {
    await addDoc(collection(db, "notas"), {
      texto,
      fecha,
      importante: false,
      createdAt: Date.now()
    });
  }
inputNota.value = "";
inputFecha.value = "";
inputImportante.checked = false;
 
  cargarNotas();
});

// 🔹 cargar

async function cargarNotas() {
  notas = [];

  const snap = await getDocs(collection(db, "notas"));

  snap.forEach(docu => {
    notas.push({
      id: docu.id,
      ...docu.data()
    });
  });

  // 🔥 AQUÍ (no antes)
  notas = notas.map(n => ({
    importante: false,
    ...n
  }));

  pintarNotas();
}



// 🔹 pintar
function pintarNotas(filtro = "") {
  lista.innerHTML = "";

  let filtradas = notas.filter(n => 
    n.texto.toLowerCase().includes(filtro.toLowerCase())
  );

  // 📌 ordenar: importantes arriba + nuevas primero
  filtradas.sort((a, b) => {
    if (a.importante !== b.importante) {
      return b.importante - a.importante;
    }
    return b.createdAt - a.createdAt;
  });


filtradas.forEach(nota => {
  const li = document.createElement("li");

  // ⭐ clase importante
if (nota.importante === true) {
    li.classList.add("importante");
  }

  // 📝 texto
  const texto = document.createElement("span");
  texto.textContent = nota.texto;

  // 📅 fecha
  const fecha = document.createElement("div");
  fecha.className = "nota-fecha";
  fecha.textContent = nota.fecha || "";

  // 🔘 contenedor botones
  const contBotones = document.createElement("div");
  contBotones.className = "nota-botones";

  // ⭐ importante
  const btnStar = document.createElement("button");
  btnStar.textContent = nota.importante ? "⭐" : "☆";
  btnStar.className = "btn-star";

  btnStar.addEventListener("click", async (e) => {
    e.stopPropagation();
    await updateDoc(doc(db, "notas", nota.id), {
      importante: !nota.importante
    });
    cargarNotas();
  });

  // ✏️ editar
  const btnEditar = document.createElement("button");
  btnEditar.textContent = "✏️";
  btnEditar.className = "btn-edit";

  btnEditar.addEventListener("click", (e) => {
    e.stopPropagation();
    inputNota.value = nota.texto;
    inputFecha.value = nota.fecha;
    inputImportante.checked = nota.importante || false;
    editandoId = nota.id;
    btnAgregar.textContent = "Guardar";
  });

  // ❌ eliminar
  const btnEliminar = document.createElement("button");
  btnEliminar.textContent = "🗑️";
  btnEliminar.className = "btn-delete";

  btnEliminar.addEventListener("click", async (e) => {
    e.stopPropagation();
    await deleteDoc(doc(db, "notas", nota.id));
    cargarNotas();
  });

  contBotones.appendChild(btnStar);
  contBotones.appendChild(btnEditar);
  contBotones.appendChild(btnEliminar);

  li.appendChild(texto);
  li.appendChild(fecha);
  li.appendChild(contBotones);

  lista.appendChild(li);
});


}

// 🔎 buscador
buscador.addEventListener("input", (e) => {
  pintarNotas(e.target.value);
});

// 🔥 inicio
cargarNotas();
