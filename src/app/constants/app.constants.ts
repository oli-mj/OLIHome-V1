/**
 * Application-wide constants
 * Centralized location for magic strings and configuration values
 */

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
  PROFILE_IMAGE: 'profileImage',
  BIOMETRIC_ENABLED: 'biometricEnabled',
  PREFERENCES: 'preferences',
  LANGUAGE: 'language',
  THEME: 'theme',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile/update',
    PROFILE_IMAGE: '/user/profile-image',
  },
  POSTS: {
    LIST: '/posts',
    CREATE: '/posts',
    UPDATE: '/posts/:id',
    DELETE: '/posts/:id',
    LIKE: '/posts/:id/like',
  },
  TICKETS: {
    LIST: '/tickets',
    CREATE: '/tickets',
    UPDATE: '/tickets/:id',
    DELETE: '/tickets/:id',
    DETAIL: '/tickets/:id',
  },
  COMMENTS: {
    CREATE: '/comments',
    UPDATE: '/comments/:id',
    DELETE: '/comments/:id',
  },
} as const;

// Ticket statuses
export const TICKET_STATUS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
} as const;

// Toast messages
export const TOAST_MESSAGES = {
  SUCCESS: 'Operation completed successfully',
  ERROR: 'An error occurred. Please try again.',
  LOADING: 'Loading...',
  LOGIN_SUCCESS: 'Login successful',
  LOGIN_FAILED: 'Login failed. Please check your credentials.',
  LOGOUT_SUCCESS: 'Logged out successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  POST_CREATED: 'Post created successfully',
  POST_DELETED: 'Post deleted successfully',
  TICKET_CREATED: 'Ticket created successfully',
  TICKET_UPDATED: 'Ticket updated successfully',
} as const;

// Validation rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// Media types
export const MEDIA_TYPES = {
  IMAGE: 'image',
  VIDEO: 'video',
  DOCUMENT: 'document',
} as const;

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  VIDEO: 50 * 1024 * 1024, // 50MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
} as const;

// App configuration
export const APP_CONFIG = {
  PAGE_SIZE: 20,
  TOAST_DURATION: 3000,
  DEBOUNCE_TIME: 300,
  THROTTLE_TIME: 1000,
} as const;
