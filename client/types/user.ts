export interface IUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
  created_at: string;
  token: string;
}
