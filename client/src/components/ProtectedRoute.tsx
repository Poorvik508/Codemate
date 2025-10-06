// src/components/ProtectedRoute.tsx

import { useAuth } from "@/context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";


const ProtectedRoute = () => {
  const { isLoggedIn, isLoading } = useAuth();

  // 1. While the auth state is loading, show a spinner
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // 2. If loading is finished and user is logged in, show the requested page
  if (isLoggedIn) {
    return <Outlet />; // Renders the child route element
  }

  // 3. If loading is finished and user is not logged in, redirect to login
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;