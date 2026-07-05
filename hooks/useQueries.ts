import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchUserProfile,
  fetchMyDebates,
  fetchCategoryAndRules,
  fetchTopics,
} from '../services/api'

export const QUERY_KEYS = {
  userProfile: ['userProfile'] as const,
  myDebates:   ['myDebates']   as const,
  categories:  ['categories']  as const,
  topics:      ['topics']      as const,
}

export const useUserProfile = () =>
  useQuery({
    queryKey: QUERY_KEYS.userProfile,
    queryFn:  fetchUserProfile,
    staleTime: 1000 * 60 * 30,         // 30 min — refresh after debate or manual pull
  })

export const useMyDebates = () =>
  useQuery({
    queryKey: QUERY_KEYS.myDebates,
    queryFn:  fetchMyDebates,
    staleTime: 1000 * 60 * 10,         // 10 min — changes after each debate
  })

export const useCategories = () =>
  useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn:  fetchCategoryAndRules,
    staleTime: 1000 * 60 * 60 * 24,   // 24h — almost never changes
  })

export const useTopics = () =>
  useQuery({
    queryKey: QUERY_KEYS.topics,
    queryFn:  fetchTopics,
    staleTime: 1000 * 60 * 60 * 24,   // 24h
  })

export const useInvalidateAfterDebate = () => {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: QUERY_KEYS.userProfile })
    qc.invalidateQueries({ queryKey: QUERY_KEYS.myDebates })
  }
}
