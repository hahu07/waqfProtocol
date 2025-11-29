/**
 * Utility functions for consistent WaqfType handling across the application
 * 
 * This module provides normalization and comparison utilities to handle
 * the inconsistency between:
 * - Frontend enum values: 'temporary_consumable' (lowercase with underscores)
 * - Backend Rust enum: TemporaryConsumable (PascalCase)
 * - Legacy formats: TEMPORARY_CONSUMABLE (uppercase with underscores)
 */

import { WaqfType } from '@/types/waqfs';

/**
 * Normalize any waqf type string to the standard format
 * Standard format: lowercase with underscores (e.g., 'temporary_consumable')
 * 
 * @param waqfType - Any variant of waqf type string
 * @returns Normalized waqf type string
 */
export function normalizeWaqfType(waqfType: string | WaqfType | undefined | null): string {
  if (!waqfType) return '';
  
  const typeStr = typeof waqfType === 'string' ? waqfType : String(waqfType);
  
  // Convert PascalCase to snake_case (e.g., TemporaryConsumable -> temporary_consumable)
  return typeStr
    .replace(/([a-z])([A-Z])/g, '$1_$2')  // Add underscore between camelCase
    .toLowerCase();                        // Convert to lowercase
}

/**
 * Check if a waqf type is consumable (any variant)
 * 
 * @param waqfType - Any variant of waqf type string
 * @returns true if consumable type
 */
export function isConsumableWaqf(waqfType: string | WaqfType | undefined | null): boolean {
  return normalizeWaqfType(waqfType) === 'temporary_consumable';
}

/**
 * Check if a waqf type is revolving (any variant)
 * 
 * @param waqfType - Any variant of waqf type string
 * @returns true if revolving type
 */
export function isRevolvingWaqf(waqfType: string | WaqfType | undefined | null): boolean {
  return normalizeWaqfType(waqfType) === 'temporary_revolving';
}

/**
 * Check if a waqf type is permanent (any variant)
 * 
 * @param waqfType - Any variant of waqf type string
 * @returns true if permanent type
 */
export function isPermanentWaqf(waqfType: string | WaqfType | undefined | null): boolean {
  return normalizeWaqfType(waqfType) === 'permanent';
}

/**
 * Check if a waqf type is hybrid (any variant)
 * 
 * @param waqfType - Any variant of waqf type string
 * @returns true if hybrid type
 */
export function isHybridWaqf(waqfType: string | WaqfType | undefined | null): boolean {
  return normalizeWaqfType(waqfType) === 'hybrid';
}

/**
 * Get the TypeScript enum value from any variant
 * 
 * @param waqfType - Any variant of waqf type string
 * @returns WaqfType enum value or undefined
 */
export function toWaqfTypeEnum(waqfType: string | undefined | null): WaqfType | undefined {
  const normalized = normalizeWaqfType(waqfType);
  
  switch (normalized) {
    case 'permanent':
      return WaqfType.PERMANENT;
    case 'temporary_consumable':
      return WaqfType.TEMPORARY_CONSUMABLE;
    case 'temporary_revolving':
      return WaqfType.TEMPORARY_REVOLVING;
    default:
      return undefined;
  }
}

/**
 * Format waqf type for display
 * 
 * @param waqfType - Any variant of waqf type string
 * @returns Human-readable string
 */
export function formatWaqfType(waqfType: string | WaqfType | undefined | null): string {
  const normalized = normalizeWaqfType(waqfType);
  
  switch (normalized) {
    case 'permanent':
      return 'Permanent Waqf';
    case 'temporary_consumable':
      return 'Temporary Consumable Waqf';
    case 'temporary_revolving':
      return 'Temporary Revolving Waqf';
    case 'hybrid':
      return 'Hybrid Waqf';
    default:
      return 'Unknown Type';
  }
}
