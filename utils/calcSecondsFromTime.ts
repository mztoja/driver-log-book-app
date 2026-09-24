// Odpowiednik driver-log-book-back/src/utlis/calcSecondsFromTime.ts — hh:mm -> liczba sekund.
// Pusty string traktujemy jako 0 (wywoływane też na jeszcze niewypełnionych polach).
export const calcSecondsFromTime = (time: string): number => {
    if (!time) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return (hours || 0) * 3600 + (minutes || 0) * 60;
};
