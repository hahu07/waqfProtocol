import type { Cause } from "@/types/waqfs";
import { useState } from "react";

export function CauseCard({ 
  cause, 
  showProgress = false,
  progressValue = 0 
}: { 
  cause: Cause;
  showProgress?: boolean;
  progressValue?: number;
}) {
  const statusColors = {
    Active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    Inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    default: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  };

  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border p-3 sm:p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700/50 min-h-[120px]">
      {showProgress && (
        <div className="mb-3">
          <div className="h-2.5 w-full bg-gray-200 rounded-full dark:bg-gray-700">
            <div 
              className="h-2.5 bg-green-500 rounded-full" 
              style={{ width: `${progressValue}%` }}
            />
          </div>
          <p className="text-xs text-right mt-1 text-gray-500 dark:text-gray-400">
            {progressValue}% funded
          </p>
        </div>
      )}

      <div className="flex items-start gap-3">
        <span className="text-2xl mt-1" aria-hidden="true">
          {cause.icon}
        </span>
        <div className="flex-1">
          <h3 className="font-medium text-base sm:text-lg dark:text-white">
            {cause.name}
          </h3>
          {cause.followers && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {cause.followers.toLocaleString()} supporters
            </p>
          )}
        </div>
      </div>

      <div>
        <p className={`mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300 ${expanded ? '' : 'line-clamp-3'}`}>
          {cause.description}
        </p>
        {cause.description && cause.description.length > 150 && (
          <button
            onClick={() => setExpanded(prev => !prev)}
            className="text-blue-600 hover:text-blue-800 text-xs font-semibold mt-1 transition-colors"
          >
            {expanded ? '▲ Show less' : '▼ Read more'}
          </button>
        )}
      </div>
    </div>
  );
}
