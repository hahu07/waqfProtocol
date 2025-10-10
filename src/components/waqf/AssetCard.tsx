import type { Donation } from '@/types/waqfs';
import { formatCurrency, formatDate } from '@/utils/formatters';

export function AssetCard({ asset, onClick }: { asset: Donation, onClick?: () => void }) {
  const amount = asset?.amount ? formatCurrency(asset.amount) : 'Amount not specified';
  const date = asset?.date ? formatDate(asset.date) : 'Date not specified';
  const status = asset?.status ?? 'Status unknown';

  // Status color mapping
  const statusColors = {
    Completed: 'text-green-600 dark:text-green-400',
    Pending: 'text-yellow-600 dark:text-yellow-400',
    Failed: 'text-red-600 dark:text-red-400',
    default: 'text-gray-600 dark:text-gray-400'
  };

  const statusColor = statusColors[status as keyof typeof statusColors] || statusColors.default;

  return (
    <div 
      className={`rounded-lg border p-3 sm:p-4 shadow-sm min-h-[100px] ${
        onClick ? 'cursor-pointer active:scale-[0.98]' : ''
      }`}
      role="article"
      aria-labelledby={`asset-${asset.id}-title`}
      onClick={onClick}
    >
      {/* Add visual indicator for amount */}
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-base sm:text-lg dark:text-white">
          {amount} <span className="text-xs sm:text-sm font-normal">Donation</span>
        </h3>
        {asset.amount > 1000 && (
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900 dark:text-blue-200">
            Major Gift
          </span>
        )}
      </div>

      {/* Enhanced status display */}
      <div className="mt-2 flex items-center gap-2">
        <span className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${
          asset.status === 'completed' ? 'bg-green-500' :
          asset.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
        }`} />
        <span className={`${statusColor} font-medium text-sm sm:text-base`}>
          {status}
        </span>
      </div>

      {/* Add hover effect for clickable cards */}
      {onClick && (
        <div className="mt-3 text-xs sm:text-sm text-blue-600 dark:text-blue-400">
          View Details →
        </div>
      )}
    </div>
  );
}
