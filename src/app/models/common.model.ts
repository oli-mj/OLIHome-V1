export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: Date;
  actionUrl?: string;
  icon?: string;
  color?: string;
  time?: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
  email?: string;
}

export interface TopicMap {
  [key: string]: string;
}
