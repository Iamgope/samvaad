import { api } from './client';
import type { Topic } from './topics';
import type { Judgement } from '../../screens/DebateChat/types';

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
  return res.data.debates;
}

export async function fetchDebateJudgement(debateId: string): Promise<Judgement> {
  const res = await api.get<{ status: number; message: string; data: Judgement }>(`/debate/${debateId}/judgement/`);
  return res.data;
}
