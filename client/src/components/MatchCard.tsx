// import { Link } from "react-router-dom";
// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { MessageSquare, User, Percent } from "lucide-react";

// // Define the types to match your data structure
// interface MatchUser {
//   id: string;
//   name: string;
//   bio: string;
//   profilePic?: string;
// }

// // MODIFIED: Added score to the interface
// interface Match {
//   user: MatchUser;
//   matchingSkill: string;
//   score: number;
// }

// const getInitials = (name: string) => {
//     if (!name) return "U";
//     const names = name.split(' ');
//     if (names.length > 1 && names[1]) return `${names[0][0]}${names[1][0]}`.toUpperCase();
//     return name.substring(0, 2).toUpperCase();
// };

// export const MatchCard = ({ match }: { match: Match }) => {
//   return (
//     <Card className="flex flex-col gradient-card border-border/50">
//       <CardHeader className="flex flex-row items-center justify-between gap-4">
//         <div className="flex items-center gap-4">
//             <Avatar className="h-12 w-12">
//               <AvatarImage src={match.user.profilePic} />
//               <AvatarFallback>{getInitials(match.user.name)}</AvatarFallback>
//             </Avatar>
//             <CardTitle>{match.user.name}</CardTitle>
//         </div>
//         {/* ADDED: Display the match score */}
//         <Badge className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1 text-sm py-1 px-3">
//             <Percent className="h-4 w-4" />
//             {(match.score * 100).toFixed(0)}%
//         </Badge>
//         {/* REMOVED: The "Matched on" badge was removed */}
//       </CardHeader>
//       <CardContent className="flex-1">
//         <p className="text-sm text-muted-foreground line-clamp-3">
//           {match.user.bio || "No bio provided."}
//         </p>
//       </CardContent>
//       <CardFooter className="flex gap-2">
//         <Link to={`/profile/${match.user.id}`} className="flex-1">
//           <Button variant="outline" className="w-full">
//             <User className="h-4 w-4 mr-2" />
//             View Profile
//           </Button>
//         </Link>
//         <Link to={`/messaging/${match.user.id}`} className="flex-1">
//           <Button className="w-full bg-gradient-to-r from-primary to-accent">
//             <MessageSquare className="h-4 w-4 mr-2" />
//             Message
//           </Button>
//         </Link>
//       </CardFooter>
//     </Card>
//   );
// };
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, User, Percent, MapPin, Clock } from "lucide-react";
import { Match } from "@/types";

const getInitials = (name: string) => {
    if (!name) return "U";
    const names = name.split(' ');
    if (names.length > 1 && names[1]) return `${names[0][0]}${names[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
};

export const MatchCard = ({ match }: { match: Match }) => {
  return (
    <Card className="flex flex-col gradient-card border-border/50 w-[300px] shrink-0">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 truncate">
            <Avatar className="h-12 w-12">
              <AvatarImage src={match.user.profilePic} />
              <AvatarFallback>{getInitials(match.user.name)}</AvatarFallback>
            </Avatar>
            <CardTitle className="truncate text-lg">{match.user.name}</CardTitle>
        </div>
        {match.score && match.score > 0 && (
          <Badge className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1 text-sm py-1 px-3">
              <Percent className="h-4 w-4" />
              {(match.score * 100).toFixed(0)}%
          </Badge>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center"><MapPin className="h-4 w-4 mr-2 shrink-0" /> <span className="truncate">{match.user.location || 'Not specified'}</span></div>
            <div className="flex items-center"><Clock className="h-4 w-4 mr-2 shrink-0" /> <span className="capitalize">{match.user.availability || 'Not specified'}</span></div>
        </div>
        <div>
            <div className="flex flex-wrap gap-1">
                {(match.user.skills || []).slice(0, 2).map((skill: string, index: number) => <Badge key={index} variant="secondary">{skill}</Badge>)}
                {(match.user.skills || []).length > 2 && <Badge variant="outline">+{match.user.skills.length - 2} more</Badge>}
            </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 pt-4">
        <Link to={`/profile/${match.user._id}`} className="flex-1">
          <Button variant="outline" className="w-full">
            <User className="h-4 w-4 mr-2" />
            Profile
          </Button>
        </Link>
        <Link to={`/messaging/${match.user._id}`} className="flex-1">
          <Button className="w-full bg-gradient-to-r from-primary to-accent">
            <MessageSquare className="h-4 w-4 mr-2" />
            Message
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};