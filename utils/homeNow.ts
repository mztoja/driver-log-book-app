import { COUNTRY_TIMEZONES } from '@/constants/COUNTRY_TIMEZONES';

/**
 * Bieżący moment wyrażony jako `Date`, którego LOKALNE komponenty
 * (getFullYear/getMonth/getDate/getHours/getMinutes) odpowiadają ścianie zegara
 * w kraju bazy kierowcy (`countryCode` – kraj miejsca typu `base` z profilu).
 *
 * Dzięki temu wpis do dziennika zawsze zawiera „godzinę domową" – nawet gdy telefon
 * przestawił się na strefę kraju, w którym kierowca aktualnie przebywa (jazda za granicą).
 * Do bazy trafia surowy string `YYYY-MM-DDTHH:MM` budowany z tych komponentów – bez konwersji stref.
 *
 * Gdy kraju nie ma w mapie stref albo `Intl` zawiedzie – zwraca czas urządzenia.
 */
export const homeNow = (countryCode?: string | null): Date => {
    const tz = countryCode ? COUNTRY_TIMEZONES[countryCode] : undefined;
    const now = new Date();
    if (!tz) return now;
    try {
        const parts = new Intl.DateTimeFormat('en-GB', {
            timeZone: tz,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        }).formatToParts(now);
        const get = (type: string): number => Number(parts.find((p) => p.type === type)?.value);
        const year = get('year');
        const month = get('month');
        const day = get('day');
        let hour = get('hour');
        const minute = get('minute');
        const second = get('second');
        if (hour === 24) hour = 0; // część silników zwraca 24 zamiast 0 o północy
        if ([year, month, day, hour, minute].some((n) => Number.isNaN(n))) return now;
        return new Date(year, month - 1, day, hour, minute, Number.isNaN(second) ? 0 : second);
    } catch {
        return now;
    }
};
