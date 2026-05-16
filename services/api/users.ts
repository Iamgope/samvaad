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
  profile_pic: string | null;
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
  profilePicUri?: string | null;
};

function mimeFromUri(uri: string): string {
  const ext = uri.split('?')[0].split('.').pop()?.toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'heic') return 'image/heic';
  return 'image/jpeg';
}

export async function updateUserProfile(payload: UpdateProfilePayload): Promise<void> {
  const form = new FormData();
  form.append('name', payload.name);
  form.append('username', payload.username);
  form.append('bio', payload.bio ?? '');
  if (payload.profilePicUri && !/^https?:\/\//.test(payload.profilePicUri)) {
    const uri = payload.profilePicUri;
    const name = uri.split('/').pop() ?? 'avatar.jpg';
    form.append('profile_pic', { uri, name, type: mimeFromUri(uri) } as unknown as Blob);
  }
  await api.post('/users/getProfile/', form);
}
