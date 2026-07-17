import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchUserProfile,
  fetchUserProfileById,
  fetchMyDebates,
  fetchCategoryAndRules,
  fetchTopics,
  fetchLeaderboard,
  fetchTopicComments,
  fetchTopicVotes,
  type Timeframe,
  type UserProfile,
} from '../services/api'

export const QUERY_KEYS = {
  userProfile: ['userProfile'] as const,
  userProfileById: (userId: number) => ['userProfileById', userId] as const,
  myDebates:   ['myDebates']   as const,
  categories:  ['categories']  as const,
  topics:      ['topics']      as const,
  leaderboard: (timeframe: Timeframe) => ['leaderboard', timeframe] as const,
  topicComments: (topicId: number) => ['topicComments', topicId] as const,
  topicVotes:    (topicId: number) => ['topicVotes', topicId] as const,
}

export const useUserProfile = () =>
  useQuery({
    queryKey: QUERY_KEYS.userProfile,
    queryFn:  fetchUserProfile,
    staleTime: 1000 * 60 * 30,         // 30 min — refresh after debate or manual pull
  })

// `initialData` lets callers who already have the profile (e.g. a leaderboard
// row) paint instantly while this still refetches in the background; callers
// with only a user id (e.g. a comment author) just get a normal fetch.
export const useUserProfileById = (userId: number, initialData?: UserProfile, enabled = true) =>
  useQuery({
    queryKey: QUERY_KEYS.userProfileById(userId),
    queryFn:  () => fetchUserProfileById(userId),
    initialData,
    enabled,
    staleTime: 1000 * 60 * 5,          // 5 min
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

export const useLeaderboard = (timeframe: Timeframe) =>
  useQuery({
    queryKey: QUERY_KEYS.leaderboard(timeframe),
    queryFn:  () => fetchLeaderboard(timeframe),
    staleTime: 1000 * 60 * 5,          // 5 min
  })

export const useTopicComments = (topicId: number) =>
  useQuery({
    queryKey: QUERY_KEYS.topicComments(topicId),
    queryFn:  () => fetchTopicComments(topicId),
    staleTime: 1000 * 30,              // 30s — comments come in during a live discussion
  })

export const useTopicVotes = (topicId: number) =>
  useQuery({
    queryKey: QUERY_KEYS.topicVotes(topicId),
    queryFn:  () => fetchTopicVotes(topicId),
    staleTime: 1000 * 30,
  })

export const useInvalidateAfterDebate = () => {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: QUERY_KEYS.userProfile })
    qc.invalidateQueries({ queryKey: QUERY_KEYS.myDebates })
  }
}
