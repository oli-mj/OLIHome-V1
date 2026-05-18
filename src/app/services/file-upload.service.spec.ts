import { TestBed } from '@angular/core/testing';
import { FileUploadService } from './file-upload.service';
import { DomSanitizer } from '@angular/platform-browser';

describe('FileUploadService', () => {
  let service: FileUploadService;
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FileUploadService, DomSanitizer],
    });
    service = TestBed.inject(FileUploadService);
    sanitizer = TestBed.inject(DomSanitizer);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should validate PDF file', () => {
    const file = new File(['pdf content'], 'test.pdf', {
      type: 'application/pdf',
    });
    const validation = service.validateFile(file);
    expect(validation.valid).toBe(true);
  });

  it('should validate image file', () => {
    const file = new File(['image content'], 'test.jpg', {
      type: 'image/jpeg',
    });
    const validation = service.validateFile(file);
    expect(validation.valid).toBe(true);
  });

  it('should reject invalid file type', () => {
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const validation = service.validateFile(file);
    expect(validation.valid).toBe(false);
    expect(validation.error).toBeDefined();
  });

  it('should reject file exceeding size limit', () => {
    // Create a large file (over 10MB)
    const largeContent = new Uint8Array(11 * 1024 * 1024);
    const file = new File([largeContent], 'large.pdf', {
      type: 'application/pdf',
    });
    const validation = service.validateFile(file);
    expect(validation.valid).toBe(false);
    expect(validation.error).toContain('exceeds 10MB');
  });

  it('should format file size correctly', () => {
    expect(service.formatFileSize(0)).toBe('0 Bytes');
    expect(service.formatFileSize(1024)).toBe('1 KB');
    expect(service.formatFileSize(1024 * 1024)).toBe('1 MB');
  });

  it('should create file preview', async () => {
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const preview = await service.createFilePreview(file);

    expect(preview.file).toBe(file);
    expect(preview.fileName).toBe('test.txt');
    expect(preview.preview).toBeDefined();
  });

  it('should return correct allowed file types string', () => {
    const allowedTypes = service.getAllowedFileTypesString();
    expect(allowedTypes).toContain('.pdf');
    expect(allowedTypes).toContain('.jpg');
    expect(allowedTypes).toContain('image/*');
  });
});
