import { userLangEnum } from "@/types";

export type Lang = 'pl' | 'en';

export const getLang = (offlineLang: Lang, userLang?: userLangEnum): Lang => {

    switch (userLang) {
        case userLangEnum.pl:
            return 'pl';
        case userLangEnum.en:
            return 'en';
        default:
            return offlineLang;
    }
}