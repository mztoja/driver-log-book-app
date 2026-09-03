import CONFIG from "@/constants/CONFIG";
import API_ENDPOINTS from "@/constants/API_ENDPOINTS";
import getRefreshToken from "./getRefreshToken";
import storeToken from "./storeToken";
import storeRefreshToken from "./storeRefreshToken";

/**
 * Odnowienie sesji przy użyciu refresh tokena (SecureStore) – single-flight:
 * równoległe wywołania współdzielą jedną prośbę do /auth/refresh.
 * Po sukcesie zapisuje nowy access + refresh token i zwraca true.
 */

let refreshPromise: Promise<boolean> | null = null;

const doRefresh = async (): Promise<boolean> => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) return false;
    try {
        const res = await fetch(CONFIG.API_URL + API_ENDPOINTS.REFRESH, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'is-mobile-app': 'true',
                'x-refresh-token': refreshToken,
            },
        });
        if (!res.ok) return false;
        const data = await res.json();
        if (!data?.accessToken || !data?.refreshToken) return false;
        await storeToken(data.accessToken);
        await storeRefreshToken(data.refreshToken);
        return true;
    } catch {
        return false;
    }
};

export const refreshSession = (): Promise<boolean> => {
    if (!refreshPromise) {
        refreshPromise = doRefresh().finally(() => {
            refreshPromise = null;
        });
    }
    return refreshPromise;
};
