'use client';

import { Dialog, DialogTitle } from '@headlessui/react';
import { HiX, HiSearch, HiFilter, HiCheckCircle } from 'react-icons/hi';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import type { Cause } from '@/types/waqfs';

type CausesModalProps = {
  isOpen: boolean;
  causes: Cause[];
  isLoading: boolean;
  error: Error | null;
  selected: string[];
  onClose: () => void;
  onCauseSelect: (causeIds: string[]) => void;
};

export function CausesModal({
  isOpen,
  causes,
  isLoading,
  error,
  selected,
  onClose,
  onCauseSelect
}: CausesModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  console.log('🗨️ CausesModal rendering:', { isOpen, causesCount: causes.length, isLoading, error, causes });
  
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(causes.map(cause => cause.category))];
    return ['all', ...uniqueCategories];
  }, [causes]);
  
  const filteredCauses = useMemo(() => {
    return causes.filter(cause => {
      const matchesSearch = cause.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cause.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || cause.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [causes, searchTerm, selectedCategory]);
  
  // Function to handle confirmed selection and close modal
  const handleConfirm = () => {
    // If no causes selected, prevent closing
    if (selected.length === 0) return;
    
    // Add a small delay for better UX (button press feedback)
    setTimeout(() => {
      onClose();
    }, 150);
  };
  
  // Handle cause selection with visual feedback
  const handleCauseToggle = (causeId: string) => {
    const isCurrentlySelected = selected.includes(causeId);
    const newSelection = isCurrentlySelected
      ? selected.filter(id => id !== causeId)
      : [...selected, causeId];
    
    onCauseSelect(newSelection);
  };
  
  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      className="relative z-50"
      aria-labelledby="causes-modal-title"
    >
      {/* Enhanced backdrop with blur effect */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
        <div className="w-full max-w-2xl max-h-[90vh] rounded-xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700 animate-in fade-in-0 zoom-in-95 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <DialogTitle as="h2" className="text-2xl font-bold text-gray-900 dark:text-white">
                Select Causes
              </DialogTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Choose the causes you'd like to support with your Waqf
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2 h-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <HiX className="w-5 h-5" />
            </Button>
          </div>

          {/* Search and Filter Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search causes by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-colors"
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <HiFilter className="text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Selection Summary */}
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{selected.length} cause{selected.length !== 1 ? 's' : ''} selected</span>
              <span>{filteredCauses.length} cause{filteredCauses.length !== 1 ? 's' : ''} shown</span>
            </div>
          </div>
          
          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300 font-medium">Loading causes...</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Please wait while we fetch available causes</p>
              </div>
            ) : error ? (
              <div className="p-6">
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-6">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mr-3">
                      <HiX className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                      Failed to load causes
                    </h3>
                  </div>
                  <p className="text-red-700 dark:text-red-300 mb-4">{error.message}</p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => window.location.reload()}
                    className="bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                  >
                    <HiX className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto p-6">
                {filteredCauses.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <HiSearch className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No causes found</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchTerm || selectedCategory !== 'all' 
                        ? 'Try adjusting your search or filter criteria.'
                        : 'No causes are available at the moment.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredCauses.map(cause => {
                      const isSelected = selected.includes(cause.id);
                      return (
                        <div 
                          key={cause.id} 
                          className={`group relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer transform hover:scale-[1.02] ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg ring-2 ring-blue-500/20' 
                              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-800/50'
                          }`}
                          onClick={() => handleCauseToggle(cause.id)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleCauseToggle(cause.id);
                            }
                          }}
                        >
                          <div className="flex items-start space-x-4">
                            {/* Custom Checkbox */}
                            <div className="flex-shrink-0 mt-1">
                              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                                isSelected 
                                  ? 'border-blue-500 bg-blue-500 shadow-md scale-110' 
                                  : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/10'
                              }`}>
                                {isSelected ? (
                                  <HiCheckCircle className="w-4 h-4 text-white animate-in zoom-in-50 duration-200" />
                                ) : (
                                  <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-blue-400 transition-colors duration-200" />
                                )}
                              </div>
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {cause.name} {cause.icon && <span className="ml-2">{cause.icon}</span>}
                                </h4>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                                    {cause.category}
                                  </span>
                                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                    cause.isActive 
                                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                                  }`}>
                                    {cause.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                              </div>
                              
                              {cause.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                                  {cause.description.length > 120 
                                    ? `${cause.description.substring(0, 120)}...` 
                                    : cause.description
                                  }
                                </p>
                              )}
                              
                              {/* Stats */}
                              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                <span>👥 {cause.followers || 0} followers</span>
                                <span>💰 ${(cause.fundsRaised || 0).toLocaleString()} raised</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {selected.length > 0 ? (
                  <div className="flex items-center space-x-2">
                    <HiCheckCircle className="w-4 h-4 text-lavender-blue-500" />
                    <span className="font-medium text-lavender-blue-700 dark:text-lavender-blue-300">
                      {selected.length} cause{selected.length !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">
                    Select at least one cause to continue
                  </span>
                )}
              </div>
              
              {/* Quick actions for large selections */}
              {selected.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCauseSelect([])}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Clear all
                </Button>
              )}
            </div>
            
            <div className="flex items-center justify-end space-x-4">
              {/* Professional Cancel Button */}
              <button
                onClick={onClose}
                className="group relative px-8 py-3 min-w-[120px] border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 font-semibold rounded-xl transform hover:scale-[1.02] active:scale-95 hover:shadow-lg"
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Cancel</span>
                </div>
              </button>
              
              {/* Professional Select Causes Button with Custom Gradient */}
              <button
                onClick={handleConfirm}
                disabled={selected.length === 0}
                style={{
                  background: selected.length === 0 
                    ? 'linear-gradient(to right, #93c5fd, #c4b5fd)' 
                    : 'linear-gradient(to right, #2563eb, #9333ea)'
                }}
                className={`group relative px-8 py-3 min-w-[180px] font-bold text-white rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 overflow-hidden shadow-xl hover:shadow-2xl focus:ring-4 focus:ring-blue-500/50 focus:ring-offset-2 ${
                  selected.length === 0 ? 'opacity-60 cursor-not-allowed' : ''
                }`}
                onMouseEnter={(e) => {
                  if (selected.length > 0) {
                    e.currentTarget.style.background = 'linear-gradient(to right, #1d4ed8, #7e22ce)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selected.length > 0) {
                    e.currentTarget.style.background = 'linear-gradient(to right, #2563eb, #9333ea)';
                  }
                }}
              >
                <div className="relative z-10 flex items-center justify-center space-x-3">
                  {selected.length === 0 ? (
                    <>
                      <svg className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Select Causes</span>
                    </>
                  ) : (
                    <>
                      <div className="relative">
                        <HiCheckCircle className="w-5 h-5 transition-transform group-hover:scale-125 duration-300" />
                        {/* Success pulse animation */}
                        <div className="absolute inset-0 bg-white rounded-full opacity-20 group-hover:animate-ping"></div>
                      </div>
                      <span>Confirm Selection</span>
                      <div className="ml-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold border border-white/30">
                        {selected.length}
                      </div>
                    </>
                  )}
                </div>
                
                {/* Professional glow effects */}
                {selected.length > 0 && (
                  <>
                    {/* Primary glow */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-xl"
                      style={{ background: 'linear-gradient(to right, #2563eb, #9333ea)' }}
                    ></div>
                    {/* Secondary glow for depth */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700 blur-2xl scale-110"
                      style={{ background: 'linear-gradient(to right, #3b82f6, #a855f7)' }}
                    ></div>
                  </>
                )}
                
                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
