import * as SecureStore from 'expo-secure-store';
const storeToken = async (token: string): Promise<void> => {
    try {
        await SecureStore.setItemAsync('userToken', token);
    } catch (e) {
        console.error('Error storing token', e);
    }
};
export default storeToken;