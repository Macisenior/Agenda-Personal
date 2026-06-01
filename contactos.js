import { db } from "./firebase.js";
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let contactoEditando = null;
let categoriaSeleccionada = "Todos";

const inputNombre = document.getElementById("inputNombre");
const inputTelefono = document.getElementById("inputTelefono");
const inputDireccion = document.getElementById("inputDireccion");
const btnGuardar = document.getElementById("btnGuardar");
const lista = document.getElementById("listaContactos");
const inputBuscar = document.getElementById("inputBuscar");
const inputCP = document.getElementById("inputCP");
const inputPoblacion = document.getElementById("inputPoblacion");
const inputProvincia = document.getElementById("inputProvincia");
const inputCategoria = document.getElementById("inputCategoria");
const inputCategoriaLibre = document.getElementById("inputCategoriaLibre");

inputCategoria.addEventListener("change", () => {

  if (inputCategoria.value === "Personalizada") {
    inputCategoriaLibre.style.display = "block";
  } else {
    inputCategoriaLibre.style.display = "none";
  }

});
document.querySelectorAll("#filtrosCategorias button").forEach(btn => {

  btn.addEventListener("click", () => {

    categoriaSeleccionada = btn.dataset.cat;

    cargarContactos();

  });

});
// 🔹 guardar contacto
btnGuardar.addEventListener("click", async () => {

  if (!inputNombre.value) return;

  if (contactoEditando) {
    await updateDoc(doc(db, "contactos", contactoEditando), {
      nombre: inputNombre.value,
      telefono: inputTelefono.value,
    direccion: inputDireccion.value,
    cp: inputCP.value,
    poblacion: inputPoblacion.value,
    provincia: inputProvincia.value,
    categoria:
  inputCategoria.value === "Personalizada"
    ? inputCategoriaLibre.value
    : inputCategoria.value
    });

    contactoEditando = null;

  } else {
    await addDoc(collection(db, "contactos"), {
      nombre: inputNombre.value,
      telefono: inputTelefono.value,
      direccion: inputDireccion.value,
      cp: inputCP.value,
      poblacion: inputPoblacion.value,
     provincia: inputProvincia.value,
    categoria:
  inputCategoria.value === "Personalizada"
    ? inputCategoriaLibre.value
    : inputCategoria.value
    });
  }

  limpiarInputs();
  cargarContactos();
});

// 🔹 cargar contactos
async function cargarContactos() {
  lista.innerHTML = "";

  const snapshot = await getDocs(collection(db, "contactos"));
  const filtro = inputBuscar.value.toLowerCase();

  snapshot.forEach(docu => {
    const c = docu.data();

  const coincideBusqueda =
  c.nombre.toLowerCase().includes(filtro) ||
  (c.telefono && c.telefono.includes(filtro)) ||
  (c.direccion && c.direccion.toLowerCase().includes(filtro));
const categoriasFijas = [
  "Favoritos",
  "Familia",
  "Profesionales",
  "Necesarios",
  "Trabajo",
  "Otros"
];

let coincideCategoria = false;

if (categoriaSeleccionada === "Todos") {

  coincideCategoria = true;

} else if (categoriaSeleccionada === "Personalizadas") {

  coincideCategoria =
    c.categoria &&
    !categoriasFijas.includes(c.categoria);

} else {

  coincideCategoria =
    (c.categoria || "Otros") === categoriaSeleccionada;

}

if (coincideBusqueda && coincideCategoria)  {

      const li = document.createElement("li");

     const info = document.createElement("div");

info.innerHTML = `
  <strong>${c.nombre}</strong><br>
  ${c.categoria || "📌 Otros"}<br>
  📞 ${c.telefono || "-"}<br>
  📍 ${c.direccion || ""} ${c.cp || ""} ${c.poblacion || ""} ${c.provincia || ""}
`;

li.appendChild(info);

      // ✏️ editar
      li.addEventListener("click", () => {
        inputNombre.value = c.nombre;
        inputTelefono.value = c.telefono || "";
        inputDireccion.value = c.direccion || "";
        inputCP.value = c.cp || "";
        inputPoblacion.value = c.poblacion || "";
        inputProvincia.value = c.provincia || "";
        inputCategoria.value = c.categoria || "Otros";
        contactoEditando = docu.id;
      });

    // 🔘 contenedor de botones
const contBotones = document.createElement("div");
contBotones.className = "botones-contacto";

// 📞 llamar
if (c.telefono) {
  const btnLlamar = document.createElement("button");
  btnLlamar.textContent = "📞";

  btnLlamar.addEventListener("click", (e) => {
    e.stopPropagation();
    window.open(`tel:${c.telefono}`);
  });

  contBotones.appendChild(btnLlamar); // 🔥 AQUÍ (antes iba a li)
}

// 📍 mapa
if (c.direccion) {
  const btnMapa = document.createElement("button");
  btnMapa.textContent = "📍";

  btnMapa.addEventListener("click", (e) => {
    e.stopPropagation();

    const direccionCompleta = `
      ${c.direccion || ""} 
      ${c.cp || ""} 
      ${c.poblacion || ""} 
      ${c.provincia || ""}
    `;

    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccionCompleta)}`;

    window.open(url, "_blank");
  });

  contBotones.appendChild(btnMapa); // 🔥 AQUÍ
}
      // 🗑️ eliminar
      const btnEliminar = document.createElement("button");
      btnEliminar.textContent = "X";

      btnEliminar.addEventListener("click", async (e) => {
        e.stopPropagation();
        await deleteDoc(doc(db, "contactos", docu.id));
        cargarContactos();
      });

    contBotones.appendChild(btnEliminar);
li.appendChild(contBotones);
      lista.appendChild(li);
    }
  });
}

// 🔹 limpiar inputs
function limpiarInputs() {
  inputNombre.value = "";
  inputTelefono.value = "";
  inputDireccion.value = "";
}

// 🔥 iniciar
cargarContactos();
inputBuscar.addEventListener("input", cargarContactos);