interface LoadingStateProps {
  count?: number;
  className?: string;
}

export function LoadingState({ count = 3, className = '' }: LoadingStateProps) {
  return (
    <div className={`space-y-3 p-3 sm:p-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse space-y-2">
          <div className="h-5 sm:h-6 rounded bg-gray-200 dark:bg-gray-700 w-3/4"></div>
          <div className="h-3 sm:h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-3 sm:h-4 rounded bg-gray-200 dark:bg-gray-700 w-5/6"></div>
        </div>
      ))}
    </div>
  );
}
