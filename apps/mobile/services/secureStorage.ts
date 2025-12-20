import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "session_token";

export const saveSessionToken = async (token: string) => {
  if (Platform.OS == "web") await AsyncStorage.setItem(TOKEN_KEY, token);
  else await SecureStore.setItemAsync(TOKEN_KEY, token);

  return token;
};

export const getSessionToken = async () => {
  if (Platform.OS == "web") return await AsyncStorage.getItem(TOKEN_KEY);
  return await SecureStore.getItemAsync(TOKEN_KEY);
};

export const deleteSessionToken = async () => {
  if (Platform.OS == "web") await AsyncStorage.removeItem(TOKEN_KEY);
  else await SecureStore.deleteItemAsync(TOKEN_KEY);
  return true;
};
