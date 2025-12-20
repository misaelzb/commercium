import {
  client,
  deleteSessionToken,
  getSessionToken,
  saveSessionToken,
} from "@/services";
import { createContext, useContext, useEffect, useState } from "react";
import { ApiResponse, Store, User } from "@commercium/core";

interface AuthContextType {
  currentUser: (User.InfoType & { stores: Store.StoreType[] }) | null;
  isLoading: boolean;
  authHeader: { Authorization: string };
  signUp: (data: User.CreateData) => Promise<ApiResponse>; // does not return user! must sign in after register
  signIn: (data: User.LoginData) => Promise<ApiResponse>;
  signOut: () => Promise<void>;
  revalidateUser: () => Promise<void>;
}

//@ts-ignore
const AuthContext = createContext<AuthContextType>(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User.InfoType | null>(null);
  const [stores, setStores] = useState<Store.StoreType[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const loadInitialData = async () => {
    try {
      const token = await getSessionToken();
      if (token) {
        // if there's a session token stored
        const authHeader = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };
        let cuResponse = await client.api.users.me.$get(
          {},
          {
            headers: authHeader,
          }
        );
        let json = await cuResponse.json();
        if (!json.error) {
          // user session is NOT expired
          let storesResponse = await client.api.stores.list.$get(
            {},
            {
              headers: authHeader,
            }
          );
          let sJson = await storesResponse.json();
          if (json.error) {
            throw new Error(sJson.error);
          }
          setAuthToken(token);
          console.log(sJson);
          setStores(sJson.data as Store.StoreType[]);
          setUser(json.data);
        } else {
          // user session is expired
          await deleteSessionToken();
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  const revalidateUser = async () => {
    await loadInitialData();
  };
  useEffect(() => {
    loadInitialData();
  }, []);
  const authHeader = {
    Authorization: `Bearer ${authToken}`,
  };
  const signUp = async ({
    username,
    password,
    firstName,
    lastName,
  }: User.CreateData) => {
    let response = await client.api.auth.register.$post(
      {
        json: {
          username,
          password,
          firstName,
          lastName,
        },
      },
      { headers: authHeader }
    );
    let json = await response.json();
    return json as ApiResponse;
  };

  const signIn = async ({ username, password }: User.LoginData) => {
    let response = await client.api.auth.login.$post(
      {
        json: {
          username,
          password,
        },
      },
      { headers: authHeader }
    );
    let json = await response.json();
    if (!json.error) {
      setAuthToken(json.data);
      await saveSessionToken(json.data);
      await revalidateUser();
    }
    return json as ApiResponse;
  };

  const signOut = async () => {
    await client.api.auth.logout.$get({}, { headers: authHeader });
    await deleteSessionToken();
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser: user
          ? {
              ...user,
              stores: stores!,
            }
          : null,
        isLoading,
        signUp,
        signIn,
        signOut,
        authHeader,
        revalidateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
