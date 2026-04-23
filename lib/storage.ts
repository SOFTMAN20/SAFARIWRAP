/**
 * Supabase Storage Management
 * Handles file uploads, deletions, and URL generation for SafariWrap assets
 */

import { createClient } from '@/lib/supabase/client';

// Storage bucket name
export const STORAGE_BUCKET = 'safariwrap-assets';

// Folder structure
export const STORAGE_FOLDERS = {
  REVIEWS: 'reviews',
  LOGOS: 'logos',
  WRAPS: 'wraps',
  TEMP: 'temp',
} as const;

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  PHOTO: 10 * 1024 * 1024, // 10MB
  LOGO: 5 * 1024 * 1024,   // 5MB
  WRAP: 15 * 1024 * 1024,  // 15MB
} as const;

// Allowed MIME types
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

/**
 * Upload a guest review photo
 */
export async function uploadReviewPhoto(
  eventId: string,
  file: File,
  index: number
): Promise<{ url: string; path: string } | { error: string }> {
  try {
    // Validate file
    const validation = validateImageFile(file, FILE_SIZE_LIMITS.PHOTO);
    if (!validation.valid) {
      return { error: validation.error! };
    }

    const supabase = createClient();
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    const fileName = `${eventId}_${timestamp}_${index}.${extension}`;
    const filePath = `${STORAGE_FOLDERS.REVIEWS}/${fileName}`;

    // Upload file
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return { error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      path: filePath,
    };
  } catch (error: any) {
    console.error('Upload exception:', error);
    return { error: error.message || 'Upload failed' };
  }
}

/**
 * Upload operator logo
 */
export async function uploadOperatorLogo(
  operatorId: string,
  file: File
): Promise<{ url: string; path: string } | { error: string }> {
  try {
    // Validate file
    const validation = validateImageFile(file, FILE_SIZE_LIMITS.LOGO);
    if (!validation.valid) {
      return { error: validation.error! };
    }

    const supabase = createClient();
    const extension = file.name.split('.').pop() || 'png';
    const fileName = `${operatorId}.${extension}`;
    const filePath = `${STORAGE_FOLDERS.LOGOS}/${fileName}`;

    // Delete old logo if exists
    await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    // Upload new logo
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error('Logo upload error:', error);
      return { error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      path: filePath,
    };
  } catch (error: any) {
    console.error('Logo upload exception:', error);
    return { error: error.message || 'Logo upload failed' };
  }
}

/**
 * Upload generated wrap image
 */
export async function uploadWrapImage(
  wrapId: string,
  blob: Blob
): Promise<{ url: string; path: string } | { error: string }> {
  try {
    const supabase = createClient();
    const fileName = `${wrapId}.png`;
    const filePath = `${STORAGE_FOLDERS.WRAPS}/${fileName}`;

    // Upload wrap image
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, blob, {
        cacheControl: '3600',
        contentType: 'image/png',
        upsert: true,
      });

    if (error) {
      console.error('Wrap upload error:', error);
      return { error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      path: filePath,
    };
  } catch (error: any) {
    console.error('Wrap upload exception:', error);
    return { error: error.message || 'Wrap upload failed' };
  }
}

/**
 * Delete a file from storage
 */
export async function deleteFile(filePath: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Delete exception:', error);
    return { success: false, error: error.message || 'Delete failed' };
  }
}

/**
 * Delete multiple files from storage
 */
export async function deleteFiles(filePaths: string[]): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove(filePaths);

    if (error) {
      console.error('Bulk delete error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Bulk delete exception:', error);
    return { success: false, error: error.message || 'Bulk delete failed' };
  }
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(filePath: string): string {
  const supabase = createClient();
  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
}

/**
 * Get transformed image URL (resized, optimized)
 */
export function getTransformedImageUrl(
  filePath: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'origin' | 'webp';
  } = {}
): string {
  const supabase = createClient();
  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath, {
      transform: {
        width: options.width,
        height: options.height,
        quality: options.quality || 80,
        format: options.format,
      },
    });
  
  return data.publicUrl;
}

/**
 * Validate image file
 */
export function validateImageFile(
  file: File,
  maxSize: number = FILE_SIZE_LIMITS.PHOTO
): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / 1024 / 1024).toFixed(1);
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  // Check MIME type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed',
    };
  }

  return { valid: true };
}

/**
 * Compress image before upload (client-side)
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Compression failed'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Image load failed'));
    };

    reader.onerror = () => reject(new Error('File read failed'));
  });
}

/**
 * Get storage statistics
 */
export async function getStorageStats(): Promise<{
  totalFiles: number;
  totalSizeMB: number;
  byFolder: Record<string, { count: number; sizeMB: number }>;
} | null> {
  try {
    const supabase = createClient();
    
    const { data: files, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list('', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error || !files) {
      console.error('Storage stats error:', error);
      return null;
    }

    const stats = {
      totalFiles: 0,
      totalSizeMB: 0,
      byFolder: {} as Record<string, { count: number; sizeMB: number }>,
    };

    // Initialize folders
    Object.values(STORAGE_FOLDERS).forEach(folder => {
      stats.byFolder[folder] = { count: 0, sizeMB: 0 };
    });

    // Calculate stats
    files.forEach(file => {
      const folder = file.name.split('/')[0];
      const sizeMB = (file.metadata?.size || 0) / 1024 / 1024;

      stats.totalFiles++;
      stats.totalSizeMB += sizeMB;

      if (stats.byFolder[folder]) {
        stats.byFolder[folder].count++;
        stats.byFolder[folder].sizeMB += sizeMB;
      }
    });

    // Round sizes
    stats.totalSizeMB = Math.round(stats.totalSizeMB * 100) / 100;
    Object.keys(stats.byFolder).forEach(folder => {
      stats.byFolder[folder].sizeMB = Math.round(stats.byFolder[folder].sizeMB * 100) / 100;
    });

    return stats;
  } catch (error) {
    console.error('Storage stats exception:', error);
    return null;
  }
}
