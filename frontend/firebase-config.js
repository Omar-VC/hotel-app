// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.15.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.15.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD1u2UMVI4UfpXjJ3FRgflBmeGb_yI8tbI",
  authDomain: "hotel-picuru-app.firebaseapp.com",
  projectId: "hotel-picuru-app",
  storageBucket: "hotel-picuru-app.firebasestorage.app",
  messagingSenderId: "796256232412",
  appId: "1:796256232412:web:e377b7882375839d3ae519"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
