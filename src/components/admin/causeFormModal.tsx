// components/admin/CauseFormModal.tsx - FOR ADMINS ONLY
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import type { Cause, Category, Subcategory } from "@/types/waqfs";
import { WaqfType } from "@/types/waqfs";
import { canApproveCauses, canManageCauses } from '@/lib/admin-utils';
import { getCategories, getSubcategoriesByCategoryId } from '@/lib/categories';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';
import { useDropzone } from 'react-dropzone';
import { uploadFile, listAssets } from '@junobuild/core';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/lib/logger';

interface CauseFormModalProps {
  isOpen: boolean;
  cause?: Cause | null;
  onSave: (causeData: Omit<Cause, 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
  onDelete?: (causeId: string) => void; // Only for editing existing causes
}

export const CauseFormModal = ({ 
  isOpen, 
  cause, 
  onSave, 
  onClose,
  onDelete 
}: CauseFormModalProps) => {
  const { user } = useAuth();
  const [canApprove, setCanApprove] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [formData, setFormData] = useState<Omit<Cause, 'createdAt' | 'updatedAt'>>(() => ({
    id: cause?.id || '',
    name: cause?.name || '',
    description: cause?.description || '',
    icon: cause?.icon || '❤️',
    coverImage: cause?.coverImage || '',
    categoryId: cause?.categoryId || '',
    subcategoryId: cause?.subcategoryId || '',
    category: cause?.category, // Legacy field for backward compatibility
    isActive: cause?.isActive ?? false,
    sortOrder: cause?.sortOrder || 0,
    status: cause?.status || 'pending',
    followers: cause?.followers || 0,
    fundsRaised: cause?.fundsRaised || 0,
    targetAmount: cause?.targetAmount,
    primaryCurrency: cause?.primaryCurrency || 'NGN',
    exchangeRateToUSD: cause?.exchangeRateToUSD || 1650,
    supportedWaqfTypes: cause?.supportedWaqfTypes || [WaqfType.PERMANENT],
    investmentStrategy: cause?.investmentStrategy || {
      assetAllocation: '60% Sukuk, 40% Equity',
      expectedAnnualReturn: 7.0,
      distributionFrequency: 'quarterly'
    },
    consumableOptions: cause?.consumableOptions || {
      minDurationMonths: 6,
      maxDurationMonths: 60,
      defaultSpendingSchedule: 'phased'
    },
    revolvingOptions: cause?.revolvingOptions || {
      minLockPeriodMonths: 12,
      maxLockPeriodMonths: 120,
      expectedReturnDuringPeriod: 35.0
    }
  }));

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCheckingCollection, setIsCheckingCollection] = useState(false);
  
  // Dynamic categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  // Check permissions
  useEffect(() => {
    const checkPermissions = async () => {
      if (user?.key) {
        const hasApprovalPermission = await canApproveCauses(user.key);
        const hasManagementPermission = await canManageCauses(user.key);
        setCanApprove(hasApprovalPermission);
        setCanManage(hasManagementPermission);
      }
    };
    checkPermissions();
  }, [user]);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const cats = await getCategories();
        setCategories(cats);
      } catch (error) {
        logger.error('Error loading categories', error);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  // Load subcategories when category changes
  useEffect(() => {
    const loadSubcategories = async () => {
      if (formData.categoryId) {
        try {
          setLoadingSubcategories(true);
          const subs = await getSubcategoriesByCategoryId(formData.categoryId);
          setSubcategories(subs);
        } catch (error) {
          logger.error('Error loading subcategories', error);
        } finally {
          setLoadingSubcategories(false);
        }
      } else {
        setSubcategories([]);
      }
    };
    loadSubcategories();
  }, [formData.categoryId]);

  // Reset form data when modal opens or cause changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        id: cause?.id || '',
        name: cause?.name || '',
        description: cause?.description || '',
        icon: cause?.icon || '❤️',
        coverImage: cause?.coverImage || '',
        categoryId: cause?.categoryId || '',
        subcategoryId: cause?.subcategoryId || '',
        category: cause?.category, // Legacy field
        isActive: cause?.isActive ?? false,
        sortOrder: cause?.sortOrder || 0,
        status: cause?.status || 'pending',
        followers: cause?.followers || 0,
        fundsRaised: cause?.fundsRaised || 0,
        targetAmount: cause?.targetAmount,
        primaryCurrency: cause?.primaryCurrency || 'NGN',
        exchangeRateToUSD: cause?.exchangeRateToUSD || 1650,
        supportedWaqfTypes: cause?.supportedWaqfTypes || [WaqfType.PERMANENT],
        investmentStrategy: cause?.investmentStrategy || {
          assetAllocation: '60% Sukuk, 40% Equity',
          expectedAnnualReturn: 7.0,
          distributionFrequency: 'quarterly'
        },
        consumableOptions: cause?.consumableOptions || {
          minDurationMonths: 6,
          maxDurationMonths: 60,
          defaultSpendingSchedule: 'phased'
        },
        revolvingOptions: cause?.revolvingOptions || {
          minLockPeriodMonths: 12,
          maxLockPeriodMonths: 120,
          expectedReturnDuringPeriod: 35.0
        }
      });
      setErrors({});
      setIsSubmitting(false);
      setIsUploading(false);
    }
  }, [isOpen, cause]);

  // Get common icons based on the current subcategory
  const getIconSuggestions = () => {
    // Common icons for all causes
    const commonIcons = ['❤️', '🌟', '✨', '💝', '🎯', '🤗', '💡', '🌈', '🤲', '🏆'];
    
    // Find current subcategory to get its icon
    const currentSubcategory = subcategories.find(sub => sub.id === formData.subcategoryId);
    if (currentSubcategory) {
      return [currentSubcategory.icon, ...commonIcons];
    }
    
    return commonIcons;
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        await handleImageUpload(acceptedFiles[0]);
      }
    }
  });

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      logger.debug('Starting image upload', { fileName: file.name, fileType: file.type, fileSize: file.size });
      
      const result = await uploadFile({
        collection: 'cause_images',
        data: file,
        filename: `cause_images/${uuidv4()}_${file.name}`
      } as const);

      logger.debug('Upload result', { data: result });

      if (!result?.downloadUrl) {
        throw new Error('Failed to get download URL');
      }

      logger.debug('Image uploaded successfully', { data: result.downloadUrl });

      // Insert markdown image syntax at cursor position
      const markdownImage = `![${file.name}](${result.downloadUrl})`;
      setFormData(prev => ({
        ...prev,
        description: `${prev.description}\n${markdownImage}\n`
      }));
      
      alert('Image uploaded successfully!');
    } catch (error) {
      logger.error('Error uploading image', error instanceof Error ? error : { error });
      alert(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Helper function to check if collection exists and has proper setup
  const checkCollection = async () => {
    try {
      setIsCheckingCollection(true);
      logger.debug('Checking cause_images collection...');
      
      const assets = await listAssets({
        collection: 'cause_images',
        filter: {
          matcher: {
            description: '*'
          }
        }
      });
      
      logger.debug('Collection check result', { data: assets });
      return true;
    } catch (error) {
      logger.error('Collection check failed', error instanceof Error ? error : { error });
      return false;
    } finally {
      setIsCheckingCollection(false);
    }
  };

  const handleCoverImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      logger.debug('Starting cover image upload', { fileName: file.name, fileType: file.type, fileSize: file.size });
      
      const result = await uploadFile({
        collection: 'cause_images',
        data: file,
        filename: `cause_covers/${uuidv4()}_${file.name}`
      } as const);

      logger.debug('Cover upload result', { data: result });

      if (!result?.downloadUrl) {
        throw new Error('Failed to get download URL');
      }

      logger.debug('Cover image uploaded successfully', { data: result.downloadUrl });

      // Set cover image URL
      setFormData(prev => ({
        ...prev,
        coverImage: result.downloadUrl
      }));
      
      alert('Cover image uploaded successfully!');
    } catch (error) {
      logger.error('Error uploading cover image', error instanceof Error ? error : { error });
      alert(`Failed to upload cover image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Cause name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Cause name must be at least 3 characters';
    }

    // Category validation
    if (!formData.categoryId) {
      newErrors.categoryId = 'Main category is required';
    }

    // Subcategory validation
    if (!formData.subcategoryId) {
      newErrors.subcategoryId = 'Subcategory is required';
    }

    // Description validation - check plain text length
    const plainText = formData.description.replace(/[#*_~`\[\]]/g, '');
    if (!plainText.trim()) {
      newErrors.description = 'Description is required';
    } else if (plainText.length < 20) {
      newErrors.description = 'Description must contain at least 20 characters of meaningful content';
    } else if (formData.description.length > 5000) {
      newErrors.description = 'Description must be less than 5000 characters';
    }

    // Sort order validation
    if (formData.sortOrder < 0) {
      newErrors.sortOrder = 'Sort order cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (cause && onDelete) {
      if (window.confirm(`Are you sure you want to delete "${cause.name}"? This action cannot be undone.`)) {
        onDelete(cause.name); // Using cause name as ID
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Gradient Header */}
        <div className="p-6 border-b border-gray-200" style={{ background: 'linear-gradient(135deg, #2563eb, #9333ea)' }}>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {cause ? '✏️ Edit Cause' : '✨ Create New Cause'}
              </h2>
              <p className="text-blue-100 text-sm">
                {cause ? 'Update cause details and settings' : 'Add a new charitable cause to the platform'}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cause Name */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                🎯 Cause Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all ${
                  errors.name ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:bg-white'
                }`}
                placeholder="e.g., Education Support for Orphans"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                  <span>⚠️</span> {errors.name}
                </p>
              )}
            </div>

            {/* Cover Image Upload */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border-2 border-purple-100">
              <label className="block text-sm font-semibold mb-3 text-gray-700">
                🖼️ Cover Image (Optional)
              </label>
              <p className="text-xs text-gray-600 mb-3">
                Upload a cover image for this cause. This will be displayed prominently on cause cards.
              </p>
              
              {formData.coverImage ? (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden border-2 border-purple-200 shadow-md">
                    <img 
                      src={formData.coverImage}
                      alt="Cover preview" 
                      className="w-full h-48 object-cover"
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      onError={(e) => {
                        logger.error('Failed to load cover image', { url: formData.coverImage });
                      }}
                      onLoad={() => {
                        logger.debug('Cover image loaded successfully:', { data: formData.coverImage });
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, coverImage: '' }))}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                      title="Remove cover image"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <label className="block cursor-pointer">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleCoverImageUpload(file);
                    }}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <div className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center hover:border-purple-500 hover:bg-purple-50/50 transition-all">
                    <div className="text-4xl mb-3">{isUploading ? '⏳' : '🖼️'}</div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      {isUploading ? 'Uploading...' : 'Click to upload cover image'}
                    </p>
                    <p className="text-xs text-gray-500">
                      JPEG, JPG, PNG, WEBP (Max 5MB)
                    </p>
                  </div>
                </label>
              )}
            </div>

            {/* Description */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  📝 Description *
                </label>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-sm">
                      {isUploading ? '⏳ Uploading...' : '🖼️ Add Image'}
                    </span>
                  </label>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                    formData.description.length > 4500 ? 'bg-red-100 text-red-700' :
                    formData.description.length > 4000 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {formData.description.length}/5000
                  </span>
                </div>
              </div>
              <div className={`border-2 rounded-xl overflow-hidden transition-all ${
                errors.description ? 'border-red-500 ring-4 ring-red-100' : 'border-gray-200 hover:border-gray-300'
              }`} data-color-mode="light">
                <MDEditor
                  value={formData.description}
                  onChange={(value = '') => setFormData(prev => ({ ...prev, description: value }))}
                  previewOptions={{ rehypePlugins: [[rehypeSanitize]] }}
                  height={250}
                  commands={[
                    {
                      name: 'uploadImage',
                      icon: (
                        <div 
                          {...getRootProps()} 
                          className="p-1 cursor-pointer hover:bg-blue-50 rounded transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                        >
                          <input {...getInputProps()} />
                          <span title={isUploading ? 'Uploading...' : 'Upload image'} className="inline-block">
                            {isUploading ? '⏳' : '🖼️'}
                          </span>
                        </div>
                      ),
                      execute: () => {}
                    }
                  ]}
                />
              </div>
              {errors.description && (
                <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                  <span>⚠️</span> {errors.description}
                </p>
              )}
              <p className="text-xs text-gray-600 mt-2 bg-blue-50 px-3 py-2 rounded-lg flex items-start gap-2 border border-blue-100">
                <span>💡</span>
                <span>
                  <strong>Two ways to add images:</strong><br/>
                  1. <strong>Dedicated Cover:</strong> Use the Cover Image section above for the main cause image<br/>
                  2. <strong>In Description:</strong> Click '🖼️ Add Image' button or drag & drop images here
                </span>
              </p>
              {isDragActive && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 pointer-events-none backdrop-blur-sm">
                  <div className="bg-white p-10 rounded-2xl text-center shadow-2xl">
                    <div className="text-6xl mb-4">🖼️</div>
                    <p className="text-xl font-bold text-gray-900 mb-2">Drop Image Here</p>
                    <p className="text-gray-600">Release to upload</p>
                  </div>
                </div>
              )}
            </div>

            {/* Icon Selection */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-5 rounded-xl border-2 border-blue-100">
              <label className="block text-sm font-semibold mb-3 text-gray-700">
                🎨 Cause Icon
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-16 h-16 bg-white rounded-xl border-2 border-gray-200 flex items-center justify-center text-3xl shadow-sm">
                    {formData.icon || '❓'}
                  </div>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white"
                    placeholder="Enter emoji or leave blank"
                    maxLength={2}
                  />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-2">
                    🎯 Suggested Icons:
                  </p>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {getIconSuggestions().map(icon => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, icon }))}
                        className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                          formData.icon === icon 
                            ? 'bg-white border-blue-500 shadow-lg scale-110 ring-4 ring-blue-100' 
                            : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md hover:scale-105'
                        }`}
                        title={`Select ${icon}`}
                      >
                        <span className="text-2xl">{icon}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Icons adapt based on your selected subcategory. You can also type any emoji manually.
                  </p>
                </div>
              </div>
            </div>

            {/* Category and Subcategory */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Main Category */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    📋 Main Category *
                  </label>
                  {loadingCategories ? (
                    <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500 flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      <span>Loading categories...</span>
                    </div>
                  ) : (
                    <select
                      value={formData.categoryId}
                      onChange={(e) => {
                        setFormData(prev => ({ 
                          ...prev, 
                          categoryId: e.target.value,
                          subcategoryId: '' // Reset subcategory when main category changes
                        }));
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white"
                      required
                    >
                      <option value="">Select a category...</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {formData.categoryId && categories.find(c => c.id === formData.categoryId) && (
                    <p className="text-xs text-gray-600 mt-2 bg-blue-50 px-3 py-2 rounded-lg">
                      {categories.find(c => c.id === formData.categoryId)?.description}
                    </p>
                  )}
                  {errors.categoryId && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                      <span>⚠️</span> {errors.categoryId}
                    </p>
                  )}
                </div>

                {/* Subcategory */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    🎯 Subcategory *
                  </label>
                  {!formData.categoryId ? (
                    <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500">
                      Select a main category first
                    </div>
                  ) : loadingSubcategories ? (
                    <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500 flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      <span>Loading subcategories...</span>
                    </div>
                  ) : subcategories.length === 0 ? (
                    <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-yellow-50 text-yellow-700">
                      No subcategories available
                    </div>
                  ) : (
                    <select
                      value={formData.subcategoryId}
                      onChange={(e) => setFormData(prev => ({ ...prev, subcategoryId: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white"
                      required
                      disabled={!formData.categoryId}
                    >
                      <option value="">Select a subcategory...</option>
                      {subcategories.map(sub => (
                        <option key={sub.id} value={sub.id}>
                          {sub.icon} {sub.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {formData.subcategoryId && subcategories.find(s => s.id === formData.subcategoryId) && (
                    <div className="mt-2 space-y-2">
                      <p className="text-xs text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
                        {subcategories.find(s => s.id === formData.subcategoryId)?.description}
                      </p>
                      {subcategories.find(s => s.id === formData.subcategoryId)?.examples.length > 0 && (
                        <div className="text-xs text-gray-600 bg-purple-50 px-3 py-2 rounded-lg">
                          <p className="font-semibold mb-1">💡 Examples:</p>
                          <ul className="list-disc list-inside space-y-0.5">
                            {subcategories.find(s => s.id === formData.subcategoryId)?.examples.slice(0, 3).map((ex, idx) => (
                              <li key={idx}>{ex}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  {errors.subcategoryId && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                      <span>⚠️</span> {errors.subcategoryId}
                    </p>
                  )}
                </div>
              </div>

              {/* Status Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Active Status */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    🔄 Active Status
                  </label>
                  <select
                    value={formData.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'active' }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white"
                  >
                    <option value="active">✅ Active</option>
                    <option value="inactive">⏸️ Inactive</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Only active causes are visible to donors
                  </p>
                </div>

                {/* Approval Status - Only for users with approval permission */}
                {canApprove ? (
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    ✅ Approval Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'pending' | 'approved' | 'rejected' }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white"
                  >
                    <option value="approved">✅ Approved</option>
                    <option value="pending">⏳ Pending Review</option>
                    <option value="rejected">❌ Rejected</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    ✅ Status
                  </label>
                  <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-600">
                    {formData.status === 'approved' && '✅ Approved'}
                    {formData.status === 'pending' && '⏳ Pending Review'}
                    {formData.status === 'rejected' && '❌ Rejected'}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">💡 Only authorized admins can change approval status</p>
                </div>
              )}
              </div>
            </div>

            {/* Waqf Type Configuration */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl border-2 border-green-100 space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                🏛️ Supported Waqf Types
              </h3>
              <p className="text-sm text-gray-600">
                Select which waqf models donors can use for this cause
              </p>
              
              <div className="space-y-3">
                {/* Permanent Waqf */}
                <label className="flex items-start gap-3 p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-green-300 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={formData.supportedWaqfTypes.includes(WaqfType.PERMANENT)}
                    onChange={(e) => {
                      const types = e.target.checked
                        ? [...formData.supportedWaqfTypes, WaqfType.PERMANENT]
                        : formData.supportedWaqfTypes.filter(t => t !== WaqfType.PERMANENT);
                      setFormData(prev => ({ ...prev, supportedWaqfTypes: types }));
                    }}
                    className="mt-1 h-5 w-5 text-green-600 focus:ring-4 focus:ring-green-100 rounded"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">Permanent Waqf</div>
                    <div className="text-xs text-gray-600 mt-1">
                      Principal preserved forever, only returns distributed
                    </div>
                  </div>
                </label>
                
                {/* Consumable Waqf */}
                <label className="flex items-start gap-3 p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={formData.supportedWaqfTypes.includes(WaqfType.TEMPORARY_CONSUMABLE)}
                    onChange={(e) => {
                      const types = e.target.checked
                        ? [...formData.supportedWaqfTypes, WaqfType.TEMPORARY_CONSUMABLE]
                        : formData.supportedWaqfTypes.filter(t => t !== WaqfType.TEMPORARY_CONSUMABLE);
                      setFormData(prev => ({ ...prev, supportedWaqfTypes: types }));
                    }}
                    className="mt-1 h-5 w-5 text-blue-600 focus:ring-4 focus:ring-blue-100 rounded"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">Consumable Waqf</div>
                    <div className="text-xs text-gray-600 mt-1">
                      Principal + returns spent over time period
                    </div>
                  </div>
                </label>
                
                {/* Revolving Waqf */}
                <label className="flex items-start gap-3 p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-purple-300 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={formData.supportedWaqfTypes.includes(WaqfType.TEMPORARY_REVOLVING)}
                    onChange={(e) => {
                      const types = e.target.checked
                        ? [...formData.supportedWaqfTypes, WaqfType.TEMPORARY_REVOLVING]
                        : formData.supportedWaqfTypes.filter(t => t !== WaqfType.TEMPORARY_REVOLVING);
                      setFormData(prev => ({ ...prev, supportedWaqfTypes: types }));
                    }}
                    className="mt-1 h-5 w-5 text-purple-600 focus:ring-4 focus:ring-purple-100 rounded"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">Revolving Waqf</div>
                    <div className="text-xs text-gray-600 mt-1">
                      Principal returned to donor, returns distributed during term
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Conditional Configuration Sections */}
            {formData.supportedWaqfTypes.includes(WaqfType.PERMANENT) && (
              <div className="bg-green-50 p-5 rounded-xl border-2 border-green-100 space-y-4">
                <h3 className="text-base font-semibold text-gray-800">💎 Investment Strategy (Permanent)</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Asset Allocation
                    </label>
                    <input
                      type="text"
                      value={formData.investmentStrategy?.assetAllocation || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        investmentStrategy: {
                          ...prev.investmentStrategy!,
                          assetAllocation: e.target.value
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., 60% Sukuk, 40% Equity"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expected Annual Return (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={formData.investmentStrategy?.expectedAnnualReturn || 0}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          investmentStrategy: {
                            ...prev.investmentStrategy!,
                            expectedAnnualReturn: parseFloat(e.target.value)
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Distribution Frequency
                      </label>
                      <select
                        value={formData.investmentStrategy?.distributionFrequency || 'quarterly'}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          investmentStrategy: {
                            ...prev.investmentStrategy!,
                            distributionFrequency: e.target.value as 'monthly' | 'quarterly' | 'annually'
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="annually">Annually</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {formData.supportedWaqfTypes.includes(WaqfType.TEMPORARY_CONSUMABLE) && (
              <div className="bg-blue-50 p-5 rounded-xl border-2 border-blue-100 space-y-4">
                <h3 className="text-base font-semibold text-gray-800">⚡ Consumable Options</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Duration (months)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.consumableOptions?.minDurationMonths || 6}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        consumableOptions: {
                          ...prev.consumableOptions!,
                          minDurationMonths: parseInt(e.target.value)
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Duration (months)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.consumableOptions?.maxDurationMonths || 60}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        consumableOptions: {
                          ...prev.consumableOptions!,
                          maxDurationMonths: parseInt(e.target.value)
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Default Schedule
                    </label>
                    <select
                      value={formData.consumableOptions?.defaultSpendingSchedule || 'phased'}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        consumableOptions: {
                          ...prev.consumableOptions!,
                          defaultSpendingSchedule: e.target.value as 'immediate' | 'phased' | 'milestone-based' | 'ongoing'
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="immediate">⚡ Immediate</option>
                      <option value="phased">📅 Phased</option>
                      <option value="milestone-based">🎯 Milestone-Based</option>
                      <option value="ongoing">♾️ Ongoing</option>
                    </select>
                  </div>
                </div>
                <div className="text-xs text-gray-600 space-y-1 bg-white/50 p-3 rounded-lg">
                  <p><strong>⚡ Immediate:</strong> Full amount distributed once fundraising target is met</p>
                  <p><strong>📅 Phased:</strong> Funds distributed in equal installments over the specified duration</p>
                  <p><strong>🎯 Milestone-Based:</strong> Funds released when specific project milestones are achieved</p>
                  <p><strong>♾️ Ongoing:</strong> Continuous monthly distributions for recurring support (e.g., orphan sponsorship, healthcare)</p>
                </div>
              </div>
            )}

            {formData.supportedWaqfTypes.includes(WaqfType.TEMPORARY_REVOLVING) && (
              <div className="bg-purple-50 p-5 rounded-xl border-2 border-purple-100 space-y-4">
                <h3 className="text-base font-semibold text-gray-800">🔄 Revolving Options</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Lock Period (months)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.revolvingOptions?.minLockPeriodMonths || 12}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        revolvingOptions: {
                          ...prev.revolvingOptions!,
                          minLockPeriodMonths: parseInt(e.target.value)
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Lock Period (months)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="240"
                      value={formData.revolvingOptions?.maxLockPeriodMonths || 120}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        revolvingOptions: {
                          ...prev.revolvingOptions!,
                          maxLockPeriodMonths: parseInt(e.target.value)
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expected Return (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.revolvingOptions?.expectedReturnDuringPeriod || 35}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        revolvingOptions: {
                          ...prev.revolvingOptions!,
                          expectedReturnDuringPeriod: parseFloat(e.target.value)
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Target Amount & Currency */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-5 rounded-xl border-2 border-yellow-100 space-y-4">
              <h3 className="text-base font-semibold text-gray-800">💰 Fundraising Configuration</h3>
              
              {/* Primary Currency */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  🌍 Primary Currency
                </label>
                <select
                  value={formData.primaryCurrency}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaryCurrency: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-yellow-100 focus:border-yellow-500 transition-all bg-white"
                >
                  <option value="NGN">🇳🇬 Nigerian Naira (NGN)</option>
                  <option value="USD">🇺🇸 US Dollar (USD)</option>
                  <option value="EUR">🇪🇺 Euro (EUR)</option>
                  <option value="GBP">🇬🇧 British Pound (GBP)</option>
                  <option value="SAR">🇸🇦 Saudi Riyal (SAR)</option>
                  <option value="AED">🇦🇪 UAE Dirham (AED)</option>
                </select>
              </div>
              
              {/* Exchange Rate (if not USD) */}
              {formData.primaryCurrency && formData.primaryCurrency !== 'USD' && (
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    💱 Exchange Rate to USD
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">1 USD =</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.exchangeRateToUSD || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        exchangeRateToUSD: e.target.value ? parseFloat(e.target.value) : undefined 
                      }))}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-yellow-100 focus:border-yellow-500 transition-all bg-white"
                      placeholder="e.g., 1650"
                    />
                    <span className="text-sm font-semibold text-gray-700">{formData.primaryCurrency}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Current rate: 1 USD ≈ {formData.exchangeRateToUSD || 0} {formData.primaryCurrency}
                  </p>
                </div>
              )}
              
              {/* Target Amount */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  🎯 Target Amount (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                    {formData.primaryCurrency === 'NGN' ? '₦' :
                     formData.primaryCurrency === 'EUR' ? '€' :
                     formData.primaryCurrency === 'GBP' ? '£' :
                     formData.primaryCurrency === 'SAR' ? 'SR' :
                     formData.primaryCurrency === 'AED' ? 'د.إ' : '$'}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.targetAmount || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      targetAmount: e.target.value ? parseFloat(e.target.value) : undefined 
                    }))}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-yellow-100 focus:border-yellow-500 transition-all bg-white"
                    placeholder={`e.g., ${formData.primaryCurrency === 'NGN' ? '50,000,000' : '50,000'}`}
                  />
                </div>
                {formData.targetAmount && formData.primaryCurrency !== 'USD' && formData.exchangeRateToUSD && (
                  <p className="text-xs text-gray-600 mt-2 bg-white px-3 py-2 rounded-lg border border-yellow-200">
                    ≈ ${(formData.targetAmount / formData.exchangeRateToUSD).toLocaleString(undefined, {maximumFractionDigits: 2})} USD
                  </p>
                )}
                <p className="text-xs text-gray-600 mt-2 bg-yellow-50 px-3 py-2 rounded-lg">
                  💡 Set a fundraising goal for this cause. Leave empty if no specific target.
                </p>
              </div>
            </div>

            {/* Active Status and Sort Order */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Active Status - Only for users with approval permission */}
              {canApprove ? (
                <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="h-5 w-5 text-blue-600 focus:ring-4 focus:ring-blue-100 rounded border-2 border-gray-300"
                    />
                    <div>
                      <span className="text-sm font-semibold text-gray-700 block">
                        {formData.isActive ? '✅ Active' : '⏸️ Inactive'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formData.isActive ? 'Visible to users' : 'Hidden from users'}
                      </span>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="bg-gray-100 p-4 rounded-xl border-2 border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded flex items-center justify-center text-xs ${
                      formData.isActive ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
                    }`}>
                      {formData.isActive ? '✓' : '✕'}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-700 block">
                        {formData.isActive ? '✅ Active' : '⏸️ Inactive'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formData.isActive ? 'Visible to users' : 'Hidden from users'}
                      </span>
                      <span className="text-xs text-gray-500 block mt-1">
                        💡 Only authorized admins can change visibility
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  🔢 Sort Order
                </label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all ${
                    errors.sortOrder ? 'border-red-500 bg-red-50' : 'border-gray-200'
                  }`}
                  min="0"
                  placeholder="0"
                />
                {errors.sortOrder ? (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <span>⚠️</span> {errors.sortOrder}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-2">💡 Lower numbers appear first</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-gray-200 pt-6 -mx-6 px-6 -mb-6 pb-6 bg-gray-50">
              <div className="flex flex-col sm:flex-row gap-3">
                {cause && onDelete && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Cause
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border-2 border-indigo-200 text-indigo-700 rounded-xl font-semibold transition-all duration-300 hover:border-indigo-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className={`flex-1 px-6 py-3 text-white rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                    isSubmitting || isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl hover:-translate-y-0.5'
                  }`}
                  style={{ background: isSubmitting || isUploading ? '#9ca3af' : 'linear-gradient(to right, #2563eb, #9333ea)' }}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : isUploading ? (
                    <>
                      ⏳ Uploading Image...
                    </>
                  ) : (
                    <>
                      {cause ? '✅ Update Cause' : '✨ Create Cause'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CauseFormModal;