import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAQzsTZxkHS5P5N1iqWBVVmrMbNMPQb2QQ",
  authDomain: "agenda--app-c0220.firebaseapp.com",
  projectId: "agenda--app-c0220",
  storageBucket: "agenda--app-c0220.firebasestorage.app",
  messagingSenderId: "1057225751235",
  appId: "1:1057225751235:web:d4243cc400c593b6504076"
};

// 🔥 inicializar app
const app = initializeApp(firebaseConfig);

// 🔥 base de datos
const db = getFirestore(app);

export { db };