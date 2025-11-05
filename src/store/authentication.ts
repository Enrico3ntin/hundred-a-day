import { GoogleAuthProvider, type Auth } from "firebase/auth";
import { atom, computed, onMount, task } from "nanostores";
import { getAuth, signInAnonymously, signInWithPopup, signOut } from "firebase/auth";
import { $firebaseApp } from "./firebase";

const $firebaseAuth = atom<Auth | undefined>();
onMount($firebaseAuth, () => {
    $firebaseAuth.set(getAuth($firebaseApp.get()));
});

const $googleAuthProvider = atom<GoogleAuthProvider | undefined>();
onMount($googleAuthProvider, () => {
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

export const $uid = computed([$firebaseAuth, $authentication], 
    (auth)=> auth?.currentUser?.uid );

export const signInWithoutAccount = 
    () => { 
        $authentication.set({ status: 'LOADING' });
        task(async () => {
            try {
                const userCredentials = await signInAnonymously($firebaseAuth.get()!)
                $authentication.set({ 
                    status: 'ANONYMOUS', 
                    uid: userCredentials.user.uid } );
            } catch (error) {
                $authentication.set({ 
                    status: 'ERROR', 
                    errorMessage: `${error}` } );
            }
        })
    }
export const signInWithGoogle = 
    () => { 
        $authentication.set({ status: 'LOADING' });
        task(async ()=>{
            try {
                const userCredentials = await signInWithPopup($firebaseAuth.get()!, $googleAuthProvider.get()!);
                $authentication.set({ 
                    status: 'AUTHENTICATED', 
                    uid: userCredentials.user.uid } );
            } catch (error) {
                $authentication.set({ 
                    status: 'ERROR', 
                    errorMessage: `${error}` } );
            }
        })
    };

export const signOutOfAccount = 
    async () => { 
        $authentication.set({ status: 'LOADING' });
        await signOut($firebaseAuth.get()!);
        signInWithoutAccount();
    };
