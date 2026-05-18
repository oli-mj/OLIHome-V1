export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
  timestamp?: string;
}

export interface ApiSuccessResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  statusCode: number;
  message: string;
  data: {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: any; // Type should be imported from User model when available
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
  email?: string;
}
