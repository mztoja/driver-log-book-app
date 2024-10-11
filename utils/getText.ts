import { common } from "@/assets/text/common";
import { dtcErrors } from "@/assets/text/dtcErrors";
import { useGlobalState } from "@/hooks/useGlobalState";
import { CommonInterface, DtcErrorsInterface, UserInterface, userLangEnum } from "@/types";

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

interface GlobalData {
    user: UserInterface | null;
    offlineLang: Lang;
}

type Group = 'common' | 'home' | 'dtcErrors';
type TextCommon = keyof CommonInterface['en'];
type TextHome = keyof HomeInterface['en'];
type TextDtcErrors = keyof DtcErrorsInterface['en'];
type Text = TextCommon | TextHome | TextDtcErrors;
export type Lang = 'pl' | 'en';

interface GetText {
    (group: 'common', text: TextCommon, globalData?: GlobalData): string;
    (group: 'home', text: TextHome, globalData?: GlobalData): string;
    (group: 'dtcErrors', text: TextDtcErrors, globalData?: GlobalData): string;
}

const getLang = (offlineLang: Lang, userLang?: userLangEnum): Lang => {

    switch (userLang) {
        case userLangEnum.pl:
            return 'pl';
        case userLangEnum.en:
            return 'en';
        default:
            return offlineLang;
    }
}

const getTextGroup = (group: Group, text: Text, lang: Lang): string => {

    switch (group) {
        case 'common':
            return common[lang][text as TextCommon];
        case 'home':
            return home[lang][text as TextHome];
        case 'dtcErrors':
            return dtcErrors[lang][text as TextDtcErrors];
        default:
            return '';
    }
}

// wydziel funkjce getlang i gettextgroup i zmien parametry 2 na jeden obiekt

export const getText: GetText = (group: Group, text: Text, globalData?: GlobalData): string => {
    if (globalData) {

        const lang = getLang(globalData.offlineLang, globalData.user?.lang);
        return getTextGroup(group, text, lang);

    }
    else {
        const { user, lang: offlineLang } = useGlobalState();
        const lang = getLang(offlineLang, user?.lang);
        return getTextGroup(group, text, lang);
    }

}