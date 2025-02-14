export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed';
  deadline: string;
  created_at: string;
  user_id: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed';
  deadline: string;
  created_at: string;
  user_id: string;
}

export interface DiaryEntry {
  id: string;
  content: string;
  mood?: string;
  created_at: string;
  user_id: string;
}

export type User = {
  id: string;
  email: string;
  created_at: string;
};

export type AuthSession = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: User;
};

export type AuthError = {
  message: string;
};

export type AuthState = {
  session: AuthSession | null;
  loading: boolean;
  error: AuthError | null;
};