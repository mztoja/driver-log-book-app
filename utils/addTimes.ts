import { calcSecondsFromTime } from "./calcSecondsFromTime";

// Odpowiednik driver-log-book-back/src/utlis/addTimes.ts — dolicza sekundy do istniejącego hh:mm.
export const addTimes = (time1: string, seconds: number): string => {
    const timeInSeconds = calcSecondsFromTime(time1) + seconds;
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};
