// ===========================================
// User Types
// ===========================================

export interface Profile {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  theme: 'light' | 'dark' | 'system';
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  grid_layouts?: Record<string, unknown>;
  notifications_enabled: boolean;
}