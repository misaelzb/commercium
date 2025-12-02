import { client, getSessionToken } from "@/services";
import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@commercium/core"


interface AuthContextType {
    currentUser: User.InfoType | null;
    isLoading: boolean;
    authHeaders: {
        Authorization: string;
    };
}

//@ts-ignore
const AuthContext = createContext<AuthContextType>(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User.InfoType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [authToken, setAuthToken] = useState<string | null>(null);

    const loadInitialData = async () => {
        try {
            const token = await getSessionToken();
            if (token) { // if there's a session token stored
                let cuResponse = await client.api.users.me.$get({
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                let json = await cuResponse.json();
                if (!json.error) { // user session is NOT expired
                    setUser(json.data);
                    setAuthToken(token);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadInitialData();
    }, []);

    const value: AuthContextType = {
        currentUser: user,
        isLoading,
        authHeaders: {
            'Authorization': `Bearer ${authToken}`,
        }
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}