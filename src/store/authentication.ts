import { GoogleAuthProvider, type Auth } from "firebase/auth";
import { atom, onMount, task } from "nanostores";
import { getAuth, signInAnonymously, signInWithPopup, signOut } from "firebase/auth";
import { $firebaseApp } from "./firebase";

type Authentication = 
    { status: 'NONE' | 'LOADING' } |
    { status: 'ANONYMOUS' | 'AUTHENTICATED', uid: string } |
    { status: 'ERROR', errorMessage: string };

const $firebaseAuth = atom<Auth | undefined>();
onMount($firebaseAuth, () => $firebaseAuth.set(getAuth($firebaseApp.get())));

const $googleAuthProvider = atom<GoogleAuthProvider | undefined>();
onMount($googleAuthProvider, () => $googleAuthProvider.set(new GoogleAuthProvider()));

const $authentication = atom<Authentication>({ status: 'NONE' });
onMount($authentication, () => {
    if ( $authentication.get().status == 'NONE' ) {
        signInWithoutAccount();
    }
});

const signInWithoutAccount = () => { 
    $authentication.set({ status: 'LOADING' });
    task(async () => {
        try {
            const auth = $firebaseAuth.get();
            const credentials = await signInAnonymously(auth!);
            $authentication.set({ 
                status: 'ANONYMOUS', 
                uid: credentials.user.uid } );
        } catch (error) {
            $authentication.set({ 
                status: 'ERROR', 
                errorMessage: `${error}` } );
        }
    })
};

const signInWithGoogle = () => { 
    $authentication.set({ status: 'LOADING' });
    task(async ()=>{
        try {
            const auth = $firebaseAuth.get();
            const provider = $googleAuthProvider.get();
            const userCredentials = await signInWithPopup(auth!, provider!);
            $authentication.set({ 
                status: 'AUTHENTICATED', 
                uid: userCredentials.user.uid } );
        } catch (error) {
            $authentication.set({ 
                status: 'ERROR', 
                errorMessage: `${error}` } );
        }
    });
};

const signOutOfAccount = () => { 
    $authentication.set({ status: 'LOADING' });
    task(async () => {
        await signOut($firebaseAuth.get()!);
        signInWithoutAccount();
    });
};

export { 
    $authentication, 
    signInWithoutAccount, 
    signInWithGoogle, 
    signOutOfAccount as signOut,
};