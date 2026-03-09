import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC2H_EGa_gITnHIifs-jyu-yoYgFTWqDN0",
  authDomain: "jsap-1ba8f.firebaseapp.com",
  projectId: "jsap-1ba8f",
  storageBucket: "jsap-1ba8f.firebasestorage.app",
  messagingSenderId: "1035005097095",
  appId: "1:1035005097095:web:256afb0aa6ced6562bb422"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
