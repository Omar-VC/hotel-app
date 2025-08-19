// firebase-config.js
  import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
    import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
    import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Configuración de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD1u2UMVI4UfpXjJ3FRgflBmeGb_yI8tbI",
  authDomain: "hotel-picuru-app.firebaseapp.com",
  projectId: "hotel-picuru-app",
  storageBucket: "hotel-picuru-app.appspot.com",
  messagingSenderId: "796256232412",
  appId: "1:796256232412:web:e377b7882375839d3ae519"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
