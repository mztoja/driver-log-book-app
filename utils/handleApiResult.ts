import { SnackbarType } from "@/context/SnackbarContext";
import { getText } from "./getText";
import { handleDtcErrors } from "./handleDtcErrors";

export const handleApiResult = (
    result: any,
    showSnackbar: (text: string, type: SnackbarType) => void,
    action: () => void
): void => {
    if (result && !result.success) {
        showSnackbar(getText('dtcErrors', 'apiConnectionError'), 'error');
    } else {
        if (result && result.responseData) {
            if (!result.responseData.dtc) {
                action();
            } else {
                const dtc = handleDtcErrors(result.responseData.dtc);
                showSnackbar(dtc.message, dtc.type);
            }
        }
    }
}