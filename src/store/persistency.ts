import { Database, getDatabase, ref, push, get, type DatabaseReference, onValue } from "firebase/database";
import { $firebaseApp } from "./firebase";
import { atom, onMount } from "nanostores";
import { $uid } from "./authentication";

const DATABASE_URL = "https://hundredaday-3nsn-default-rtdb.europe-west1.firebasedatabase.app";

const $database = atom<Database | undefined>();
onMount($database, () => {
    $database.set(getDatabase($firebaseApp.get(), DATABASE_URL));
});

const getDatabaseReference : (timestamp:Date, level?:'day'|'month') => Promise<DatabaseReference> =
    async (timestamp, level="day") => {
        const db = $database.get();
        if (!db) throw Error("Database not found");

        const uid = await $uid.get();
        if (!uid) throw Error("uid not found");

        const yyyymmdd = timestamp.toISOString().substring(0,10);
        const yyyy = yyyymmdd.substring(0,4);
        const mm = yyyymmdd.substring(5,7);
        const path = [uid, yyyy, mm, (level=='day' ? yyyymmdd : undefined)]
            .join('/');

        return ref(db, path);
    };

export const retrieveDay (timestamp:Date) => {timestamp:Date, repCount:number}[] =
    async (timestamp) => {
        return await get(await getDatabaseReference(timestamp));
        
    };

export const persist : (timestamp:Date, repCount:number)=>void =
    async (timestamp, repCount) => push(
        await getDatabaseReference(timestamp), 
        { timestamp:timestamp.getTime(), repCount:repCount });