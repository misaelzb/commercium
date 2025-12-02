import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "session_token";

export const saveSessionToken = async (token: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    return token;
};

export const getSessionToken = async () => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    return token;
};