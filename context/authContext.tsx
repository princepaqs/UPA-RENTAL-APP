import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// Define the shape of the context
interface AuthContextType {
    user: any;
    isAuthenticated: boolean | undefined;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (email: string, password: string, username: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(undefined);

    useEffect(() => {
        setTimeout(() =>{
            setIsAuthenticated(true);
        }, 3000);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            // login logic
        } catch (error) {
            console.error(error);
        }
    };

    const logout = async () => {
        try {
            // logout logic
        } catch (error) {
            console.error(error);
        }
    };

    const register = async (email: string, password: string, username: string) => {
        try {
            // registration logic
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const value = useContext(AuthContext);

    if (!value) {
        throw new Error("useAuth must be wrapped inside AuthContextProvider");
    }
    return value;
};
