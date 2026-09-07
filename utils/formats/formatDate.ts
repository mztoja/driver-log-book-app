import { LangInterface } from '@/types';

export const formatDate = (dateString: string, lang: LangInterface): string => {
    const daysOfWeek = lang === 'pl'
        ? ['(Niedz)', '(Pon)', '(Wt)', '(Śr)', '(Czw)', '(Pt)', '(Sob)']
        : ['(Sun)', '(Mon)', '(Tue)', '(Wed)', '(Thu)', '(Fri)', '(Sat)'];
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '---';
    const dow = daysOfWeek[date.getUTCDay()];
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = date.getUTCFullYear().toString().slice(-2);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${dow} ${day}.${month}.${year} ${hours}:${minutes}`;
};
