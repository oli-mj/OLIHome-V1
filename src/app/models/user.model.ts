export interface User {
  id?: string;
  name: string;
  email: string;
  tenantId?: string;
  role?: 'tenant' | 'admin' | 'management'; // Added role field
}
