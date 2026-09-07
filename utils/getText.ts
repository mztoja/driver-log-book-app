import { common } from "@/assets/text/common";
import { countries } from "@/assets/text/countries";
import { dtcErrors } from "@/assets/text/dtcErrors";
import { home } from "@/assets/text/home";
import { info } from "@/assets/text/info";
import { useGlobalState } from "@/hooks/useGlobalState";
import { CommonInterface, DtcErrorsInterface, LangInterface, CountriesInterface, InfoInterface } from "@/types";
import { HomeInterface } from "@/types/text/HomeInterface";

type Group = 'common' | 'home' | 'dtcErrors' | 'countries' | 'info';
type TextCommon = keyof CommonInterface['en'];
type TextHome = keyof HomeInterface['en'];
type TextDtcErrors = keyof DtcErrorsInterface['en'];
type TextCountries = keyof CountriesInterface['en'];
type TextInfo = keyof InfoInterface['en'];
type Text = TextCommon | TextHome | TextDtcErrors | TextCountries | TextInfo;

interface GetText {
    (group: 'common', text: TextCommon, lang?: LangInterface, params?: string): string;
    (group: 'home', text: TextHome, lang?: LangInterface, params?: string): string;
    (group: 'dtcErrors', text: TextDtcErrors, lang?: LangInterface, params?: string): string;
    (group: 'countries', text: TextCountries, lang?: LangInterface, params?: string): string;
    (group: 'info', text: TextInfo, lang?: LangInterface, params?: string): string;
}


export const getText: GetText = (group: Group, text: Text, langValue?: LangInterface, params?: string): string => {

    const lang = langValue ? langValue : useGlobalState().lang;

    const entry = (() => {
        switch (group) {
            case 'common':
                return common[lang][text as TextCommon];
            case 'home':
                return home[lang][text as TextHome];
            case 'dtcErrors':
                return dtcErrors[lang][text as TextDtcErrors];
            case 'countries':
                return countries[lang][text as TextCountries];
            case 'info':
                return info[lang][text as TextInfo];
            default:
                return '';
        }
    })();

    return typeof entry === 'function' ? entry(params || '') : entry;

}
