// "1234:12" -> "1 234:12 h" (godziny bez ograniczenia do 2 cyfr, separator tysięcy)
export const formatBigTime = (hm: string): string => {
    const [h, m] = (hm ?? '0:00').split(':');
    const hoursSep = (h ?? '0').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `${hoursSep}:${(m ?? '00').padStart(2, '0')} h`;
};
