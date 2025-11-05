import { atom, computed, onMount, task } from "nanostores";
import { read, persist } from './persistency';

const REFRESH_RATE = 4 * 1000;
const minMax : (value: number, min: number, max: number) => number =
    (value, min, max) => Math.max(min, Math.min(value, max));
const timeInMinutes : (time?:Date) => number = 
    (time=new Date())=> time.getHours() * 60 + time.getMinutes();
const isSameDate : (date1:Date, date2:Date) => boolean = 
    (date1, date2) => date1.getFullYear() == date2.getFullYear() &&
        date1.getMonth() == date2.getMonth() &&
        date1.getDate() == date2.getDate();

const $config = atom<{ 
    startTime: { hours: number; minutes: number; }; 
    endTime: { hours: number; minutes: number; }; 
    goal: number; 
}>({ 
    startTime: { hours: 5, minutes: 0 }, 
    endTime: { hours: 17, minutes: 0 }, 
    goal: 100
});

const $units = computed($config, ({ startTime, endTime, goal }) => {
    const startTimeInMinutes = startTime.hours * 60 + startTime.minutes;
    const endTimeInMinues = endTime.hours * 60 + endTime.minutes;
    const minutesPerUnit = (endTimeInMinues - startTimeInMinutes) / goal;
    return { startTimeInMinutes, minutesPerUnit };
});

const $currentTime = atom(timeInMinutes());
onMount($currentTime, ()=>{
    const intervalId = setInterval(
        ()=>$currentTime.set(timeInMinutes()), 
        REFRESH_RATE);
    return () => clearInterval(intervalId);
});

const $projection = computed([$units, $currentTime], ( { startTimeInMinutes, minutesPerUnit }, currentTime ) => {
    return Math.ceil((currentTime - startTimeInMinutes) / minutesPerUnit);
});

const $history = atom<{ lastUpdated:Date, repCount:number } | undefined>();
onMount($history, () => {
    task(async () => 
        read((snapshot)=>{
            let lastUpdated = 0;
            let totalCount = 0;
            snapshot.forEach((entry) => {
                const { timestamp, repCount } = entry.val();
                lastUpdated = Math.max(lastUpdated, timestamp);
                totalCount += repCount;
            });
            $history.set({ 
                    lastUpdated: new Date(lastUpdated) , 
                    repCount: totalCount });
        })
    );
});

const $target = computed([$projection, $history, $config], (projection, history, { goal }) => {
    if (!history) return;
    const now = new Date();
    if (!isSameDate(now, history.lastUpdated)) {
        $history.set({ lastUpdated: now, repCount: 0 });
    }
    return minMax(minMax(projection, 0, goal) - history.repCount, 0, goal);
});

export const $countdown = computed([$config, $history, $target], ({ goal }, history, target) => {
    if (!history) return { goal, target };
    const { repCount } = history;
    const remaining = minMax(goal - repCount, 0, goal);
    const percentage = minMax(100* repCount / goal, 0, 100);
    return { goal, repCount, target, remaining, percentage };
});

export const logReps = (reps:number) => {
    persist(new Date(), reps);
};