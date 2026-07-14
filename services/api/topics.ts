import { api } from './client';
import { BASE_URL, rewriteDevHost } from './config';

export type TopicCategory = {
  id: number;
  name: string;
  description: string;
  background_image: string | null;
  icon?: string | null;
};

export type Topic = {
  id: number;
  title: string;
  description: string;
  category: TopicCategory;
  priority: number;
  background_image: string | null;
  icon?: string | null;
  pro_context: string | null;
  con_context: string | null;
  is_active: boolean;
  is_trending: boolean;
};

export type CategoryGroup = {
  description: string;
  background_image: string | null;
  icon?: string | null;
  topics: Topic[];
};

export type TopicsResponse = {
  status: number;
  message: string;
  data: {
    topics: Record<string, CategoryGroup>;
  };
};

export async function fetchTopics(): Promise<Record<string, CategoryGroup>> {
  const res = await api.get<TopicsResponse>('/debate/topics/');
  return res.data.topics;
}

export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return rewriteDevHost(path);
  return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}
