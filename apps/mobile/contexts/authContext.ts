import { client, getSessionToken } from "@/services";
import { createContext, useContext, useEffect, useState } from "react";



const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [authToken, setAuthToken] = useState(null);

    const loadInitialData = async () => {
        try {
            const token = await getSessionToken();
            if (token) {
                const currentUser = await client.api.users.me.$get("", {
                    head
                })
            }
        } catch (error) {
            
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadInitialData();
    }, [])
}