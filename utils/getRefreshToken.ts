import * as SecureStore from 'expo-secure-store';
const getRefreshToken = async (): Promise<string | null> => {
    try {
        return await SecureStore.getItemAsync('refreshToken');
    } catch (e) {
        console.error('Error retrieving refresh token', e);
        return null;
    }
};
export default getRefreshToken;
