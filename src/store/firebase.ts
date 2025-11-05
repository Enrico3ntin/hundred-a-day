import { initializeApp, type FirebaseApp } from "firebase/app";
import { atom, onMount } from "nanostores";

const firebaseConfig = {
  apiKey: "AIzaSyBzOM1MjjhAQuIxrBWohNegx0cMk8q1Kjk",
  authDomain: "hundredaday-3nsn.firebaseapp.com",
  projectId: "hundredaday-3nsn",
  storageBucket: "hundredaday-3nsn.firebasestorage.app",
  messagingSenderId: "875622270682",
  appId: "1:875622270682:web:6355e6a80c14cedb1ec7e3",
  measurementId: "G-71FLRLHQJX"
};

export const $firebaseApp = atom<FirebaseApp | undefined>();
onMount($firebaseApp, () => {
    $firebaseApp.set(initializeApp(firebaseConfig));
});