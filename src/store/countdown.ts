import { atom, computed, onMount, onSet, task } from "nanostores";
import { persist } from './persistency';

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

const $history = atom<{ lastUpdated:Date, repCount:number}>({
    lastUpdated: new Date(),
    repCount: 0
});
onMount($history, () => {
    task(async () => {
        const saved = await localStorage.getItem('100aDay');
        if (!saved) { return; }
        const { lastUpdated, repCount } = JSON.parse(saved);
        if (!lastUpdated) { return; };
        if ( repCount == undefined || repCount == null ) { return; }
        
        $history.set({ lastUpdated: new Date(lastUpdated) , repCount });
    });
});
onSet($history, ({ newValue }) => {
    if ($history.get()?.lastUpdated == newValue.lastUpdated) {
        return;
    }
    persist(newValue.lastUpdated, newValue.repCount);
    localStorage.setItem('100aDay', JSON.stringify(newValue));
});

const $target = computed([$projection, $history, $config], (projection, { lastUpdated, repCount }, { goal }) => {
    const now = new Date();
    if (!isSameDate(now, lastUpdated)) {
        $history.set({ lastUpdated: now, repCount: 0 });
    }
    return minMax(minMax(projection, 0, goal) - repCount, 0, goal);
});

export const $countdown = computed([$config, $history, $target], ({ goal }, { repCount }, target) => {
    const remaining = minMax(goal - repCount, 0, goal);
    const percentage = minMax(100* repCount / goal, 0, 100);
    return { goal, repCount, target, remaining, percentage };
});

export const logReps = (reps:number) => {
    const now = new Date();
    const { lastUpdated, repCount } = $history.get();
    const newRepCount = isSameDate(lastUpdated, now) ? reps + repCount : reps;
    $history.set({ 
        lastUpdated: now, 
        repCount: newRepCount
    });
};