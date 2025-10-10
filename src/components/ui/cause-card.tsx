'use client';

import { cn } from '@/lib/utils';
import { Cause } from '@/types/waqfs';
import { Badge } from '@/components/ui/badge';
import { FaHeart, FaChevronRight } from 'react-icons/fa';

type CauseCardProps = {
  cause: Cause;
  onSelect?: () => void;
  className?: string;
};

export function CauseCard({ cause, onSelect, className }: CauseCardProps) {
  return (
    <div 
      className={cn(
        'border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer',
        'active:scale-[98%] transform transition-transform',
        'dark:border-gray-700 dark:hover:border-primary-300',
        className
      )}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start gap-2">
        <h3 className="font-medium text-sm sm:text-base">{cause.name}</h3>
        <FaChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </div>
      
      <p className="text-xs sm:text-sm text-muted-foreground mt-2 line-clamp-2 dark:text-gray-400">
        {cause.description}
      </p>
      
      <div className="mt-4 flex items-center justify-between gap-2">
        <Badge variant="secondary" className="text-xs">
          <FaHeart className="w-3 h-3 mr-1" />
          {cause.followers} supporters
        </Badge>
        <span className="text-xs sm:text-sm font-medium">
          ${cause.fundsRaised?.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
