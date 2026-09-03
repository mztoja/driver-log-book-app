import * as SecureStore from 'expo-secure-store';

/** Usuwa access token i refresh token z bezpiecznego magazynu (wylogowanie / wygasła sesja). */
const clearSession = async (): Promise<void> => {
    try {
        await SecureStore.deleteItemAsync('userToken');
    } catch (e) {
        console.error('Error clearing token', e);
    }
    try {
        await SecureStore.deleteItemAsync('refreshToken');
    } catch (e) {
        console.error('Error clearing refresh token', e);
    }
};
export default clearSession;
