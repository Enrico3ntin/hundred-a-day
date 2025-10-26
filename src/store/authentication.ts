import { initializeApp, type FirebaseApp } from "firebase/app";
import { GoogleAuthProvider, type Auth } from "firebase/auth";
import { atom, onMount } from "nanostores";
import { getAuth, signInAnonymously, signInWithPopup, signOut, linkWithCredential} from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyBzOM1MjjhAQuIxrBWohNegx0cMk8q1Kjk",
  authDomain: "hundredaday-3nsn.firebaseapp.com",
  projectId: "hundredaday-3nsn",
  storageBucket: "hundredaday-3nsn.firebasestorage.app",
  messagingSenderId: "875622270682",
  appId: "1:875622270682:web:6355e6a80c14cedb1ec7e3",
  measurementId: "G-71FLRLHQJX"
};

const $firebaseApp = atom<FirebaseApp | undefined>();
onMount($firebaseApp, () => {
    console.log("Lazily initializing Firebase App");
    $firebaseApp.set(initializeApp(firebaseConfig));
});

const $firebaseAuth = atom<Auth | undefined>();
onMount($firebaseAuth, () => {
    console.log("Lazily initializing Firebase Auth");
    $firebaseAuth.set(getAuth($firebaseApp.get()));
});

const $googleAuthProvider = atom<GoogleAuthProvider | undefined>();
onMount($googleAuthProvider, () => {
    console.log("Lazily initializing Google Auth Provider");
    $googleAuthProvider.set(new GoogleAuthProvider());
});

type Authentication = 
    { status: 'NONE' | 'LOADING' } |
    { status: 'ANONYMOUS' | 'AUTHENTICATED', uid: string } |
    { status: 'ERROR', errorMessage: string };
export const $authentication = 
    atom<Authentication>({ status: 'NONE' });
onMount($authentication, () => {
    if ( $authentication.get().status == 'NONE' ) {
        signInWithoutAccount();
    }
});

export const signInWithoutAccount = 
    () => { 
        $authentication.set({ status: 'LOADING' });
        signInAnonymously($firebaseAuth.get()!)
        .then((userCredentials) => {
            $authentication.set({ 
                status: 'ANONYMOUS', 
                uid: userCredentials.user.uid } );
        })
        .catch((error) => {
            $authentication.set({ 
                status: 'ERROR', 
                errorMessage: error.message } );
        });
    }
export const signInWithGoogle = 
    () => { 
        $authentication.set({ status: 'LOADING' });
        signInWithPopup($firebaseAuth.get()!, $googleAuthProvider.get()!)
        .then((userCredentials) => {
            $authentication.set({ 
                status: 'AUTHENTICATED', 
                uid: userCredentials.user.uid } );
        })
        .catch((error) => {
            $authentication.set({ 
                status: 'ERROR', 
                errorMessage: error.message } );
        });
    };

export const signOutOfAccount = 
    async () => { 
        $authentication.set({ status: 'LOADING' });
        await signOut($firebaseAuth.get()!);
        signInWithoutAccount();
    };
