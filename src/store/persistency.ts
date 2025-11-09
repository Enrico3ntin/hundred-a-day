import { Database, getDatabase, ref, push, onValue, DataSnapshot, type Unsubscribe } from "firebase/database";
import { $firebaseApp } from "./firebase";
import { atom, onMount, computed, onSet, effect } from "nanostores";
import { $authentication } from "./authentication";

const DATABASE_URL = "https://hundredaday-3nsn-default-rtdb.europe-west1.firebasedatabase.app";

type TimeReference = { timestamp:Date, level?:'day'|'month'};

const $database = atom<Database | undefined>();
onMount($database, () => $database.set(getDatabase($firebaseApp.get(), DATABASE_URL)));

const $currentTimeRef = atom<TimeReference> ({ timestamp:new Date(), level:'day'});

const $databaseRef = computed([$authentication, $database, $currentTimeRef], (authentication, db, { timestamp, level }) => {
    if (authentication.status != 'AUTHENTICATED' && authentication.status != 'ANONYMOUS') return;
    if (!db) return;
    const yyyymmdd = timestamp.toISOString().substring(0,10);
    const yyyy = yyyymmdd.substring(0,4);
    const mm = yyyymmdd.substring(5,7);
    const path = [authentication.uid, yyyy, mm, (level=='day' ? yyyymmdd : undefined)].join('/');
    return ref(db, path);
});

const $unsubscribe = atom< Unsubscribe | undefined >();
onSet($unsubscribe, x => {
    let unsubscribe = $unsubscribe.get();
    if (unsubscribe) unsubscribe();
});

const $read = atom< ((snapshot:DataSnapshot)=>void) | undefined >();
effect([$databaseRef, $read], (databaseRef, read)=>{
    if (databaseRef && read) {
        var unsubscribe = onValue(databaseRef, read);
        $unsubscribe.set(unsubscribe);
    }
});

const subscribe : (callback:(snapshot:DataSnapshot)=>void) => Unsubscribe | undefined =
    (callback) => {
        $read.set(callback);
        return $unsubscribe.get();
    };

const persistSession : (timestamp:Date, repCount:number)=>void =
    (timestamp, repCount) => {
        const currentTimeRef = $currentTimeRef.get();
        if ( currentTimeRef.level != 'day'
            || currentTimeRef.timestamp.getDate() != timestamp.getDate()
            || currentTimeRef.timestamp.getMonth() != timestamp.getMonth()
            || currentTimeRef.timestamp.getFullYear() != timestamp.getFullYear()) {
                $currentTimeRef.set({ timestamp:timestamp, level:'day' });
        }
        const reference = $databaseRef.get();
        const session = { timestamp:timestamp.getTime(), repCount:repCount };
        if (reference) push(reference, session);
    };

export { subscribe, persistSession};