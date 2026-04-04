import { db } from "./firebase.js";
import { collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const input = document.getElementById("inputNota");
const inputFecha = document.getElementById("inputFechaNota");
const boton = document.getElementById("btnAgregarNota");
const listaNotas = document.getElementById("listaNotas");
const resumenNotas = document.getElementById("resumenNotas");

let notas = [];

// 🔹 Añadir nota
boton.addEventListener("click", async () => {
  const texto = input.value;
  const fecha = inputFecha.value || new Date().toISOString().split("T")[0];

  if (!texto) return;

  const importante = document.getElementById("inputImportante").checked;

await addDoc(collection(db, "notas"), {
  texto: texto,
  fecha: fecha,
  importante: importante
});
  input.value = "";
  inputFecha.value = "";
  document.getElementById("inputImportante").checked = false;
  cargarNotas();
});

// 🔹 Cargar notas desde Firestore
async function cargarNotas() {
  notas = [];
  const querySnapshot = await getDocs(collection(db, "notas"));

  querySnapshot.forEach((docu) => {
    notas.push({
      id: docu.id,
      ...docu.data()
    });
  });

  pintarNotas();
}

// 🔹 Pintar notas en la lista
function pintarNotas() {
  listaNotas.innerHTML = "";

  notas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  notas.forEach(nota => {
    const li = document.createElement("li");

    // texto
    li.textContent = nota.texto;

    // ⭐ importante
    if (nota.importante) {
      li.style.borderLeft = "6px solid #e74c3c"; // borde rojo
      li.textContent = "⭐ " + li.textContent;     // icono estrella
    }

    // colorear según fecha
    const hoyStr = new Date().toISOString().split("T")[0];
    let fechaClass = "proximo";

    if (nota.fecha === hoyStr) fechaClass = "hoy";

    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    if (nota.fecha === manana.toISOString().split("T")[0]) fechaClass = "mañana";

    li.setAttribute("data-fecha", fechaClass);

    // botón eliminar
    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "X";
    btnEliminar.addEventListener("click", async () => {
      await deleteDoc(doc(db, "notas", nota.id));
      cargarNotas();
    });
    li.appendChild(btnEliminar);

    listaNotas.appendChild(li);
  });
}

  resumenNotas.textContent = `Notas: ${notas.length}`;


// 🔹 Botón volver
function volver() {
  window.location.href = "index.html"; // vuelve a tu app principal
}
window.volver = volver;

// 🔹 Enter para añadir
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") boton.click();
});

// 🔹 Focus al cargar
window.onload = () => {
  input.focus();
  inputFecha.value = new Date().toISOString().split("T")[0];
  cargarNotas();
};