import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

// --- UI Components ---
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// --- Icons ---
import { X, Code, Loader2 } from "lucide-react";

const Register = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isLoggedIn, login } = useAuth();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // --- State for all form fields ---
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // "Confirm Password" state removed
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState("");
  const [college, setCollege] = useState(""); // "College" state added
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/matches", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  // --- Main Submission Logic ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Password confirmation check removed

    setIsLoading(true);

    try {
      // Step 1: Register the user with basic credentials
      const registerResponse = await axios.post(`${backendUrl}/api/auth/register`, {
        name: `${firstName} ${lastName}`,
        email,
        password,
      });

      if (!registerResponse.data.success) {
        throw new Error(registerResponse.data.message || "Failed to create account.");
      }

      // Step 2: Update the user's profile
      // Added college to the profile data payload
      const profileData = { location, availability, bio, college };
      await axios.put(`${backendUrl}/api/profile/profile`, profileData);

      // Step 3: Add all the skills concurrently
      if (skills.length > 0) {
        const skillPromises = skills.map(skill =>
          axios.post(`${backendUrl}/api/profile/skills`, { skill })
        );
        await Promise.all(skillPromises);
      }

      // Step 4: Fetch final user data to update the context and navigate
      const userDataResponse = await axios.get(`${backendUrl}/api/profile/profile`);

      if (userDataResponse.data.success) {
        toast({
          title: "Registration Successful!",
          description: "Welcome to Codemate. Redirecting...",
        });
        login(); // This will navigate to /matches
      } else {
         throw new Error("Account created, but failed to fetch user data.");
      }

    } catch (error: any) {
      console.error("Registration failed:", error);
      toast({
        title: "Registration Failed",
        description: error.response?.data?.message || error.message || "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-background to-secondary">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-primary to-accent animate-glow">
              <Code className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Join Codemate</h1>
          <p className="text-muted-foreground">Create your profile and start finding coding partners</p>
        </div>

        <Card className="gradient-card border-border/50">
          <CardHeader>
            <CardTitle>Create Your Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" required value={firstName} onChange={e => setFirstName(e.target.value)} disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" required value={lastName} onChange={e => setLastName(e.target.value)} disabled={isLoading} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john@example.com" required value={email} onChange={e => setEmail(e.target.value)} disabled={isLoading} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" required value={password} onChange={e => setPassword(e.target.value)} disabled={isLoading} />
              </div>
              
              {/* "Confirm Password" input field removed from here */}

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="City, Country / Timezone" value={location} onChange={e => setLocation(e.target.value)} disabled={isLoading} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Select onValueChange={setAvailability} value={availability} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekdays">Weekdays</SelectItem>
                    <SelectItem value="weekends">Weekends</SelectItem>
                    <SelectItem value="evenings">Evenings</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                    <SelectItem value="full-time">Full-time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Skills & Technologies</Label>
                <div className="flex gap-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Add a skill (e.g., React, Python)"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    disabled={isLoading}
                  />
                  <Button type="button" onClick={handleAddSkill} variant="outline" disabled={isLoading}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 min-h-[24px]">
                  {skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => handleRemoveSkill(skill)} />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* "College" input field added here */}
              <div className="space-y-2">
                <Label htmlFor="college">College (Optional)</Label>
                <Input 
                  id="college" 
                  placeholder="e.g., University of Technology" 
                  value={college}
                  onChange={e => setCollege(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio (Optional)</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself, your coding interests..."
                  className="min-h-[100px]"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary hover:underline">
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;