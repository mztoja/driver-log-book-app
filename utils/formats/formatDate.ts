import { LangInterface } from '@/types';

// Czasy z bazy wyświetlamy DOSŁOWNIE – dokładnie te cyfry, które przyszły w stringu
// (`YYYY-MM-DDTHH:MM...`), bez tworzenia obiektu Date i bez przeliczeń stref.
// Silnik Hermes potrafi inaczej niż przeglądarka interpretować parsowanie dat i offsety,
// więc jedyną pewną metodą jest odczyt komponentów wprost z tekstu.
const DATE_TIME_RE = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/;

export const formatDate = (dateString: string, lang: LangInterface): string => {
    const daysOfWeek = lang === 'pl'
        ? ['(Niedz)', '(Pon)', '(Wt)', '(Śr)', '(Czw)', '(Pt)', '(Sob)']
        : ['(Sun)', '(Mon)', '(Tue)', '(Wed)', '(Thu)', '(Fri)', '(Sat)'];

    const m = DATE_TIME_RE.exec(dateString ?? '');
    if (!m) return '---';

    const [, year, month, day, hours, minutes] = m;
    // dzień tygodnia – czysta arytmetyka kalendarzowa w UTC (bez strefy urządzenia)
    const dowIndex = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))).getUTCDay();
    const dow = daysOfWeek[dowIndex];

    return `${dow} ${day}.${month}.${year.slice(-2)} ${hours ?? '00'}:${minutes ?? '00'}`;
};
