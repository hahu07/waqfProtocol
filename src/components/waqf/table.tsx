// src/components/waqf/table.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { listCauses } from '@/lib/cause-utils';
import { CausesModal } from '@/components/waqf/causesModal';
import { WaqfRow } from '@/components/waqf/waqfRow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { WaqfProfile, Cause } from '@/types/waqfs';

const CAUSES_CACHE_KEY = 'causesCache_v3';
const ITEMS_PER_PAGE = 5;

interface WaqfTableProps {
  waqfs: WaqfProfile[];
  onAddNew?: () => void;
}

export function WaqfTable({ waqfs, onAddNew }: WaqfTableProps) {
  const { user, isAuthenticated } = useAuth();
  const [causes, setCauses] = useState<Cause[]>([]);
  const [selectedCauses, setSelectedCauses] = useState<string[]>([]);
  const [causesLoading, setCausesLoading] = useState(false);
  const [causesError, setCausesError] = useState<Error | null>(null);
  const [causesModalOpen, setCausesModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadCauses = useCallback(async () => {
    try {
      setCausesLoading(true);
      setCausesError(null);
      
      const causeList = await listCauses();
      setCauses(causeList);
    } catch (err) {
      setCausesError(err instanceof Error ? err : new Error('Failed to load causes'));
    } finally {
      setCausesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCauses();
  }, [loadCauses]);

  const handleCauseSelect = (causeIds: string[]) => {
    setSelectedCauses(causeIds);
  };

  const filteredWaqfs = waqfs.filter(waqf => 
    waqf.donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    waqf.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedWaqfs = filteredWaqfs.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredWaqfs.length / ITEMS_PER_PAGE);

  if (filteredWaqfs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No waqf records found matching your search.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CausesModal
        isOpen={causesModalOpen}
        onClose={() => setCausesModalOpen(false)}
        onCauseSelect={handleCauseSelect}
        selected={selectedCauses}
        causes={causes}
        isLoading={causesLoading}
        error={causesError}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <Input
          placeholder="Search waqfs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-md"
        />
        {onAddNew && (
          <Button 
            onClick={onAddNew} 
            className="w-full sm:w-auto min-h-[48px]"
          >
            Add New Waqf
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <div className="space-y-3 min-w-[300px]">
          {paginatedWaqfs.map((waqf) => (
            <WaqfRow 
              key={waqf.id} 
              waqf={waqf} 
              causes={causes}
              onEdit={() => setCausesModalOpen(true)}
            />
          ))}
        </div>
      </div>

      {filteredWaqfs.length > ITEMS_PER_PAGE && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button 
            variant="outline" 
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="w-full sm:w-auto"
          >
            Previous
          </Button>
          <span className="text-sm">Page {page} of {totalPages}</span>
          <Button 
            variant="outline" 
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="w-full sm:w-auto"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}