// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyApWgmruIP_NWZgsA5VaQJweiFlA0WVGp4",
  authDomain: "all-demo-3b44a.firebaseapp.com",
  projectId: "all-demo-3b44a",
  storageBucket: "all-demo-3b44a.appspot.com",
  messagingSenderId: "984762357313",
  appId: "1:984762357313:web:2e68e89e93258dc89918c0",
  measurementId: "G-H8RRG75CY4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db }; // Correct exports for authentication and database
