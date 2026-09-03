import * as SecureStore from 'expo-secure-store';
const storeRefreshToken = async (token: string): Promise<void> => {
    try {
        await SecureStore.setItemAsync('refreshToken', token);
    } catch (e) {
        console.error('Error storing refresh token', e);
    }
};
export default storeRefreshToken;
