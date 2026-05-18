import { Injectable } from '@angular/core';
import { FILE_SIZE_LIMITS, MEDIA_TYPES } from '../../constants/app.constants';

@Injectable()
export class MediaService {
  /**
   * Read file as Base64 data URL
   */
  async readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Read file as Base64 string (without data URL prefix)
   */
  async readFileAsBase64(file: File): Promise<string> {
    const dataUrl = await this.readFileAsDataUrl(file);
    return dataUrl.split(',')[1];
  }

  /**
   * Validate file size
   */
  validateFileSize(file: File, type: 'image' | 'video' | 'document' = 'document'): boolean {
    const fileTypeKey = (type.toUpperCase() as 'IMAGE' | 'VIDEO' | 'DOCUMENT');
    const limit = FILE_SIZE_LIMITS[fileTypeKey];
    return file.size <= limit;
  }

  /**
   * Validate file type
   */
  validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  }

  /**
   * Get file size in MB
   */
  getFileSizeInMB(file: File): number {
    return file.size / (1024 * 1024);
  }

  /**
   * Get file size formatted as string
   */
  getFileSizeFormatted(file: File): string {
    const sizeInMB = this.getFileSizeInMB(file);
    if (sizeInMB > 1) {
      return `${sizeInMB.toFixed(2)} MB`;
    }
    return `${(file.size / 1024).toFixed(2)} KB`;
  }

  /**
   * Detect media type from file
   */
  detectMediaType(file: File): 'image' | 'video' | 'document' {
    if (file.type.startsWith('image/')) {
      return MEDIA_TYPES.IMAGE;
    }
    if (file.type.startsWith('video/')) {
      return MEDIA_TYPES.VIDEO;
    }
    return MEDIA_TYPES.DOCUMENT;
  }

  /**
   * Create thumbnail from image file
   */
  async createImageThumbnail(file: File, maxWidth: number = 200): Promise<Blob> {
    const dataUrl = await this.readFileAsDataUrl(file);
    const img = new Image();
    img.src = dataUrl;

    return new Promise((resolve, reject) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        const ratio = img.width / img.height;
        canvas.width = maxWidth;
        canvas.height = maxWidth / ratio;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Could not create thumbnail'));
          }
        }, 'image/jpeg', 0.9);
      };
      img.onerror = () => reject(new Error('Could not load image'));
    });
  }
}
