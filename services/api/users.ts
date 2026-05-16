import { api } from './client';

export type UserAccount = {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
};

export type UserProfile = {
  user: UserAccount;
  elo_rating: number;
  total_debates: number;
  wins: number;
  losses: number;
  streak: number;
  bio: string | null;
};

type ApiResponse = {
  message?: string;
  data: { user: UserProfile };
};

export async function fetchUserProfile(): Promise<UserProfile> {
  const res = await api.get<ApiResponse>('/users/getProfile/');
  return res.data.user;
}

export type UpdateProfilePayload = {
  name: string;
  username: string;
  bio: string | null;
};

export async function updateUserProfile(payload: UpdateProfilePayload): Promise<void> {
  await api.post('/users/getProfile/', payload);
}
