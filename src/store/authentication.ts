import { initializeApp } from "firebase/app";
import { GoogleAuthProvider } from "firebase/auth";
import { atom, onMount } from "nanostores";
import { getAuth, signInAnonymously, signInWithPopup, signOut} from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyBzOM1MjjhAQuIxrBWohNegx0cMk8q1Kjk",
  authDomain: "hundredaday-3nsn.firebaseapp.com",
  projectId: "hundredaday-3nsn",
  storageBucket: "hundredaday-3nsn.firebasestorage.app",
  messagingSenderId: "875622270682",
  appId: "1:875622270682:web:6355e6a80c14cedb1ec7e3",
  measurementId: "G-71FLRLHQJX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleAuthProvider = new GoogleAuthProvider();

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
        signInAnonymously(auth)
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
        signInWithPopup(auth, googleAuthProvider)
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
        await signOut(auth);
        signInWithoutAccount();
    };
