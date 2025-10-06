// src/pages/Login.tsx

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Code, Loader2 } from "lucide-react";

const Login = () => {
  const { isLoggedIn, login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/matches", { replace: true }); // ✅ Updated Redirect
    }
  }, [isLoggedIn, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const loginResponse = await axios.post(backendUrl+"/api/auth/login", {
        email,
        password,
      });

      if (loginResponse.data.success) {
        const userDataResponse = await axios.get(backendUrl+"/api/profile/profile");
        if (userDataResponse.data.success) {
          toast({
            title: "Login Successful!",
            description: "Welcome back. Redirecting to matches...",
          });
          login();
        } else {
          throw new Error("Login succeeded but failed to fetch user data.");
        }
      } else {
        toast({
          title: "Login Failed",
          description: loginResponse.data.message || "Please check your credentials.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "An Error Occurred",
        description: "Could not connect to the server. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- JSX remains the same ---
  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-background to-secondary flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-primary to-accent">
              <Code className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your Codemate account</p>
        </div>
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Form inputs... (code omitted for brevity but is unchanged) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked as boolean)} disabled={isLoading} />
                  <Label htmlFor="remember" className="text-sm font-normal">Remember me</Label>
                </div>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : ("Sign In")}
              </Button>
              <div className="mt-4 text-center text-sm">
                Don't have an account?{" "}
                <Link to="/register" className="underline text-primary">Sign up</Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;