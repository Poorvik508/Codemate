import { useRef } from 'react';
import { MatchCard } from './MatchCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const UserCarousel = ({ title, users }: { title: string, users: any[] }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = current.offsetWidth * 0.9;
      current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!users || users.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="relative group">
        <Button variant="outline" size="icon" className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 -translate-x-4" onClick={() => scroll('left')}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        
        <div ref={scrollContainerRef} className="flex gap-6 overflow-x-hidden py-2 scroll-smooth">
          {users.map(user => (
            <MatchCard key={user._id} match={{ user: user, matchingSkill: user.skills[0] || 'Top Skill' }} />
          ))}
        </div>

        <Button variant="outline" size="icon" className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => scroll('right')}>
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};