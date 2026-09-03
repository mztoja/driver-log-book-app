import CONFIG from "@/constants/CONFIG";
import API_ENDPOINTS from "@/constants/API_ENDPOINTS";
import { SnackbarType } from "@/context/SnackbarContext";
import { getText } from "@/utils/getText";
import { handleDtcErrors } from "@/utils/handleDtcErrors";
import { Dispatch, SetStateAction, useState } from "react";
import { useGlobalState } from "./useGlobalState";
import { useSnackbar } from "./useSnackbar";
import getToken from "@/utils/getToken";
import { refreshSession } from "@/utils/refreshSession";
import clearSession from "@/utils/clearSession";

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

const isExpired = (status: number, body: any): boolean =>
    status === 401 || body?.status === 401 || body?.dtc === 'Unauthorized';

const parseBody = (text: string): any => {
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
};

export const useApi = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const { lang, setUser } = useGlobalState();
    const { showSnackbar } = useSnackbar();

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

            const doFetch = async (token: string | null): Promise<Response> => {
                const headers: Record<string, string> = {
                    'is-mobile-app': 'true',
                    ...(method === 'GET'
                        ? { Accept: 'application/json' }
                        : { 'Content-Type': 'application/json' }),
                };
                if (!config?.withoutToken && token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
                return fetch(CONFIG.API_URL + endpoint, {
                    method,
                    headers,
                    body: method === 'GET' ? null : JSON.stringify(config?.sendData),
                });
            };

            let response = await doFetch(await getToken());
            let responseData = parseBody(await response.text());

            // Wygasła sesja – spróbuj odnowić refresh tokenem i powtórzyć raz.
            const canRefresh =
                !config?.withoutToken &&
                endpoint !== API_ENDPOINTS.LOGIN &&
                endpoint !== API_ENDPOINTS.REFRESH;
            if (canRefresh && isExpired(response.status, responseData)) {
                const refreshed = await refreshSession();
                if (refreshed) {
                    response = await doFetch(await getToken());
                    responseData = parseBody(await response.text());
                } else {
                    await clearSession();
                    setUser(null);
                    showSnackbar(getText('dtcErrors', 'sessionExpired', lang), 'error');
                    if (config?.setData) {
                        config.setData(null);
                    }
                    return { success: false };
                }
            }

            if (response.ok) {
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
