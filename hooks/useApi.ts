import CONFIG from "@/constants/CONFIG";
import { SnackbarType } from "@/context/SnackbarContext";
import { getText } from "@/utils/getText";
import { handleDtcErrors } from "@/utils/handleDtcErrors";
import { Dispatch, SetStateAction, useState } from "react";
import { useGlobalState } from "./useGlobalState";
import getToken from "@/utils/getToken";

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface Config<i> {
    method?: Method;
    sendData?: any;
    setData?: Dispatch<SetStateAction<i | null>>;
    withoutToken?: boolean;
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
    const { lang } = useGlobalState();

    const fetchData = async <i>(endpoint: string, config?: Config<i>, handleError?: HandleError): Promise<FetchDataResponse<i>> => {
        const token = await getToken();
        setLoading(true);
        if (config && config.sendData && config.setData) {
            throw new Error("You can't specify 'setData' and 'sendData' simultaneously.");
        }
        if (config && !config.sendData && !config.setData) {
            throw new Error("You have to specify: 'setData' or 'sendData'");
        }
        try {
            const method: Method = config && config.method ? config.method : 'GET';

            const response = !config?.withoutToken && token ?
                await fetch(CONFIG.API_URL + endpoint, {
                    method,
                    headers: method === 'GET'
                        ? {
                            'Authorization': `Bearer ${token}`,
                            Accept: 'application/json',
                            'is-mobile-app': 'true',
                        } : {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                            'is-mobile-app': 'true',
                        },
                    body: method === 'GET' ? null : JSON.stringify(config?.sendData),
                })
                :
                await fetch(CONFIG.API_URL + endpoint, {
                    method,
                    headers: method === 'GET'
                        ? {
                            Accept: 'application/json',
                            'is-mobile-app': 'true',
                        } : {
                            'Content-Type': 'application/json',
                            'is-mobile-app': 'true',
                        },
                    body: method === 'GET' ? null : JSON.stringify(config?.sendData),
            });
            // console.log('Response from', endpoint, ':\n', response);
            if (response.ok) {
                const textData = await response.text();
                const responseData = textData ? JSON.parse(textData) : null;
                // console.log('Data from', endpoint, ':\n', responseData);
                if (config?.sendData && responseData) {
                    if (handleError && responseData.dtc) {
                        const dtc = handleDtcErrors(responseData.dtc, lang);
                        handleError.showSnackbar(dtc.message, dtc.type);
                        return { success: false }
                    } else if (responseData.dtc) {
                        return { success: false }
                    }
                    return { success: true, responseData };
                } else if (!config || config.setData) {

                    if (config?.setData) {
                        if (!responseData) {
                            config.setData(null);
                            return { success: false }
                        }
                        if (!responseData.dtc) {
                            config.setData(responseData);
                            return { success: true, responseData };
                        }
                    }

                    // if (!responseData.dtc && responseData) {
                    //     if (config && config.setData) {
                    //         config.setData(responseData);
                    //     }
                    //     return { success: true, responseData };
                    // }
                }
            }
            if (config?.setData) {
                config.setData(null);
            }
            return { success: false };
        } catch (e) {
            if (config?.sendData && handleError) {
                handleError.showSnackbar(getText('dtcErrors', 'apiConnectionError', lang), 'error');
            }
            return { success: false, error: e };
        } finally {
            setLoading(false);
        }
    };

    return { loading, fetchData };

}