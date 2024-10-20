import { common } from "@/assets/text/common";
import { countries } from "@/assets/text/countries";
import { dtcErrors } from "@/assets/text/dtcErrors";
import { useGlobalState } from "@/hooks/useGlobalState";
import { CommonInterface, DtcErrorsInterface, LangInterface, CountriesInterface } from "@/types";

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

type Group = 'common' | 'home' | 'dtcErrors' | 'countries';
type TextCommon = keyof CommonInterface['en'];
type TextHome = keyof HomeInterface['en'];
type TextDtcErrors = keyof DtcErrorsInterface['en'];
type TextCountries = keyof CountriesInterface['en'];
type Text = TextCommon | TextHome | TextDtcErrors | TextCountries;

interface GetText {
    (group: 'common', text: TextCommon, lang?: LangInterface): string;
    (group: 'home', text: TextHome, lang?: LangInterface): string;
    (group: 'dtcErrors', text: TextDtcErrors, lang?: LangInterface): string;
    (group: 'countries', text: TextCountries, lang?: LangInterface): string;
}

// const getTextGroup = (group: Group, text: Text, lang: LangInterface): string => {

//     switch (group) {
//         case 'common':
//             return common[lang][text as TextCommon];
//         case 'home':
//             return home[lang][text as TextHome];
//         case 'dtcErrors':
//             return dtcErrors[lang][text as TextDtcErrors];
//         default:
//             return '';
//     }
// }

export const getText: GetText = (group: Group, text: Text, langValue?: LangInterface): string => {
    // if (globalData) {
    //     return getTextGroup(group, text, globalData.lang);
    // }
    // else {
    //     const { lang } = useGlobalState();
    //     return getTextGroup(group, text, lang);
    // }
    const lang = langValue ? langValue : useGlobalState().lang;

    switch (group) {
        case 'common':
            return common[lang][text as TextCommon];
        case 'home':
            return home[lang][text as TextHome];
        case 'dtcErrors':
            return dtcErrors[lang][text as TextDtcErrors];
        case 'countries':
            return countries[lang][text as TextCountries];
        default:
            return '';
    }

}