"use client";

export function ErrorDisplay({ error }: { error: Error }) {
  return (
    <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 sm:p-4 text-red-600 dark:text-red-300">
      <h3 className="text-sm sm:text-base font-medium">Error</h3>
      <p className="mt-1 text-xs sm:text-sm">{error.message}</p>
    </div>
  );
}
