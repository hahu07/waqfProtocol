'use client';

import type {Cause, WaqfProfile } from '@/types/waqfs';

interface WaqfRowProps {
  waqf: WaqfProfile;
  causes: Cause[];
  onEdit: () => void;
  style?: React.CSSProperties;
}

export const WaqfRow = ({ waqf, causes, onEdit, style }: WaqfRowProps) => {
  const getCauseName = (id: string) => 
    causes.find(c => c.id === id)?.name || id;

  return (
    <div style={style} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 border-b">
      <div className="flex-1 w-full">
        <h3 className="font-medium text-sm sm:text-base">{waqf.description}</h3>
        <div className="text-xs sm:text-sm text-gray-500">
          {waqf.selectedCauses.length} selected causes
        </div>
      </div>
      <button 
        onClick={onEdit}
        className="px-3 py-2 sm:py-1 bg-primary text-white rounded text-sm w-full sm:w-auto min-h-[36px]"
      >
        Manage
      </button>
    </div>
  );
};