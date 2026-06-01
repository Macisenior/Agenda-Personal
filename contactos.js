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
const inputDireccion = document.getElementById("inputDireccion");
const btnGuardar = document.getElementById("btnGuardar");
const lista = document.getElementById("listaContactos");
const inputBuscar = document.getElementById("inputBuscar");
const inputCP = document.getElementById("inputCP");
const inputPoblacion = document.getElementById("inputPoblacion");
const inputProvincia = document.getElementById("inputProvincia");
const inputCategoria = document.getElementById("inputCategoria");
const inputCategoriaLibre = document.getElementById("inputCategoriaLibre");
const inputMovil = document.getElementById("inputMovil");
const inputFijo = document.getElementById("inputFijo"); 
const inputEmail = document.getElementById("inputEmail");
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
      movil: inputMovil.value,
      fijo: inputFijo.value,
      email: inputEmail.value,
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
      movil: inputMovil.value,
      fijo: inputFijo.value,
      email: inputEmail.value,
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

  ${c.movil ? `📱 ${c.movil}<br>` : ""}
  ${c.fijo ? `☎️ ${c.fijo}<br>` : ""}
  ${c.email ? `✉️ ${c.email}<br>` : ""}

  📍 ${c.direccion || ""} ${c.cp || ""} ${c.poblacion || ""} ${c.provincia || ""}
`;

li.appendChild(info);

      // ✏️ editar
      li.addEventListener("click", () => {
        inputNombre.value = c.nombre;
       inputMovil.value = c.movil || "";
        inputFijo.value = c.fijo || "";
        inputEmail.value = c.email || "";
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
// 📱 móvil
if (c.movil) {
  const btnMovil = document.createElement("button");
  btnMovil.textContent = "📱";

  btnMovil.addEventListener("click", (e) => {
    e.stopPropagation();
    window.open(`tel:${c.movil}`);
  });

  contBotones.appendChild(btnMovil);
}

// ☎️ fijo
if (c.fijo) {
  const btnFijo = document.createElement("button");
  btnFijo.textContent = "☎️";

  btnFijo.addEventListener("click", (e) => {
    e.stopPropagation();
    window.open(`tel:${c.fijo}`);
  });

  contBotones.appendChild(btnFijo);
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
// ✉️ email
if (c.email) {

  const btnEmail = document.createElement("button");
  btnEmail.textContent = "✉️";

  btnEmail.addEventListener("click", (e) => {
    e.stopPropagation();
    window.open(`mailto:${c.email}`);
  });

  contBotones.appendChild(btnEmail);
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