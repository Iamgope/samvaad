import { api } from './client';

export type DebateCategory = {
  id: number;
  name: string;
  description?: string;
  background_image?: string | null;
  icon?: string | null;
};

export type CategoryAndRules = {
  categories: DebateCategory[];
  rules: string[];
};

type ApiResponse = {
  message: string;
  data: CategoryAndRules;
};

export async function fetchCategoryAndRules(): Promise<CategoryAndRules> {
  const res = await api.get<ApiResponse>('/debate/getCategoryAndRules/');
  return res.data;
}
