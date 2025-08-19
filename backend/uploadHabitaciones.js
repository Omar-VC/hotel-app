// uploadHabitaciones.js
import { readFile } from "fs/promises";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// ----- CONFIGURACIÓN FIREBASE -----
const firebaseConfig = {
  apiKey: "AIzaSyD1u2UMVI4UfpXjJ3FRgflBmeGb_yI8tbI",
  authDomain: "hotel-picuru-app.firebaseapp.com",
  projectId: "hotel-picuru-app",
  storageBucket: "hotel-picuru-app.appspot.com",
  messagingSenderId: "796256232412",
  appId: "1:796256232412:web:e377b7882375839d3ae519"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ----- FUNCION PARA SUBIR HABITACIONES -----
async function uploadHabitaciones() {
  try {
    // Lee el archivo JSON con las habitaciones
    const data = await readFile("./data/habitaciones.json", "utf-8");
    const habitaciones = JSON.parse(data);

    for (const hab of habitaciones) {
      // Cada documento usará como ID el valor de "id" en tu JSON
      await setDoc(doc(db, "habitaciones", hab.id.toString()), hab);
    }

    console.log("¡Habitaciones subidas correctamente!");
  } catch (error) {
    console.error("Error subiendo habitaciones:", error);
  }
}

// ----- EJECUTAR -----
uploadHabitaciones();
