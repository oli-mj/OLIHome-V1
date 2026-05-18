import { Injectable } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

export interface FilePreview {
  file: File;
  preview: SafeUrl | string; // Data URL for preview
  fileName: string;
  fileSize: string;
  fileType: string;
}

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  private maxFileSize = 10 * 1024 * 1024; // 10MB
  private allowedFileTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
  private allowedExtensions = ['.png', '.jpg', '.jpeg', '.pdf'];

  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Validate file before upload
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > this.maxFileSize) {
      return {
        valid: false,
        error: `File size exceeds 10MB limit. Current: ${this.formatFileSize(file.size)}`,
      };
    }

    // Check file type
    if (!this.allowedFileTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type not allowed. Accepted: Images (PNG, JPG) and PDF`,
      };
    }

    return { valid: true };
  }

  /**
   * Create preview for file
   */
  async createFilePreview(file: File): Promise<FilePreview> {
    const preview = await this.readFileAsDataURL(file);

    return {
      file,
      preview,
      fileName: file.name,
      fileSize: this.formatFileSize(file.size),
      fileType: this.getFileTypeName(file.type),
    };
  }

  /**
   * Read file as Data URL for preview
   */
  private readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Format file size to human-readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Get user-friendly file type name
   */
  private getFileTypeName(mimeType: string): string {
    if (mimeType.startsWith('image/')) {
      return 'Image';
    } else if (mimeType === 'application/pdf') {
      return 'PDF Document';
    }
    return 'File';
  }

  /**
   * Upload file to server (will be called with FormData)
   */
  async uploadFile(file: File): Promise<string> {
    // Validate file first
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error || 'File validation failed');
    }

    // Return file as base64 or URL (actual upload handled by API service)
    // For now, just return a promise that resolves with the filename
    return new Promise((resolve) => {
      resolve(file.name);
    });
  }

  /**
   * Get allowed file types as string for input accept attribute
   */
  getAllowedFileTypesString(): string {
    return '.png,.jpg,.jpeg,.pdf,image/*,application/pdf';
  }
}
