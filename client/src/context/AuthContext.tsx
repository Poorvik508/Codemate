// src/context/AuthContext.tsx

import axios from "axios";
import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface User {
  _id: string;
  name: string;
  email: string;
  isAccountVerified: boolean;
  profilePic?: string;
  location?: string;
  availability?: string;
  college?: string;
  bio?: string;
  skills?: string[];
}

// TYPEFIX: Accurately reflect that login and logout are async
interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  refetchUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  axios.defaults.withCredentials = true;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { toast } = useToast();
  const navigate = useNavigate();

  // REFACTORED: This is now the single source of truth for fetching user data.
  const refetchUser = async () => {
    try {
      const userDataResponse = await axios.get(`${backendUrl}/api/profile/profile`);
      if (userDataResponse.data.success) {
        setIsLoggedIn(true); // Also set login status here
        setUser(userDataResponse.data.user);
      } else {
        throw new Error("Failed to refetch user data.");
      }
    } catch {
      // FIX: Instead of calling logout(), just clear the state.
      // This prevents logging out the user on a temporary network error.
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const authStatusResponse = await axios.get(`${backendUrl}/api/auth/is-auth`);
        if (authStatusResponse.data.success) {
          // REFACTORED: Reuse our main function
          await refetchUser();
        } else {
          // If not authenticated, ensure state is cleared.
          setIsLoggedIn(false);
          setUser(null);
        }
      } catch (error) {
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuthStatus();
  }, []);

  // REFACTORED: Login function is now much simpler.
  const login = async () => {
    // After a successful login action, just refetch the user data.
    await refetchUser();
    // Only navigate after the user data is fetched and state is set.
    navigate("/matches");
  };

  const logout = async () => {
    try {
      await axios.post(`${backendUrl}/api/auth/logout`);
      setIsLoggedIn(false);
      setUser(null);
      localStorage.removeItem('aiChatHistory');

      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "An error occurred while logging out.",
        variant: "destructive",
      });
    }
  };

  const value = {
    isLoggedIn,
   
    user,
    login,
    logout,
    isLoading,
    refetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};