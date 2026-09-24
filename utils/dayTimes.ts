import { dayCardStateEnum, DayInterface } from '@/types';

/**
 * Odpowiedniki front `utils/calcWorkTime.ts`, `calcBreakTime.ts`, `subtractDatesToTime.ts`.
 * day.workTime / day.breakTime nie są już aktualizowane przez backend – liczymy je z dat start/stop.
 * Daty z bazy to surowa „ściana zegara" bazy: parsujemy je regexem (bez stref, Hermes potrafi je psuć),
 * a „teraz" dla dni w toku to `now` = homeNow(kraj bazy).
 */

const toWallDate = (dateString: string): Date | null => {
    const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(String(dateString ?? ''));
    if (!m) return null;
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]));
};

const diffToTime = (a: Date, b: Date): string => {
    const diff = Math.abs(a.getTime() - b.getTime());
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
};

export const subtractDatesToTime = (higherDate: string, lowerDate: string): string => {
    const a = toWallDate(higherDate);
    const b = toWallDate(lowerDate);
    return a && b ? diffToTime(a, b) : '0:00';
};

/** Czas pracy dnia: stop − start, a dla dnia w toku na żywo względem `now`. */
export const calcWorkTime = (day: DayInterface, now: Date): string => {
    if (!day.startData) return '0:00';
    if (day.stopData) return subtractDatesToTime(day.stopData.date, day.startData.date);
    const start = toWallDate(day.startData.date);
    return start ? diffToTime(now, start) : '0:00';
};

/**
 * Pauza po dniu z użytą kartą: do startu najbliższego późniejszego dnia z użytą kartą
 * (pomijając dni bez karty). `days` posortowane malejąco po id (jak zwraca API).
 * Gdy kolejnego dnia jeszcze nie ma – pauza trwa, liczona na żywo względem `now`.
 */
export const calcBreakTime = (days: DayInterface[], day: DayInterface, now: Date): string | null => {
    if (day.cardState === dayCardStateEnum.notUsed || !day.stopData) return null;
    const idx = days.findIndex((d) => d.id === day.id);
    if (idx === -1) return null;
    for (let i = idx - 1; i >= 0; i--) {
        const candidate = days[i];
        if (candidate.cardState !== dayCardStateEnum.notUsed && candidate.startData) {
            return subtractDatesToTime(candidate.startData.date, day.stopData.date);
        }
    }
    const stop = toWallDate(day.stopData.date);
    return stop ? diffToTime(now, stop) : null;
};
