// script.js
import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { collection, getDocs, addDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// ----- LOGIN -----
const loginForm = document.getElementById("loginForm");
const bloqueLogin = document.getElementById("bloqueLogin");
const appContent = document.getElementById("appContent");
const loginError = document.getElementById("loginError");
const logoutBtn = document.getElementById("logoutBtn");

loginForm.addEventListener("submit", e => {
  e.preventDefault();
  const usuario = document.getElementById("usuario").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, usuario, password)
    .then(() => {
      loginError.style.display = "none";
      mostrarApp();
    })
    .catch(() => {
      loginError.style.display = "block";
    });
});

logoutBtn.addEventListener("click", () => {
  signOut(auth).then(() => {
    bloqueLogin.style.display = "block";
    appContent.style.display = "none";
  });
});

onAuthStateChanged(auth, user => {
  if (user) {
    mostrarApp();
  } else {
    bloqueLogin.style.display = "block";
    appContent.style.display = "none";
  }
});

function mostrarApp() {
  bloqueLogin.style.display = "none";
  appContent.style.display = "block";
  cargarHabitaciones();
}

// ----- VARIABLES DOM -----
const habitacionesDiv = document.getElementById("habitaciones");
const habitacionSelect = document.getElementById("habitacion");
const reservaForm = document.getElementById("reservaForm");
const resumenDiv = document.getElementById("resumenReservas");
const buscadorReservas = document.getElementById("buscadorReservas");
const filtroEstado = document.getElementById("filtroEstado");
const filtroTipo = document.getElementById("filtroTipo");
const panelEstadisticas = document.getElementById("panelEstadisticas");

// ----- FUNCIONES FIRESTORE -----
async function getHabitaciones() {
  const snapshot = await getDocs(collection(db, "habitaciones"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getReservas() {
  const snapshot = await getDocs(collection(db, "reservas"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function addReserva(reserva) {
  await addDoc(collection(db, "reservas"), reserva);
  await updateDoc(doc(db, "habitaciones", reserva.habitacionId), { estado: "ocupada" });
}

async function marcarSalidaFirestore(id, habitacionId) {
  await updateDoc(doc(db, "habitaciones", habitacionId), { estado: "libre" });
}

// ----- CARGAR HABITACIONES -----
async function cargarHabitaciones() {
  habitacionesDiv.innerHTML = "";
  habitacionSelect.innerHTML = "";
  const habitaciones = await getHabitaciones();

  habitaciones.forEach(h => {
    const div = document.createElement("div");
    div.className = `habitacion ${h.estado}`;
    div.innerHTML = `
      #${h.id} - ${h.tipo} <br>
      Estado: ${h.estado}
      ${h.estado === "ocupada" ? `<button onclick="marcarSalidaFirestore('${h.id}', '${h.id}').then(cargarHabitaciones)">Salida</button>` : ""}
    `;
    habitacionesDiv.appendChild(div);

    if (h.estado === "libre") {
      const option = document.createElement("option");
      option.value = h.id;
      option.textContent = `#${h.id} - ${h.tipo}`;
      habitacionSelect.appendChild(option);
    }
  });

  cargarResumen();
  cargarEstadisticas();
}

// ----- CARGAR RESUMEN Y ESTADÍSTICAS -----
async function cargarResumen() {
  resumenDiv.innerHTML = "";
  const reservas = await getReservas();
  const habitaciones = await getHabitaciones();

  if (reservas.length === 0) {
    resumenDiv.textContent = "No hay reservas activas.";
    return;
  }

  reservas.forEach(r => {
    const hab = habitaciones.find(h => h.id === r.habitacionId);
    const estado = hab ? hab.estado : "libre";
    const tipo = hab ? hab.tipo : "simple";
    const icono = tipo === "simple" ? "🛏" : "❤️";

    const div = document.createElement("div");
    div.className = `reserva ${tipo}`;
    div.innerHTML = `
      <p>#${r.habitacionId} - ${r.nombre} <span class="icono">${icono}</span></p>
      <p>Fecha ingreso: ${r.fechaIngreso} ${r.horaIngreso}</p>
      <p>Fecha salida: ${r.fechaSalida} ${r.horaSalida}</p>
      <p>DNI: ${r.dni} | Cel: ${r.celular}</p>
      <p class="estadoReserva">${estado}</p>
    `;
    const estadoClase = estado === "ocupada" ? "Ocupada" : "Libre";
    div.querySelector(".estadoReserva").classList.add(estadoClase);
    resumenDiv.appendChild(div);
  });

  aplicarFiltros();
}

async function cargarEstadisticas() {
  const habitaciones = await getHabitaciones();
  const total = habitaciones.length;
  const ocupadas = habitaciones.filter(h => h.estado === "ocupada").length;
  const libres = habitaciones.filter(h => h.estado === "libre").length;
  const simples = habitaciones.filter(h => h.tipo === "simple").length;
  const matrimoniales = habitaciones.filter(h => h.tipo === "matrimonial").length;

  panelEstadisticas.innerHTML = `
    <p>Total habitaciones: <strong>${total}</strong></p>
    <p>Ocupadas: <strong style="color:#dc3545">❌ ${ocupadas}</strong></p>
    <p>Libres: <strong style="color:#28a745">✅ ${libres}</strong></p>
    <p>Simples: <strong>🛏 ${simples}</strong></p>
    <p>Matrimoniales: <strong>❤️ ${matrimoniales}</strong></p>
  `;
}

// ----- FILTROS -----
function aplicarFiltros() {
  const textoFiltro = buscadorReservas.value.toLowerCase();
  const estadoFiltro = filtroEstado.value;
  const tipoFiltro = filtroTipo.value;

  const tarjetas = document.querySelectorAll("#resumenReservas .reserva");
  tarjetas.forEach(tarjeta => {
    const texto = tarjeta.textContent.toLowerCase();
    const estado = tarjeta.querySelector(".estadoReserva").textContent.toLowerCase();
    const tipo = tarjeta.classList.contains("simple") ? "simple" : "matrimonial";

    tarjeta.style.display =
      texto.includes(textoFiltro) &&
      (estadoFiltro === "" || estado === estadoFiltro) &&
      (tipoFiltro === "" || tipo === tipoFiltro)
        ? "block"
        : "none";
  });
}

buscadorReservas.addEventListener("input", aplicarFiltros);
filtroEstado.addEventListener("change", aplicarFiltros);
filtroTipo.addEventListener("change", aplicarFiltros);

reservaForm.addEventListener("submit", async e => {
  e.preventDefault();
  const nombre = document.getElementById("nombre").value;
  const dni = document.getElementById("dni").value;
  const celular = document.getElementById("celular").value;
  const habitacionId = document.getElementById("habitacion").value;
  const fechaIngreso = document.getElementById("fechaIngreso").value;
  const horaIngreso = document.getElementById("horaIngreso").value;
  const fechaSalida = document.getElementById("fechaSalida").value;
  const horaSalida = document.getElementById("horaSalida").value;

  if (new Date(`${fechaSalida}T${horaSalida}`) <= new Date(`${fechaIngreso}T${horaIngreso}`)) {
    alert("La fecha y hora de salida deben ser posteriores a la fecha y hora de ingreso");
    return;
  }

  const reserva = { nombre, dni, celular, habitacionId, fechaIngreso, horaIngreso, fechaSalida, horaSalida };
  await addReserva(reserva);
  alert("Reserva creada con éxito");
  cargarHabitaciones();
});

// ----- INICIAL -----
cargarHabitaciones();
