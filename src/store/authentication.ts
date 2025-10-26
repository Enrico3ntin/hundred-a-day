import { initializeApp } from "firebase/app";
import { GoogleAuthProvider } from "firebase/auth";
import { atom, onMount } from "nanostores";
import { getAuth, signInAnonymously, signInWithPopup, signOut} from "firebase/auth";


const firebaseConfig = {
  apiKey: import.meta.env.API_KEY,
  authDomain: import.meta.env.AUTH_DOMAIN,
  projectId: import.meta.env.PROJECT_ID,
  storageBucket: import.meta.env.STORAGE_BUCKET,
  messagingSenderId: import.meta.env.MESSAGING_SENDER_ID,
  appId: import.meta.env.APP_ID,
  measurementId: import.meta.env.MEASUREMENT_ID
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
