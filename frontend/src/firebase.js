// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDFAgolbfwAoVvYmh6t62ZG5-ONYmhvb3Q",
  authDomain: "chatgen-eb550.firebaseapp.com",
  projectId: "chatgen-eb550",
  storageBucket: "chatgen-eb550.firebasestorage.app",
  messagingSenderId: "404963762127",
  appId: "1:404963762127:web:74952b6f451d3016403cba"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);