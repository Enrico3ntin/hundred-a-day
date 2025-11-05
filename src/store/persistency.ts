import { Database, getDatabase, ref, push, type DatabaseReference, onValue, DataSnapshot, type Unsubscribe } from "firebase/database";
import { $firebaseApp } from "./firebase";
import { atom, onMount, computed, onSet, effect } from "nanostores";
import { $uid } from "./authentication";

const DATABASE_URL = "https://hundredaday-3nsn-default-rtdb.europe-west1.firebasedatabase.app";

const $database = atom<Database | undefined>();
onMount($database, () => {
    $database.set(getDatabase($firebaseApp.get(), DATABASE_URL));
});

const $currentTimeRef = atom<{ timestamp:Date, level?:'day'|'month'}>
    ({ timestamp:new Date(), level:'day'});
const $databaseRef = computed([$uid, $database, $currentTimeRef], (uid, db, { timestamp, level }) => {
    if (!uid || !db) return;
    const yyyymmdd = timestamp.toISOString().substring(0,10);
    const yyyy = yyyymmdd.substring(0,4);
    const mm = yyyymmdd.substring(5,7);
    const path = [uid, yyyy, mm, (level=='day' ? yyyymmdd : undefined)].join('/');
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

export const read : (callback:(snapshot:DataSnapshot)=>void) => Unsubscribe | undefined =
    (callback) => {
        $read.set(callback);
        return $unsubscribe.get();
    }

export const persist : (timestamp:Date, repCount:number)=>void =
    (timestamp, repCount) => {
        const reference = $databaseRef.get();
        const session = { timestamp:timestamp.getTime(), repCount:repCount };
        if (reference) push(reference, session);
    }