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
  xp: number;
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

// Read-only — no edit/logout affordance exists for another user's profile.
export async function fetchUserProfileById(userId: number): Promise<UserProfile> {
  const res = await api.get<ApiResponse>(`/users/getProfile/${userId}/`);
  return res.data.user;
}

export type Timeframe = 'weekly' | 'all_time';

export type LeaderboardEntry = UserProfile & { rank: number };

type LeaderboardResponse = {
  message?: string;
  data: { players: LeaderboardEntry[] };
};

export async function fetchLeaderboard(timeframe: Timeframe): Promise<LeaderboardEntry[]> {
  const res = await api.get<LeaderboardResponse>(`/users/leaderboard/?timeframe=${timeframe}`);
  return res.data.players;
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

export type TopicSide = 'PRO' | 'CON';

export type TopicComment = {
  id: number;
  topic: number;
  user: UserAccount;
  comment: string;
  side: TopicSide;
  created_at: string;
};

type TopicCommentsResponse = {
  message?: string;
  data: { comments: TopicComment[] };
};

export async function fetchTopicComments(topicId: number): Promise<TopicComment[]> {
  const res = await api.get<TopicCommentsResponse>(`/users/topics/comments/?topic_id=${topicId}`);
  return res.data.comments;
}

type TopicCommentResponse = {
  message?: string;
  data: { comment: TopicComment };
};

export async function postTopicComment(
  topicId: number,
  comment: string,
  side: TopicSide,
): Promise<TopicComment> {
  const res = await api.post<TopicCommentResponse>('/users/topics/comments/', {
    topic: topicId,
    comment,
    side,
  });
  return res.data.comment;
}

export async function deleteTopicComment(commentId: number): Promise<void> {
  await api.delete(`/users/topics/comments/${commentId}/`);
}

export type TopicVoteSummary = {
  pro_count: number;
  con_count: number;
  my_vote: TopicSide | null;
};

type TopicVoteResponse = {
  message?: string;
  data: TopicVoteSummary;
};

export async function fetchTopicVotes(topicId: number): Promise<TopicVoteSummary> {
  const res = await api.get<TopicVoteResponse>(`/users/topics/votes/?topic_id=${topicId}`);
  return res.data;
}

export async function castTopicVote(topicId: number, side: TopicSide): Promise<TopicVoteSummary> {
  const res = await api.post<TopicVoteResponse>('/users/topics/votes/', { topic: topicId, side });
  return res.data;
}
