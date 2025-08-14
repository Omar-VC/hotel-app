const habitacionesDiv = document.getElementById("habitaciones");
const habitacionSelect = document.getElementById("habitacion");
const reservaForm = document.getElementById("reservaForm");
const resumenDiv = document.getElementById("resumenReservas");
const buscadorReservas = document.getElementById("buscadorReservas");
const filtroEstado = document.getElementById("filtroEstado");
const filtroTipo = document.getElementById("filtroTipo");
const panelEstadisticas = document.getElementById("panelEstadisticas");

function cargarEstadisticas() {
  fetch("/habitaciones")
    .then(res => res.json())
    .then(habitaciones => {
      const total = habitaciones.length;
      const ocupadas = habitaciones.filter(h => h.estado === "ocupada").length;
      const libres = habitaciones.filter(h => h.estado === "libre").length;
      const simples = habitaciones.filter(h => h.tipo === "simple").length;
      const matrimoniales = habitaciones.filter(h => h.tipo === "matrimonial").length;

       // Iconos
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

// Escuchar cambios
buscadorReservas.addEventListener("input", aplicarFiltros);
filtroEstado.addEventListener("change", aplicarFiltros);
filtroTipo.addEventListener("change", aplicarFiltros);

buscadorReservas.addEventListener("input", () => {
  const filtro = buscadorReservas.value.toLowerCase();
  const tarjetas = document.querySelectorAll("#resumenReservas .reserva");

  tarjetas.forEach(tarjeta => {
    const texto = tarjeta.textContent.toLowerCase();
    if(texto.includes(filtro)) {
      tarjeta.style.display = "block";
    } else {
      tarjeta.style.display = "none";
    }
  });
});

// Función para cargar habitaciones y mostrarlas
function cargarHabitaciones() {
  habitacionesDiv.innerHTML = ""; // limpiar antes de mostrar
  habitacionSelect.innerHTML = ""; // limpiar select

  fetch("/habitaciones")
    .then(res => res.json())
    .then(habitaciones => {
      habitaciones.forEach(h => {
        const div = document.createElement("div");
        div.className = `habitacion ${h.estado}`; // clase CSS según estado

        div.innerHTML = `
          #${h.id} - ${h.tipo} <br>
          Estado: ${h.estado}
          ${h.estado === "ocupada" ? `<button onclick="marcarSalida(${h.id})">Salida</button>` : ""}
        `;

        habitacionesDiv.appendChild(div);

        // Llenar select solo con habitaciones libres
        if(h.estado === "libre") {
          const option = document.createElement("option");
          option.value = h.id;
          option.textContent = `#${h.id} - ${h.tipo}`;
          habitacionSelect.appendChild(option);
        }
      });

      // Actualizar resumen al final
      cargarResumen();
      cargarEstadisticas();
    });
}

// Función para cargar resumen de reservas activas
function cargarResumen() {
  resumenDiv.innerHTML = ""; // limpiar antes de mostrar
  fetch("/reservas_activas")
    .then(res => res.json())
    .then(reservas => {
      if (reservas.length === 0) {
        resumenDiv.textContent = "No hay reservas activas.";
        return;
      }

      // Cargar estado desde habitaciones para cada reserva
      fetch("/habitaciones")
        .then(res => res.json())
        .then(habitaciones => {
          reservas.forEach(r => {
            const hab = habitaciones.find(h => h.id === r.habitacionId);
            const estado = hab ? hab.estado : "libre";
            const tipo = hab ? hab.tipo : "simple"; //default simple

            // Elegir icono según tipo
            const icono = tipo === "simple" ? "🛏" : "❤️";

            const div = document.createElement("div");
            div.className = `reserva ${tipo}`; // clase según tipo de habitación

             div.innerHTML = `
              <p>#${r.habitacionId} - ${r.nombre} <span class="icono">${icono}</span></p>
              <p>Fecha: ${r.fecha}</p>
              <p class="estadoReserva">${estado}</p>
              `;


            // Asignar clase según estado
            const estadoClase = estado === "ocupada" ? "Ocupada" : "Libre";
            div.querySelector(".estadoReserva").classList.add(estadoClase);

            resumenDiv.appendChild(div);
          });
        });
    });
}

// Función para marcar Salida
function marcarSalida(id) {
  fetch(`/salida/${id}`, { method: "POST" })
    .then(res => res.json())
    .then(() => cargarHabitaciones());
}

// Enviar reserva
reservaForm.addEventListener("submit", e => {
  e.preventDefault();
  const reserva = {
    nombre: document.getElementById("nombre").value,
    habitacionId: parseInt(document.getElementById("habitacion").value),
    fecha: document.getElementById("fecha").value
  };

  fetch("/reservas", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(reserva)
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);

    // Cambiar automáticamente estado de la habitación a "ocupada"
    fetch("/habitaciones")
      .then(res => res.json())
      .then(habitaciones => {
        const hab = habitaciones.find(h => h.id === reserva.habitacionId);
        hab.estado = "ocupada";
        fetch("/habitaciones", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(habitaciones)
        }).then(() => cargarHabitaciones());
      });
  });
});

// Cargar habitaciones al inicio
cargarHabitaciones();
