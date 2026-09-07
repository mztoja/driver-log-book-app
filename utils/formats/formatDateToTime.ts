// Godzina z bazy wyświetlana DOSŁOWNIE – dokładnie te cyfry, które przyszły w stringu
// (`...THH:MM...`), bez obiektu Date i bez przeliczeń stref (Hermes potrafi je psuć).
// `addHours` przesuwa samą godzinę ściany zegara (z zawinięciem w dobie).
export const formatDateToTime = (dateString: string, addHours?: number): string => {
    const m = /[T ](\d{2}):(\d{2})/.exec(dateString ?? '');
    if (!m) return '--:--';

    let hours = Number(m[1]);
    const minutes = m[2];

    if (addHours) {
        hours = (((hours + addHours) % 24) + 24) % 24;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes}`;
};
