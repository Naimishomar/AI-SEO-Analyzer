import type { AxiosInstance } from "axios";
import axios from "axios";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

interface User{
    id: string;
    name: string;
    email: string;
    plan: string;
    analysisCount?: number;
}

interface AuthContextType{
    user: User | null;
    token: string | null;
    loading: boolean;
    api: AxiosInstance;
    login: (email: string, password: string)=> Promise<{success: boolean; message?: string}>;
    register: (name: string, email: string, password: string)=> Promise<{success: boolean; message?: string}>;
    logout: ()=> void;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}:{children: ReactNode}){
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
    const [loading, setLoading] = useState(true);

    const api = useMemo(() => {
        const instance = axios.create({
            baseURL: BACKEND_URL
        });

        instance.interceptors.request.use((config) => {
            const token = localStorage.getItem("token");

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            return config;
        });

        return instance;
    }, []);

    const loadUser = async()=>{
        if(!token){
            setLoading(false);
            return;
        }
        try {
            const {data} = await api.get("/api/auth/profile");
            if(data.success){
                setUser(data.user);
            }
        } catch (error: any) {
            console.error(error);
            localStorage.removeItem("token");
            setToken(null);
            setUser(null);
        }
        setLoading(false);
    }

    useEffect(()=>{
        loadUser();
    },[token])

    const login = async(email: string, password: string)=>{
        try {
            const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {email, password});
            if(response.data.success){
                localStorage.setItem("token", response.data.token);
                setToken(response.data.token);
                setUser(response.data.user);
                return {success: true};
            }
            return {success: false, message: response.data.message};
        } catch (error: any) {
            return {success: false, message: error.response?.data?.message || "Login Failed"};
        } 
    }

    const register = async(name: string, email: string, password: string)=>{
        try {
            const response = await axios.post(`${BACKEND_URL}/api/auth/register`, {name, email, password});
            if(response.data.success){
                localStorage.setItem("token", response.data.token);
                setToken(response.data.token);
                setUser(response.data.user);
                return {success: true};
            }
            return {success: false, message: response.data.message};
        } catch (error: any) {
            return {success: false, message: error.response?.data?.message || "Registration Failed"};
        } 
    }

    const logout = ()=>{
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
    }

    const value = {user, token, loading, api, login, register, logout};

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(){
    const context = useContext(AuthContext);
    if(!context){
        throw new Error("useAuth must be used within a AuthProvider");
    }
    return context;
}