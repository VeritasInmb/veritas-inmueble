import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD_gh5tPjnX6xE-b1c_YzKjnACgt0zxjDg",
  authDomain: "veritas-inmueble-2.firebaseapp.com",
  projectId: "veritas-inmueble-2",
  storageBucket: "veritas-inmueble-2.firebasestorage.app",
  messagingSenderId: "633704939001",
  appId: "1:633704939001:web:41f7be304d1d124dc29128",
  measurementId: "G-1LPLG6CG3T"
};

// Initialize Firebase
// Verifica si ya existe una app para evitar reinicializar en hot-reload
const app = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();

// Get Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Export services for use in other parts of the app
export { auth, db, firebase };