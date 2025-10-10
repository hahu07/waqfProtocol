import { cn } from '@/lib/utils';

interface BackdropProps {
  spinner?: boolean;
  className?: string;
}

export const Backdrop = ({ spinner = false, className }: BackdropProps) => (
  <div className={cn(
    "fixed inset-0 z-40 flex items-center justify-center",
    "bg-white/30 dark:bg-gray-900/50 backdrop-blur-sm sm:backdrop-blur-xl",
    "transition-opacity duration-300 ease-in-out",
    className
  )}>
    {spinner && (
      <div className="h-10 w-10 sm:h-12 sm:w-12 animate-spin rounded-full border-2 sm:border-[3px] border-solid border-primary dark:border-primary-300 border-t-transparent"></div>
    )}
  </div>
);
