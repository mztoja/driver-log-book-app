import { dayStatusEnum, DayInterface } from "@/types";

/**
 * Odpowiednik front `utils/getResumableDay.ts`.
 * Szuka najnowszego zakończonego dnia pracy w przekazanej liście dni trasy, który rozpoczął się
 * nie więcej niż 15h temu (pojedyncza obsada) / 21h temu (podwójna obsada, wg doubleCrew tego dnia)
 * — próg wg jego rozpoczęcia sugeruje, że przerwa nie była pełnym odpoczynkiem, więc dzień
 * nadaje się do wznowienia zamiast rozpoczynania nowego.
 *
 * Data z bazy to surowa „ściana zegara" bazy (zob. utils/homeNow.ts) – parsujemy ją regexem
 * (bez stref, Hermes potrafi je psuć) i porównujemy z `now` = homeNow(kraj bazy).
 */
export const getResumableDay = (days: DayInterface[], now: Date): DayInterface | null => {
    const lastFinished = days.find((day) => day.status === dayStatusEnum.finished);
    if (!lastFinished || !lastFinished.startData) {
        return null;
    }
    const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(String(lastFinished.startData.date));
    if (!m) {
        return null;
    }
    const startDate = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]));
    const thresholdHours = lastFinished.doubleCrew ? 21 : 15;
    const elapsedHours = (now.getTime() - startDate.getTime()) / 3600000;
    return elapsedHours >= 0 && elapsedHours <= thresholdHours ? lastFinished : null;
};
