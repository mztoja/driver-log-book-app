import { common } from "@/assets/text/common";
import { useGlobalState } from "@/hooks/useGlobalState";
import { CommonInterface, userLangEnum } from "@/types";

interface HomeInterface {
    pl: {
        abc: string;
    },
    en: {
        abc: string;
    }
}
const home: HomeInterface = {
    pl: {
        abc: 'ABC',
    },
    en: {
        abc: 'ABC',
    },
}

type Group = 'common' | 'home';
type TextCommon = keyof CommonInterface['en'];
type TextHome = keyof HomeInterface['en'];
type Text = TextCommon | TextHome;
type Lang = 'pl' | 'en';

interface GetText {
    (group: 'common', text: TextCommon): string;
    (group: 'home', text: TextHome): string;
}

export const getText: GetText = (group: Group, text: Text): string => {
    const { user, lang: offlineLang } = useGlobalState();
    let lang: Lang = 'en';
    switch (user?.lang) {
        case userLangEnum.pl:
            lang = 'pl';
            break;
        case userLangEnum.en:
            lang = 'en';
            break;
        default:
            lang = offlineLang;
            break;
    }

    switch (group) {
        case 'common':
            return common[lang][text as TextCommon];
        case 'home':
            return home[lang][text as TextHome];
        default:
            return '';
    }
}