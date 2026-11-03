export interface UserProfile {
  id: string;
  nombre: string;
  email: string;
  avatar?: string;
  provider: 'local' | 'google';
  createdAt: string;
  accessToken?: string;
}
