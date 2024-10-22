import * as SecureStore from 'expo-secure-store';
const getToken = async () => {
    try {
        const token = await SecureStore.getItemAsync('userToken');
        return token;
    } catch (e) {
        console.error('Error retrieving token', e);
        return null;
    }
};
export default getToken;