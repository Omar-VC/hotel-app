const habitacionesDiv = document.getElementById("habitaciones");
const habitacionSelect = document.getElementById("habitacion");
const reservaForm = document.getElementById("reservaForm");
const resumenDiv = document.getElementById("resumenReservas");
const buscadorReservas = document.getElementById("buscadorReservas");
const filtroEstado = document.getElementById("filtroEstado");
const filtroTipo = document.getElementById("filtroTipo");
const panelEstadisticas = document.getElementById("panelEstadisticas");

// Cargar estadísticas
function cargarEstadisticas() {
  fetch("/habitaciones")
    .then(res => res.json())
    .then(habitaciones => {
      const total = habitaciones.length;
      const ocupadas = habitaciones.filter(h => h.estado === "ocupada").length;
      const libres = habitaciones.filter(h => h.estado === "libre").length;
      const simples = habitaciones.filter(h => h.tipo === "simple").length;
      const matrimoniales = habitaciones.filter(h => h.tipo === "matrimonial").length;

      const iconoLibre = "✅";
      const iconoOcupada = "❌";
      const iconoSimple = "🛏";
      const iconoMatrimonial = "❤️";

      panelEstadisticas.innerHTML = `
        <p>Total habitaciones: <strong>${total}</strong></p>
        <p>Ocupadas: <strong style="color:#dc3545">${iconoOcupada} ${ocupadas}</strong></p>
        <p>Libres: <strong style="color:#28a745">${iconoLibre} ${libres}</strong></p>
        <p>Simples: <strong>${iconoSimple} ${simples}</strong></p>
        <p>Matrimoniales: <strong>${iconoMatrimonial} ${matrimoniales}</strong></p>
      `;
    });
}

// Filtros de búsqueda
function aplicarFiltros() {
  const textoFiltro = buscadorReservas.value.toLowerCase();
  const estadoFiltro = filtroEstado.value;
  const tipoFiltro = filtroTipo.value;

  const tarjetas = document.querySelectorAll("#resumenReservas .reserva");

  tarjetas.forEach(tarjeta => {
    const texto = tarjeta.textContent.toLowerCase();
    const estado = tarjeta.querySelector(".estadoReserva").textContent.toLowerCase();
    const tipo = tarjeta.classList.contains("simple") ? "simple" : "matrimonial";

    if(
      texto.includes(textoFiltro) &&
      (estadoFiltro === "" || estado === estadoFiltro) &&
      (tipoFiltro === "" || tipo === tipoFiltro)
    ) {
      tarjeta.style.display = "block";
    } else {
      tarjeta.style.display = "none";
    }
  });
}

// Escuchar cambios en filtros
buscadorReservas.addEventListener("input", aplicarFiltros);
filtroEstado.addEventListener("change", aplicarFiltros);
filtroTipo.addEventListener("change", aplicarFiltros);

// Cargar habitaciones
function cargarHabitaciones() {
  habitacionesDiv.innerHTML = "";
  habitacionSelect.innerHTML = "";

  fetch("/habitaciones")
    .then(res => res.json())
    .then(habitaciones => {
      habitaciones.forEach(h => {
        const div = document.createElement("div");
        div.className = `habitacion ${h.estado}`;
        div.innerHTML = `
          #${h.id} - ${h.tipo} <br>
          Estado: ${h.estado}
          ${h.estado === "ocupada" ? `<button onclick="marcarSalida(${h.id})">Salida</button>` : ""}
        `;
        habitacionesDiv.appendChild(div);

        if(h.estado === "libre") {
          const option = document.createElement("option");
          option.value = h.id;
          option.textContent = `#${h.id} - ${h.tipo}`;
          habitacionSelect.appendChild(option);
        }
      });

      cargarResumen();
      cargarEstadisticas();
    });
}

// Cargar resumen de reservas
function cargarResumen() {
  resumenDiv.innerHTML = "";
  fetch("/reservas_activas")
    .then(res => res.json())
    .then(reservas => {
      if (reservas.length === 0) {
        resumenDiv.textContent = "No hay reservas activas.";
        return;
      }

      fetch("/habitaciones")
        .then(res => res.json())
        .then(habitaciones => {
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
        });
    });
}

// Marcar salida
function marcarSalida(id) {
  fetch(`/salida/${id}`, { method: "POST" })
    .then(res => res.json())
    .then(() => cargarHabitaciones());
}

// Enviar reserva
reservaForm.addEventListener("submit", e => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value;
  const dni = document.getElementById("dni").value;
  const celular = document.getElementById("celular").value;
  const habitacionId = parseInt(document.getElementById("habitacion").value);
  const fechaIngreso = document.getElementById("fechaIngreso").value;
  const horaIngreso = document.getElementById("horaIngreso").value;
  const fechaSalida = document.getElementById("fechaSalida").value;
  const horaSalida = document.getElementById("horaSalida").value;

  const ingreso = new Date(`${fechaIngreso}T${horaIngreso}`);
  const salida = new Date(`${fechaSalida}T${horaSalida}`);

  if (salida <= ingreso) {
    alert("La fecha y hora de salida deben ser posteriores a la fecha y hora de ingreso");
    return;
  }

  const reserva = { nombre, dni, celular, habitacionId, fechaIngreso, horaIngreso, fechaSalida, horaSalida };

  fetch("/reservas", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(reserva)
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);

    fetch("/habitaciones")
      .then(res => res.json())
      .then(habitaciones => {
        const hab = habitaciones.find(h => h.id === habitacionId);
        hab.estado = "ocupada";
        fetch("/habitaciones", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(habitaciones)
        }).then(() => cargarHabitaciones());
      });
  });
});

// Inicializar
cargarHabitaciones();
