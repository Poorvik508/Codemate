import { useLocation, Link } from "react-router-dom";
import { MatchCard } from "@/components/MatchCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const AllMatches = () => {
  const location = useLocation();
  const matches = location.state?.matches;

  // Handle case where user navigates to this page directly
  if (!matches || matches.length === 0) {
    return (
      <div className="container mx-auto max-w-5xl py-8 text-center">
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
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-background to-secondary">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">All Matches Found ({matches.length})</h1>
          <p className="text-muted-foreground">Here are all the potential partners based on your query.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match: any) => (
            <MatchCard key={match.user.id} match={match} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllMatches;