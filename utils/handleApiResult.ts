import { SnackbarType } from "@/context/SnackbarContext";
import { LangInterface } from "@/types";
import { getText } from "./getText";
import { handleDtcErrors } from "./handleDtcErrors";

export const handleApiResult = (
    result: any,
    showSnackbar: (text: string, type: SnackbarType) => void,
    action: () => void,
    lang: LangInterface
): void => {
    if (result && !result.success) {
        showSnackbar(getText('dtcErrors', 'apiConnectionError', lang), 'error');
    } else {
        if (result && result.responseData) {
            if (!result.responseData.dtc) {
                action();
            } else {
                const dtc = handleDtcErrors(result.responseData.dtc, lang);
                showSnackbar(dtc.message, dtc.type);
            }
        }
    }
}