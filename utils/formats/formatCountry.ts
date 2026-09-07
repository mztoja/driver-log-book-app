import { getText } from '@/utils/getText';
import { CountryCodesEntries, LangInterface } from '@/types';

export const formatCountry = (code: string, lang: LangInterface): string => {
    if (!code) return '';
    const name = getText('countries', code as keyof CountryCodesEntries, lang);
    return name || code;
};
