export interface User {
  _id: string;
  name: string;
  bio?: string;
  profilePic?: string;
  location?: string;
  availability?: string;
  skills?: string[];
  college?: string;
}

export interface Match {
  user: User;
  matchingSkill: string;
  score?: number; 
}

export interface Message {
  id: number;
  content: string;
  isBot: boolean;
  timestamp: Date;
  matches?: Match[];
  allMatches?: Match[];
  showAllMatchesButton?: boolean;
}