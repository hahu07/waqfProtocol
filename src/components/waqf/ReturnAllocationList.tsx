import type { ReturnAllocation } from "@/types/waqfs";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { EmptyState } from "@/components/ui/empty-state";

export function ReturnAllocationList({ allocations }: { allocations: ReturnAllocation[] }) {
  if (allocations.length === 0) {
    return <EmptyState message="No allocation records found" className="mt-4" />;
  }

  return (
    <div className="space-y-3 sm:space-y-4" role="list">
      {allocations.map((allocation) => (
        <div 
          key={allocation.id} 
          className="rounded-lg border p-3 sm:p-4 dark:border-gray-700 dark:bg-gray-800 min-h-[80px]"
          role="listitem"
          aria-labelledby={`allocation-${allocation.id}-period`}
        >
          <div className="flex flex-col sm:flex-row justify-between">
            <h4 
              id={`allocation-${allocation.id}-period`}
              className="font-medium text-sm sm:text-base dark:text-white"
            >
              {allocation.period}
            </h4>
            <span className="text-xs sm:text-sm dark:text-gray-300" aria-label="Allocation date">
              {formatDate(allocation.allocatedAt)}
            </span>
          </div>
          <div className="mt-4 space-y-2" aria-describedby={`allocation-${allocation.id}-period`}>
            <p className="text-sm dark:text-gray-300">
              Total: {formatCurrency(allocation.totalReturns)}
            </p>
            <div className="text-xs text-gray-600 dark:text-gray-400" role="list">
              {allocation.allocations.map((item) => (
                <div 
                  key={item.causeId} 
                  className="flex justify-between py-2"
                  role="listitem"
                >
                  <span className="text-xs sm:text-sm">{item.causeId}</span>
                  <span className="text-xs sm:text-sm font-medium">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
