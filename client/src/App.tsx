// src/App.tsx (Updated with AuthProvider)

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // 👈 1. Import AuthProvider
import ProtectedRoute from "./components/ProtectedRoute";


// Import your page components
import { Navigation } from "@/components/Navigation";
import Index from "./pages/Index";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import AIChat from "./pages/AIChat";
import Matches from "./pages/Matches";
import Messaging from "./pages/Messaging";
import NotFound from "./pages/NotFound";
import AllMatches from "./pages/AllMatches";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider> {/* 👈 2. Wrap your components with AuthProvider */}
          <div className="min-h-screen bg-background">
          <Navigation />
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/" element={<Index />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            {/* --- Protected Routes --- */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/ai-chat" element={<AIChat />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/messaging" element={<Messaging />} />
              <Route path="/all-matches" element={<AllMatches />} />
              <Route path="/profile/:userId" element={<Profile />} /> 
              <Route path="/messaging/:userId" element={<Messaging />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;