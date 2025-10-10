import { useLocation, Link, useNavigate } from "react-router-dom";
import { MatchCard } from "@/components/MatchCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Match } from "@/types";

const AllMatches = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const matches = location.state?.matches as Match[] | undefined;

  // Handle case where user navigates to this page directly without data
  if (!matches || matches.length === 0) {
    return (
      <div className="min-h-screen py-8 px-4 flex items-center justify-center bg-gradient-to-br from-background to-secondary">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">No Matches to Display</h1>
          <p className="text-muted-foreground mb-6">
            Please start a search on the AI Partner Finder page to get matches.
          </p>
          <Link to="/ai-chat">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to AI Finder
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    // MODIFIED: Removed horizontal padding from the main wrapper
    <div className="min-h-screen py-8 bg-gradient-to-br from-background to-secondary">
      {/* MODIFIED: Removed container/max-width and added responsive padding directly */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold">All Matches Found ({matches.length})</h1>
                <p className="text-muted-foreground">Here are all the potential partners based on your query.</p>
            </div>
            <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Chat
            </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {matches.map((match: Match) => (
            <MatchCard key={match.user._id} match={match} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllMatches;