import { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "@/config/backendUrl";
import { Link, useNavigate } from "react-router-dom";

// --- UI Components ---
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, MapPin, Clock, Search, Loader2, User } from "lucide-react";
import { Label } from "@/components/ui/label"; 
import { useToast } from "@/hooks/use-toast";

// A custom hook for debouncing text input
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const Matches = () => {
  const navigate = useNavigate();

  // State for the default recommendation feed
  const [feed, setFeed] = useState<Record<string, any[]> | null>(null);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);

  // State for all filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [availability, setAvailability] = useState("all");
  const [filterScope, setFilterScope] = useState("location"); // 'location' or 'college'
  const [scopeValue, setScopeValue] = useState("");
  
  // State for search results
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedScopeValue = useDebounce(scopeValue, 500);

  const isFiltering = searchTerm || availability !== "all" || scopeValue;

  // Effect to fetch the default recommendation feed
  useEffect(() => {
    setIsLoadingFeed(true);
    const fetchFeed = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/users/discover-feed`);
        if (res.data.success) setFeed(res.data.feed);
      } catch (error) { console.error("Failed to fetch discover feed", error); } 
      finally { setIsLoadingFeed(false); }
    };
    fetchFeed();
  }, []);

  // Effect to perform a search when any filter changes
  useEffect(() => {
    if (!isFiltering) {
      setSearchResults([]);
      return;
    }

    const searchUsers = async () => {
      setIsSearching(true);
      try {
        const params = new URLSearchParams({ q: debouncedSearchTerm, availability: availability });
        if (filterScope === 'location') {
            params.append('location', debouncedScopeValue);
        } else if (filterScope === 'college') {
            params.append('college', debouncedScopeValue);
        }

        const res = await axios.get(`${backendUrl}/api/users/filter?${params.toString()}`);
        if (res.data.success) {
          setSearchResults(res.data.results);
        }
      } catch (error) { console.error("Failed to search users", error); } 
      finally { setIsSearching(false); }
    };
    searchUsers();
  }, [debouncedSearchTerm, availability, filterScope, debouncedScopeValue, isFiltering]);
  
  const getInitials = (name: string = "") => {
    const names = name.split(' ');
    if (names.length > 1 && names[1]) return `${names[0][0]}${names[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const renderUserCard = (user: any) => (
    <Card key={user._id} className="gradient-card border-border/50 flex flex-col">
      <CardHeader className="items-center text-center">
        <Avatar className="h-20 w-20 mb-4"><AvatarImage src={user.profilePic} /><AvatarFallback>{getInitials(user.name)}</AvatarFallback></Avatar>
        <CardTitle className="text-lg">{user.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center"><MapPin className="h-4 w-4 mr-2 shrink-0" /> <span className="truncate">{user.location || 'Not specified'}</span></div>
            <div className="flex items-center"><Clock className="h-4 w-4 mr-2 shrink-0" /> <span className="capitalize">{user.availability || 'Not specified'}</span></div>
        </div>
        <div>
            <p className="text-sm font-medium mb-2">Top Skills:</p>
            <div className="flex flex-wrap gap-1">
                {(user.skills || []).slice(0, 3).map((skill: string, index: number) => <Badge key={index} variant="secondary">{skill}</Badge>)}
                {(user.skills || []).length > 3 && <Badge variant="outline">+{user.skills.length - 3} more</Badge>}
            </div>
        </div>
        <div className="flex gap-2 pt-2">
            <Link to={`/profile/${user._id}`} className="flex-1"><Button variant="outline" size="sm" className="w-full"><User className="h-4 w-4 mr-2" />Profile</Button></Link>
            <Link to={`/messaging/${user._id}`} className="flex-1"><Button size="sm" className="w-full"><MessageSquare className="h-4 w-4 mr-2" />Message</Button></Link>
        </div>
      </CardContent>
    </Card>
  );

  return (
    // MODIFIED: Removed vertical padding from the main container
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      {/* MODIFIED: Removed container/max-width and added responsive padding directly */}
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-2">
            <h1 className="text-3xl font-bold">Discover Partners</h1>
            <p className="text-muted-foreground">Browse recommendations or search for partners with specific skills.</p>
        </div>

        <div className="space-y-4 mb-8">
            <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search by name or skill..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setShowAdvancedFilters(true)}
                    className="pl-10 text-base h-12"
                />
            </div>
            {showAdvancedFilters && (
                <Card className="gradient-card border-border/50">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex gap-2">
                                <Select value={filterScope} onValueChange={setFilterScope}>
                                    <SelectTrigger className="w-[120px] shrink-0"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="location">Location</SelectItem>
                                        <SelectItem value="college">College</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input 
                                    placeholder={`Search by ${filterScope}...`} 
                                    value={scopeValue} 
                                    onChange={(e) => setScopeValue(e.target.value)} 
                                />
                            </div>
                            <div>
                                <Select value={availability} onValueChange={setAvailability}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Availabilities</SelectItem>
                                        <SelectItem value="weekdays">Weekdays</SelectItem>
                                        <SelectItem value="weekends">Weekends</SelectItem>
                                        <SelectItem value="evenings">Evenings</SelectItem>
                                        <SelectItem value="flexible">Flexible</SelectItem>
                                        <SelectItem value="full-time">Full-time</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>

        {isFiltering ? (
          <div>
            {isSearching ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin"/></div> :
            searchResults.length > 0 ? (
              <>
                <h2 className="text-2xl font-bold mb-4">Search Results ({searchResults.length})</h2>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">{searchResults.map(renderUserCard)}</div>
              </>
            ) : <p className="text-center py-20 text-muted-foreground">No users found matching your filters.</p>}
          </div>
        ) : (
          <div className="space-y-12">
            {isLoadingFeed ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin"/></div> :
            feed && Object.values(feed).every(arr => arr.length === 0) ? (
                <p className="text-center py-20 text-muted-foreground">No recommendations found yet. Make sure your profile is complete!</p>
            ) : feed && Object.keys(feed).map(categoryKey => {
              const users = feed[categoryKey];
              if (users.length === 0) return null;
              const titleMap: { [key: string]: string } = { bySkill: "Because You Have Similar Skills", byLocation: "Developers Near You", byCollege: "From Your College", byAvailability: "Available When You Are" };
              return (
                <div key={categoryKey}>
                  <h2 className="text-2xl font-bold mb-4">{titleMap[categoryKey]}</h2>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">{users.map(renderUserCard)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches;