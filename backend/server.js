// server.js
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// Para poder usar __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

// Obtener habitaciones
app.get("/habitaciones", (req, res) => {
  const habitaciones = JSON.parse(fs.readFileSync(path.join(__dirname, "data/habitaciones.json")));
  res.json(habitaciones);
});

app.get("/reservas_activas", (req, res) => {
  const reservas = JSON.parse(fs.readFileSync(path.join(__dirname, "data/reservas_activas.json")));
  res.json(reservas);
});

// Guardar reserva activa
app.post("/reservas", (req, res) => {
  const reservas = JSON.parse(fs.readFileSync(path.join(__dirname, "data/reservas_activas.json")));
  reservas.push(req.body);
  fs.writeFileSync(path.join(__dirname, "data/reservas_activas.json"), JSON.stringify(reservas, null, 2));
  res.json({ message: "Reserva guardada" });
});

// Actualizar habitaciones
app.post("/habitaciones", (req, res) => {
  fs.writeFileSync(path.join(__dirname, "data/habitaciones.json"), JSON.stringify(req.body, null, 2));
  res.json({ message: "Habitaciones actualizadas" });
});

// Marcar salida
app.post("/salida/:habitacionId", (req, res) => {
  const habitacionId = parseInt(req.params.habitacionId);

  const habitaciones = JSON.parse(fs.readFileSync(path.join(__dirname, "data/habitaciones.json")));
  const hab = habitaciones.find(h => h.id === habitacionId);
  if (hab) hab.estado = "libre";
  fs.writeFileSync(path.join(__dirname, "data/habitaciones.json"), JSON.stringify(habitaciones, null, 2));

  let reservasActivas = JSON.parse(fs.readFileSync(path.join(__dirname, "data/reservas_activas.json")));
  const reservaIndex = reservasActivas.findIndex(r => r.habitacionId === habitacionId);
  if (reservaIndex !== -1) {
    const reserva = reservasActivas.splice(reservaIndex, 1)[0];
    fs.writeFileSync(path.join(__dirname, "data/reservas_activas.json"), JSON.stringify(reservasActivas, null, 2));

    const reservasHistoricas = JSON.parse(fs.readFileSync(path.join(__dirname, "data/reservas_historicas.json")));
    reservasHistoricas.push(reserva);
    fs.writeFileSync(path.join(__dirname, "data/reservas_historicas.json"), JSON.stringify(reservasHistoricas, null, 2));
  }

  res.json({ message: "Habitación liberada y reserva movida a historial" });
});

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
