import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Edit3, Save, Camera, Loader2, ArrowLeft, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { backendUrl } from "@/config/backendUrl";
// Define a type for the profile data being displayed
interface UserProfile {
  _id: string;
  name: string;
  email: string;
  location?: string;
  availability?: string;
  college?: string;
  bio?: string;
  skills?: string[];
  profilePic?: string;
}

const Profile = () => {
  const { toast } = useToast();
  const { user: loggedInUser, refetchUser } = useAuth();
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isMyProfile, setIsMyProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({ name: '', location: '', availability: '', college: '', bio: '' });
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        const endpoint = userId ? `${backendUrl}/api/profile/profile?userId=${userId}` : `${backendUrl}/api/profile/profile`;
        const response = await axios.get(endpoint);

        if (response.data.success) {
          const fetchedUser = response.data.user;
          setProfileData(fetchedUser);
          setIsMyProfile(fetchedUser._id === loggedInUser?._id);
        } else {
          navigate("/not-found");
        }
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
        navigate("/not-found");
      } finally {
        setIsLoading(false);
      }
    };

    if (loggedInUser) {
      fetchProfileData();
    }
  }, [userId, loggedInUser, navigate]);

  useEffect(() => {
    if (isMyProfile && profileData) {
      setFormData({
        name: profileData.name || '',
        location: profileData.location || '',
        availability: profileData.availability || '',
        college: profileData.college || '',
        bio: profileData.bio || '',
      });
      setSkills(profileData.skills || []);
      setPreviewUrl(null);
      setProfilePicFile(null);
    }
  }, [isEditing, isMyProfile, profileData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData({ ...formData, [e.target.id]: e.target.value });
  const handleSelectChange = (value: string) => setFormData({ ...formData, availability: value });
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAddSkill = () => {
    const newSkill = skillInput.trim();
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const originalSkills = profileData?.skills || [];
      const skillsToAdd = skills.filter(s => !originalSkills.includes(s));
      const skillsToDelete = originalSkills.filter(s => !skills.includes(s));
      const addPromises = skillsToAdd.map(skill => axios.post(`${backendUrl}/api/profile/skills`, { skill }));
      const deletePromises = skillsToDelete.map(skill => axios.delete(`${backendUrl}/api/profile/skills/${skill}`));
      
      const dataToSubmit = new FormData();
      Object.entries(formData).forEach(([key, value]) => dataToSubmit.append(key, value));
      if (profilePicFile) dataToSubmit.append('profilePic', profilePicFile);
      const mainProfilePromise = axios.put(`${backendUrl}/api/profile/profile`, dataToSubmit, { headers: { 'Content-Type': 'multipart/form-data' } });

      await Promise.all([mainProfilePromise, ...addPromises, ...deletePromises]);
      await refetchUser();
      toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
      setIsEditing(false);
    } catch (error) {
      toast({ title: "Update Failed", description: "Could not save your profile changes.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return "";
    const names = name.split(' ');
    if (names.length > 1 && names[1]) return `${names[0][0]}${names[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };
  
  if (isLoading || !profileData) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  const skillsToDisplay = isMyProfile && isEditing ? skills : profileData.skills;

  return (
    // MODIFIED: Container classes removed for full-width background
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      {/* MODIFIED: Inner container added for padding, replacing old container */}
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {!isMyProfile && (
              <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            <h1 className="text-3xl font-bold">{isMyProfile ? "My Profile" : `${profileData.name.split(' ')[0]}'s Profile`}</h1>
          </div>
          {isMyProfile && (
            <Button onClick={isEditing ? handleSave : () => setIsEditing(true)} disabled={isLoading} className="bg-gradient-to-r from-primary to-accent">
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : 
               isEditing ? <><Save className="h-4 w-4 mr-2" /> Save Changes</> :
               <><Edit3 className="h-4 w-4 mr-2" /> Edit Profile</>}
            </Button>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="gradient-card border-border/50 lg:sticky lg:top-24 overflow-hidden p-0">
            <div className="relative group">
              <Avatar className="w-full h-auto aspect-square rounded-none">
                <AvatarImage src={isMyProfile && isEditing ? previewUrl || profileData.profilePic : profileData.profilePic} className="object-cover" />
                <AvatarFallback className="text-6xl rounded-none">{getInitials(profileData.name)}</AvatarFallback>
              </Avatar>
              {isMyProfile && isEditing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <Camera className="h-12 w-12 text-white" />
                </div>
              )}
            </div>
            <div className="p-6 text-center">
              <CardTitle className="text-2xl">{profileData.name}</CardTitle>
              {isMyProfile && <p className="text-muted-foreground">{profileData.email}</p>}
              {!isMyProfile && (
                <Link to={`/messaging/${profileData._id}`} className="mt-4 inline-block w-full">
                  <Button className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" /> Message
                  </Button>
                </Link>
              )}
            </div>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card className="gradient-card border-border/50">
              <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  {isMyProfile && isEditing ? ( <Input id="name" value={formData.name} onChange={handleInputChange} /> ) : ( <p className="text-muted-foreground">{profileData.name}</p> )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  {isMyProfile && isEditing ? ( <Input id="location" value={formData.location} onChange={handleInputChange} /> ) : ( <p className="text-muted-foreground">{profileData.location || 'Not set'}</p> )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="college">College</Label>
                  {isMyProfile && isEditing ? ( <Input id="college" value={formData.college} onChange={handleInputChange} /> ) : ( <p className="text-muted-foreground">{profileData.college || 'Not set'}</p> )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availability">Availability</Label>
                  {isMyProfile && isEditing ? (
                    <Select value={formData.availability} onValueChange={handleSelectChange}>
                      <SelectTrigger><SelectValue placeholder="Select your availability" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekdays">Weekdays</SelectItem>
                        <SelectItem value="weekends">Weekends</SelectItem>
                        <SelectItem value="evenings">Evenings</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                        <SelectItem value="full-time">Full-time</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : ( <p className="text-muted-foreground capitalize">{profileData.availability || 'Not set'}</p> )}
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card border-border/50">
              <CardHeader><CardTitle>Skills & Technologies</CardTitle></CardHeader>
              <CardContent className="space-y-4 pt-6">
                {isMyProfile && isEditing && (
                  <div className="flex gap-2">
                    <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder="Add a skill" onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())} />
                    <Button type="button" onClick={handleAddSkill} variant="outline">Add</Button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 min-h-[24px]">
                  {(skillsToDisplay && skillsToDisplay.length > 0) ? skillsToDisplay.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-sm flex items-center gap-1">
                      {skill}
                      {isMyProfile && isEditing && ( <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveSkill(skill)} /> )}
                    </Badge>
                  )) : !isEditing && (
                    <p className="text-sm text-muted-foreground">No skills added yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card border-border/50">
              <CardHeader><CardTitle>About Me</CardTitle></CardHeader>
              <CardContent className="pt-6">
                {isMyProfile && isEditing ? ( <Textarea id="bio" value={formData.bio} onChange={handleInputChange} className="min-h-[120px]" /> ) : ( <p className="text-muted-foreground leading-relaxed">{profileData.bio || 'No bio provided.'}</p> )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;