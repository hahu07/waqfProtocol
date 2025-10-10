// components/waqf/TableHeader.tsx
import { ReactNode } from 'react';
import { Button } from "@/components/ui/button";

interface TableHeaderProps {
  /**
   * Callback when the causes button is clicked
   */
  onShowCauses: () => void;
  /**
   * Optional loading state for the causes button
   */
  isLoading?: boolean;
  /**
   * Optional subtitle to override default
   */
  subtitle?: ReactNode;
  /**
   * Optional flag to show/hide the form button
   */
  showFormButton?: boolean;
  /**
   * Optional callback when the form button is clicked
   */
  onShowForm?: () => void;
  /**
   * Optional title to override default
   */
  title?: string;
}

export const TableHeader = ({ 
  title = "Waqf Portfolio",
  subtitle,
  showFormButton = true,
  onShowForm,
  onShowCauses,
  isLoading = false
}: TableHeaderProps) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
    <div>
      <h2 
        className="text-lg sm:text-xl font-semibold"
        aria-label="Waqf Management Header"
      >
        {title}
      </h2>
      {subtitle && <p className="text-xs sm:text-sm text-muted-foreground">{subtitle}</p>}
    </div>
    <div className="flex gap-2 w-full sm:w-auto">
      {showFormButton && (
        <Button 
          onClick={onShowForm} 
          size="sm"
          className="w-full sm:w-auto"
        >
          Add New
        </Button>
      )}
      {onShowCauses && (
        <Button 
          onClick={onShowCauses} 
          variant="outline" 
          size="sm"
          className="w-full sm:w-auto"
        >
          Browse Causes
        </Button>
      )}
    </div>
  </div>
);