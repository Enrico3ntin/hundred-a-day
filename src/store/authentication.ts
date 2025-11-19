import { GoogleAuthProvider, type Auth } from "firebase/auth";
import { atom, onMount, task } from "nanostores";
import { getAuth, signInAnonymously, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { $firebaseApp } from "./firebase";
import { logAnalyticsEvent } from "./analytics";

type Authentication = 
    { status: 'NONE' | 'LOADING' } |
    { status: 'ANONYMOUS', uid: string } |
    { status: 'AUTHENTICATED', uid: string, email: string } |
    { status: 'ERROR', errorMessage: string };


const $firebaseAuth = atom<Auth | undefined>();
const $authentication = atom<Authentication>({ status: 'NONE' });
onMount($authentication, () => {
    $authentication.set({ status: 'LOADING' })
    const auth = getAuth($firebaseApp.get());
    onAuthStateChanged(auth, currentUser => {
        if ( !currentUser ) {
            signInWithoutAccount();
        } else if ( currentUser.isAnonymous ) {
            $authentication.set({ status: 'ANONYMOUS', uid: currentUser.uid })
        } else {
            $authentication.set({ status: "AUTHENTICATED", uid: currentUser.uid, email: currentUser.email! })
        }
    });
    $firebaseAuth.set(auth);
});

const $googleAuthProvider = atom<GoogleAuthProvider | undefined>();
onMount($googleAuthProvider, () => $googleAuthProvider.set(new GoogleAuthProvider()));

const signInWithoutAccount = () => { 
    $authentication.set({ status: 'LOADING' });
    signInAnonymously($firebaseAuth.get()!)
    .catch(error => $authentication.set({ status: 'ERROR',  errorMessage: `${error}` } ));
    logAnalyticsEvent("ANONYMOUS_SIGN_IN");
};

const signInWithGoogle = () => { 
    $authentication.set({ status: 'LOADING' });
    signInWithPopup($firebaseAuth.get()!, $googleAuthProvider.get()!)
    .catch( error => $authentication.set({ status: 'ERROR', errorMessage: `${error}` } ));
    logAnalyticsEvent("AUTHENTICATED_SIGN_IN");
};

const signOutOfAccount = () => { 
    $authentication.set({ status: 'LOADING' });
    signOut($firebaseAuth.get()!)
    .catch( error => $authentication.set({ status: 'ERROR', errorMessage: `${error}` } ));
    logAnalyticsEvent("AUTHENTICATED_SIGN_OUT");
};

export { 
    $authentication, 
    signInWithoutAccount, 
    signInWithGoogle, 
    signOutOfAccount as signOut,
};