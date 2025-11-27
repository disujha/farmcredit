// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBfE3DNTQ5v1c7fdTqXwrgdFFhjcr_uWu8",
    authDomain: "farmcreditconnect-4114a.firebaseapp.com",
    projectId: "farmcreditconnect-4114a",
    storageBucket: "farmcreditconnect-4114a.firebasestorage.app",
    messagingSenderId: "30380242778",
    appId: "1:30380242778:web:fe52b39895589156c96563",
    measurementId: "G-H317MPYZDY"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
