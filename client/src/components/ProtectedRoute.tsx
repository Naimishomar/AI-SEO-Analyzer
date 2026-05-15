import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loading from "./Loading";

export default function ProtectedRoute() {
    const { token, loading } = useAuth();

    if(loading){
        return (
            <Loading/>
        );
    }

    if(!token){
        return <Navigate to='/login' replace />
    }
    return <Outlet />;
}
