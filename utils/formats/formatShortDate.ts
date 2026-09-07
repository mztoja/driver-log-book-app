// Data z bazy wyświetlana DOSŁOWNIE (bez obiektu Date, bez przeliczeń stref).
// Obsługuje `YYYY-MM-DD`, `YYYY-MM-DDTHH:MM...` oraz `YYYY-MM` (etykieta miesiąca).
export const formatShortDate = (dateString: string): string => {
    if (!dateString) return '---';

    const full = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateString);
    if (full) {
        const [, year, month, day] = full;
        return `${day}.${month}.${year}`;
    }

    const yearMonth = /^(\d{4})-(\d{2})$/.exec(dateString);
    if (yearMonth) {
        const [, year, month] = yearMonth;
        return `01.${month}.${year}`;
    }

    return '---';
};
