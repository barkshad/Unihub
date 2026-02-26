import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDRRvi6WsQFbADW44VQog9eqG2KjltSwD4",
  authDomain: "unihub-76106.firebaseapp.com",
  projectId: "unihub-76106",
  storageBucket: "unihub-76106.firebasestorage.app",
  messagingSenderId: "106872398613",
  appId: "1:106872398613:web:468895d1830d0dbc497f1c",
  measurementId: "G-59DN95V813"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
