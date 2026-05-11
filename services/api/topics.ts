import { api } from './client';
import { BASE_URL } from './config';

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
  background_image: string | null;
  icon?: string | null;
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
  if (/^https?:\/\//.test(path)) return path;
  return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}
