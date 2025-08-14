const express = require("express");
const fs = require("fs");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("../frontend"));

// Obtener habitaciones
app.get("/habitaciones", (req, res) => {
  const habitaciones = JSON.parse(fs.readFileSync("./data/habitaciones.json"));
  res.json(habitaciones);
});

app.get("/reservas_activas", (req, res) => {
  const reservas = JSON.parse(fs.readFileSync("./data/reservas_activas.json"));
  res.json(reservas);
});


// Guardar reserva activa
app.post("/reservas", (req, res) => {
  const reservas = JSON.parse(fs.readFileSync("./data/reservas_activas.json"));
  reservas.push(req.body);
  fs.writeFileSync("./data/reservas_activas.json", JSON.stringify(reservas, null, 2));
  res.json({ message: "Reserva guardada" });
});

// Actualizar habitaciones
app.post("/habitaciones", (req, res) => {
  fs.writeFileSync("./data/habitaciones.json", JSON.stringify(req.body, null, 2));
  res.json({ message: "Habitaciones actualizadas" });
});

// Marcar salida: liberar habitación y mover reserva a historial
app.post("/salida/:habitacionId", (req, res) => {
  const habitacionId = parseInt(req.params.habitacionId);

  // Actualizar habitación a libre
  const habitaciones = JSON.parse(fs.readFileSync("./data/habitaciones.json"));
  const hab = habitaciones.find(h => h.id === habitacionId);
  if (hab) hab.estado = "libre";
  fs.writeFileSync("./data/habitaciones.json", JSON.stringify(habitaciones, null, 2));

  // Mover reserva de activas a históricas
  let reservasActivas = JSON.parse(fs.readFileSync("./data/reservas_activas.json"));
  const reservaIndex = reservasActivas.findIndex(r => r.habitacionId === habitacionId);
  if (reservaIndex !== -1) {
    const reserva = reservasActivas.splice(reservaIndex, 1)[0];
    fs.writeFileSync("./data/reservas_activas.json", JSON.stringify(reservasActivas, null, 2));

    // Guardar en histórico
    const reservasHistoricas = JSON.parse(fs.readFileSync("./data/reservas_historicas.json"));
    reservasHistoricas.push(reserva);
    fs.writeFileSync("./data/reservas_historicas.json", JSON.stringify(reservasHistoricas, null, 2));
  }

  res.json({ message: "Habitación liberada y reserva movida a historial" });
});

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
