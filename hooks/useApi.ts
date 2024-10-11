import CONFIG from "@/constants/CONFIG";
import { SnackbarType } from "@/context/SnackbarContext";
import { getText } from "@/utils/getText";
import { handleDtcErrors } from "@/utils/handleDtcErrors";
import { Dispatch, SetStateAction, useState } from "react";
import { useGlobalState } from "./useGlobalState";

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface Config<i> {
    method?: Method;
    sendData?: any;
    setData?: Dispatch<SetStateAction<i | null>>;
}

interface HandleError {
    showSnackbar: (text: string, type: SnackbarType) => void;
}

interface FetchDataResponse<i> {
    success: boolean,
    responseData?: i,
    error?: any,
}

export const useApi = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const { user, lang: offlineLang } = useGlobalState();

    const fetchData = async <i>(endpoint: string, config?: Config<i>, handleError?: HandleError): Promise<FetchDataResponse<i>> => {
        setLoading(true);
        if (config && config.sendData && config.setData) {
            throw new Error("You can't specify 'setData' and 'sendData' simultaneously.");
        }
        if (config && !config.sendData && !config.setData) {
            throw new Error("You have to specify: 'setData' or 'sendData'");
        }
        try {
            const method: Method = config && config.method ? config.method : 'GET';
            const response = await fetch(CONFIG.API_URL + endpoint, {
                method,
                headers: method === 'GET' ? { Accept: 'application/json' } : { 'Content-Type': 'application/json' },
                body: method === 'GET' ? null : JSON.stringify(config?.sendData),
                credentials: "include",
            });
            if (response.ok) {
                const responseData = await response.json();
                if (config?.sendData) {
                    if (handleError && responseData.dtc) {
                        const dtc = handleDtcErrors(responseData.dtc, { user, offlineLang });
                        handleError.showSnackbar(dtc.message, dtc.type);
                        return { success: false }
                    }
                    return { success: true, responseData };
                } else if (!config || config.setData) {
                    if (!responseData.dtc && responseData) {
                        if (config && config.setData) {
                            config.setData(responseData);
                        }
                        return { success: true, responseData };
                    }
                }
            }
            return { success: false };
        } catch (e) {
            if (config?.sendData && handleError) {
                handleError.showSnackbar(getText('dtcErrors', 'apiConnectionError', { user, offlineLang }), 'error');
            }
            return { success: false, error: e };
        } finally {
            setLoading(false);
        }
    };

    return { loading, fetchData };

}