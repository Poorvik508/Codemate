import { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "@/config/backendUrl";
import { UserCarousel } from "@/components/UserCarousel";
import { MatchCard } from "@/components/MatchCard";

// --- UI Components ---
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label"; 

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const Matches = () => {
  const [feed, setFeed] = useState<Record<string, any[]> | null>(null);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [availability, setAvailability] = useState("all");
  const [filterScope, setFilterScope] = useState("location");
  const [scopeValue, setScopeValue] = useState("");
  
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedScopeValue = useDebounce(scopeValue, 500);

  const isFiltering = searchTerm || availability !== "all" || scopeValue;

  useEffect(() => {
    const fetchFeed = async () => {
      setIsLoadingFeed(true);
      try {
        const res = await axios.get(`${backendUrl}/api/users/discover-feed`);
        if (res.data.success) setFeed(res.data.feed);
      } catch (error) { console.error("Failed to fetch discover feed", error); } 
      finally { setIsLoadingFeed(false); }
    };
    fetchFeed();
  }, []);

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
        if (res.data.success) setSearchResults(res.data.results);
      } catch (error) { console.error("Failed to search users", error); } 
      finally { setIsSearching(false); }
    };
    searchUsers();
  }, [debouncedSearchTerm, availability, filterScope, debouncedScopeValue, isFiltering]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {searchResults.map(user => (
                    <MatchCard key={user._id} match={{ user: user, matchingSkill: user.skills[0] || 'N/A' }} />
                  ))}
                </div>
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
              const titleMap: { [key: string]: string } = { bySkill: "Because You Have Similar Skills", byLocation: "Developers Near You", byCollege: "From Your College", byAvailability: "Available When You Are" };
              return (
                <UserCarousel key={categoryKey} title={titleMap[categoryKey]} users={users} />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches;