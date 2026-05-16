import { api } from './client';
import type { Topic } from './topics';

export type DebateUserRef = {
  id: number;
  username: string;
};

export type DebateStatus = 'COMPLETED' | 'ONGOING';

export type DebateSummary = {
  id: number;
  topic: Topic;
  user_pro: DebateUserRef;
  user_con: DebateUserRef;
  winner: DebateUserRef | null;
  status: DebateStatus;
  started_at: string;
  completed_at: string | null;
};

type ApiResponse = {
  status?: number;
  message?: string;
  data: { debates: DebateSummary[] };
};

export async function fetchMyDebates(): Promise<DebateSummary[]> {
  const res = await api.get<ApiResponse>('/debate/getMyDebates/');
  console.log(res.data)
  return res.data.debates;
}
