'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PORTFOLIO_TEMPLATES } from '@/lib/portfolio-templates';
import type { PortfolioTemplate } from '@/types/portfolio';

interface PortfolioTemplateSelectorProps {
  onSelect: (templateId: string) => void;
  onSkip: () => void;
}

export function PortfolioTemplateSelector({
  onSelect,
  onSkip,
}: PortfolioTemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'beginner' | 'seasonal' | 'focused'>('all');

  const filteredTemplates = PORTFOLIO_TEMPLATES.filter(template => {
    if (filter === 'all') return true;
    if (filter === 'beginner') return template.tags.includes('beginner-friendly') || template.tags.includes('recommended');
    if (filter === 'seasonal') return template.tags.includes('ramadan') || template.tags.includes('seasonal');
    if (filter === 'focused') return template.tags.includes('education') || template.tags.includes('healthcare') || template.tags.includes('orphans');
    return true;
  });

  const handleSelect = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-7xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 p-8 text-white overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '32px 32px'
            }}></div>
          </div>

          <div className="relative flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-4xl">📚</div>
                <h2 className="text-3xl font-bold">Portfolio Templates</h2>
              </div>
              <p className="text-blue-100 text-base max-w-2xl">
                Start with an expert-designed portfolio strategy or build your own from scratch
              </p>
              <div className="mt-4 flex items-center gap-4 text-sm text-blue-100">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>10 Expert Templates</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Optimized Allocations</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Fully Customizable</span>
                </div>
              </div>
            </div>
            <button
              onClick={onSkip}
              className="text-white hover:bg-white/20 rounded-full p-2.5 transition-all duration-200 hover:scale-110"
              title="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b border-gray-200 px-8 py-5 bg-gradient-to-b from-gray-50 to-white">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold text-gray-700 mr-2">Filter by:</span>
            <button
              onClick={() => setFilter('all')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
              }`}
            >
              All Templates
            </button>
            <button
              onClick={() => setFilter('beginner')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                filter === 'beginner'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
              }`}
            >
              ⭐ Recommended
            </button>
            <button
              onClick={() => setFilter('seasonal')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                filter === 'seasonal'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
              }`}
            >
              🌙 Seasonal
            </button>
            <button
              onClick={() => setFilter('focused')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                filter === 'focused'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
              }`}
            >
              🎯 Cause-Focused
            </button>
            <div className="ml-auto text-sm text-gray-600 font-medium">
              {filteredTemplates.length} {filteredTemplates.length === 1 ? 'template' : 'templates'}
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="p-8 overflow-y-auto max-h-[calc(92vh-340px)] bg-gradient-to-b from-white to-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                isSelected={selectedTemplate === template.id}
                onSelect={() => setSelectedTemplate(template.id)}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-200 px-8 py-5 bg-white flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <Button
              onClick={onSkip}
              variant="outline"
              className="text-gray-700 border-2 border-gray-300 hover:bg-gray-50 font-semibold px-6 py-2.5"
            >
              Skip & Build from Scratch
            </Button>
            {selectedTemplate && (
              <span className="text-sm text-gray-600 font-medium">
                ✓ {filteredTemplates.find(t => t.id === selectedTemplate)?.name} selected
              </span>
            )}
          </div>
          <Button
            onClick={handleSelect}
            disabled={!selectedTemplate}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold px-8 py-2.5 shadow-lg shadow-blue-500/30 disabled:shadow-none transition-all duration-200"
          >
            {selectedTemplate ? 'Use This Template →' : 'Select a Template'}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface TemplateCardProps {
  template: PortfolioTemplate;
  isSelected: boolean;
  onSelect: () => void;
}

function TemplateCard({ template, isSelected, onSelect }: TemplateCardProps) {
  // Get risk/liquidity colors and icons
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getLiquidityColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-blue-600 bg-blue-50';
      case 'medium': return 'text-purple-600 bg-purple-50';
      case 'low': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`group relative bg-white rounded-2xl border-2 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
        isSelected
          ? 'border-blue-500 ring-4 ring-blue-100 shadow-xl'
          : 'border-gray-200 hover:border-blue-300'
      }`}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-0 right-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white px-4 py-2 rounded-bl-2xl shadow-lg z-10">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs font-bold">Selected</span>
          </div>
        </div>
      )}

      {/* Gradient Header */}
      <div className={`relative h-20 bg-gradient-to-br ${
        isSelected
          ? 'from-blue-500 via-blue-600 to-purple-600'
          : 'from-gray-100 via-gray-200 to-gray-300 group-hover:from-blue-50 group-hover:via-blue-100 group-hover:to-purple-100'
      } transition-all duration-300`}>
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div className="relative h-full flex items-center justify-center">
          <div className={`text-5xl transform transition-transform duration-300 ${
            isSelected ? 'scale-110' : 'group-hover:scale-110'
          }`}>
            {template.icon}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 min-h-[3.5rem]">
          {template.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-3 min-h-[4rem]">
          {template.description}
        </p>

        {/* Allocation Breakdown */}
        {template.globalAllocation && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Allocation Strategy
              </span>
            </div>

            {/* Visual Bar */}
            <div className="w-full bg-gray-100 rounded-full h-4 flex overflow-hidden shadow-inner mb-3">
              {template.globalAllocation.permanent > 0 && (
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center transition-all duration-300 hover:opacity-90"
                  style={{ width: `${template.globalAllocation.permanent}%` }}
                  title={`Permanent: ${template.globalAllocation.permanent}%`}
                >
                  {template.globalAllocation.permanent >= 15 && (
                    <span className="text-white text-xs font-bold">
                      {template.globalAllocation.permanent}%
                    </span>
                  )}
                </div>
              )}
              {template.globalAllocation.temporary_consumable > 0 && (
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center transition-all duration-300 hover:opacity-90"
                  style={{ width: `${template.globalAllocation.temporary_consumable}%` }}
                  title={`Consumable: ${template.globalAllocation.temporary_consumable}%`}
                >
                  {template.globalAllocation.temporary_consumable >= 15 && (
                    <span className="text-white text-xs font-bold">
                      {template.globalAllocation.temporary_consumable}%
                    </span>
                  )}
                </div>
              )}
              {template.globalAllocation.temporary_revolving > 0 && (
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center transition-all duration-300 hover:opacity-90"
                  style={{ width: `${template.globalAllocation.temporary_revolving}%` }}
                  title={`Revolving: ${template.globalAllocation.temporary_revolving}%`}
                >
                  {template.globalAllocation.temporary_revolving >= 15 && (
                    <span className="text-white text-xs font-bold">
                      {template.globalAllocation.temporary_revolving}%
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"></div>
                <span className="text-gray-700 font-medium">
                  ♾️ {template.globalAllocation.permanent}%
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-green-600"></div>
                <span className="text-gray-700 font-medium">
                  ⚡ {template.globalAllocation.temporary_consumable}%
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600"></div>
                <span className="text-gray-700 font-medium">
                  🔄 {template.globalAllocation.temporary_revolving}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {/* Risk */}
          <div className={`rounded-lg p-3 text-center border-2 border-transparent transition-all ${getRiskColor(template.riskLevel)}`}>
            <div className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
              Risk
            </div>
            <div className="text-sm font-bold capitalize">
              {template.riskLevel}
            </div>
          </div>

          {/* Diversity Score */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-3 text-center border-2 border-blue-100">
            <div className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
              Diversity
            </div>
            <div className="text-sm font-bold text-blue-600">
              {template.diversificationScore}
            </div>
          </div>

          {/* Liquidity */}
          <div className={`rounded-lg p-3 text-center border-2 border-transparent transition-all ${getLiquidityColor(template.liquidityLevel)}`}>
            <div className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
              Liquidity
            </div>
            <div className="text-sm font-bold capitalize">
              {template.liquidityLevel}
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {template.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="px-2.5 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 text-xs rounded-full font-medium border border-purple-200"
            >
              {tag}
            </span>
          ))}
          {template.tags.length > 3 && (
            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
              +{template.tags.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Hover Effect Border */}
      <div className={`absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 ${
        isSelected ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
      </div>
    </div>
  );
}

