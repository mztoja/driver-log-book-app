import { LangInterface } from '@/types';

/*
 * Bieżący język aplikacji poza drzewem Reacta – dla getText() wywołanego bez parametru `lang`.
 * Wcześniej getText sięgał wtedy po hook useGlobalState(), co psuło kolejność hooków, gdy
 * wywołanie było warunkowe (np. element pokazywany dopiero po czasie) albo w obsłudze zdarzenia.
 * Aktualizowane synchronicznie przez GlobalStateProvider przy każdym renderze z nowym językiem.
 */
let currentLang: LangInterface = 'en';

export const setCurrentLang = (lang: LangInterface): void => {
    currentLang = lang;
};

export const getCurrentLang = (): LangInterface => currentLang;
