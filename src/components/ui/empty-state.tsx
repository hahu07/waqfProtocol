interface EmptyStateProps {
  message: string;
  className?: string;
  ariaRole?: 'alert' | 'status';
  icon?: React.ReactNode;
}

export function EmptyState({ message, className = '', ariaRole = 'status', icon }: EmptyStateProps) {
  return (
    <div 
      className={`rounded-lg border border-dashed p-4 sm:p-8 text-center dark:border-gray-600 ${className}`}
      role={ariaRole}
      aria-live="polite"
    >
      {icon || (
        <svg
          className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )}
      <p className="mt-2 text-sm sm:text-base text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
}
