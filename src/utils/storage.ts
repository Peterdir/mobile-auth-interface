import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';
const USER_INFO_KEY = 'user_info';

export const storage = {
    saveToken: async (token: string) => {
        try {
            await AsyncStorage.setItem(TOKEN_KEY, token);
        } catch (e) {
            console.error('Failed to save token', e);
        }
    },
    getToken: async () => {
        try {
            return await AsyncStorage.getItem(TOKEN_KEY);
        } catch (e) {
            console.error('Failed to get token', e);
            return null;
        }
    },
    removeToken: async () => {
        try {
            await AsyncStorage.removeItem(TOKEN_KEY);
        } catch (e) {
            console.error('Failed to remove token', e);
        }
    },
    saveUserInfo: async (userInfo: any) => {
        try {
            await AsyncStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
        } catch (e) {
            console.error('Failed to save user info', e);
        }
    },
    getUserInfo: async () => {
        try {
            const jsonValue = await AsyncStorage.getItem(USER_INFO_KEY);
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (e) {
            console.error('Failed to get user info', e);
            return null;
        }
    },
    removeUserInfo: async () => {
        try {
            await AsyncStorage.removeItem(USER_INFO_KEY);
        } catch (e) {
            console.error('Failed to remove user info', e);
        }
    },
    clearAll: async () => {
        try {
            await AsyncStorage.multiRemove([TOKEN_KEY, USER_INFO_KEY]);
        } catch (e) {
            console.error("Failed to clear storage", e);
        }
    }
};
