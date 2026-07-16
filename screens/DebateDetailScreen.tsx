import React, { useEffect, useRef, useState } from 'react'
import {
  Animated,
  Image,
  Pressable,
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  type StyleProp,
  type TextStyle,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useQueryClient } from '@tanstack/react-query'
import type { RootStackParamList } from '../App'
import { colors } from '../constants/colors'
import { fonts } from '../constants/fonts'
import { spacing, SCREEN_PADDING } from '../constants/spacing'
import { Text } from '../components/Text'
import { IconButton } from '../components/IconButton'
import { Button } from '../components/Button'
import { MoreMenuModal } from '../components/MoreMenuModal'
import { ConfirmModal } from '../components/ConfirmModal'
import { FlagIcon, EyeOffIcon, ShareIcon, ShareNodesIcon, ThumbUpIcon, ThumbDownIcon, TrashIcon } from '../components/Icons'
import { DebateShareCard, shareDebateCard } from '../components/DebateShareCard'
import { CommentShareCard, shareCommentCard } from '../components/CommentShareCard'
import { DebateHeroCard } from '../components/DebateHeroCard'
import { QUERY_KEYS, useTopicComments, useTopicVotes, useUserProfile } from '../hooks/useQueries'
import { postTopicComment, castTopicVote, deleteTopicComment, type TopicComment, type TopicSide } from '../services/api'

type Props = NativeStackScreenProps<RootStackParamList, 'DebateDetail'>

const FOR_ACCENT = colors.lime
const AGAINST_ACCENT = colors.limeMuted

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`)

export default function DebateDetailScreen({ route, navigation }: Props) {
  const {
    categoryId,
    motion,
    context,
    categoryName,
    categoryAccent,
    agreeCount: initialAgreeCount,
    disagreeCount: initialDisagreeCount,
    whyDebate,
    proTitle,
    proBody,
    conTitle,
    conBody,
    imageUri,
  } = route.params

  const insets = useSafeAreaInsets()
  const [sheetOpen, setSheetOpen] = useState(false)
  const shareCardRef = useRef<View>(null)
  const queryClient = useQueryClient()
  const topicId = Number(route.params.debateId)

  const [agreeCount, setAgreeCount] = useState(initialAgreeCount)
  const [disagreeCount, setDisagreeCount] = useState(initialDisagreeCount)
  const [userVote, setUserVote] = useState<'for' | 'against' | null>(null)

  const { data: voteSummary } = useTopicVotes(topicId)
  useEffect(() => {
    if (!voteSummary) return
    setAgreeCount(voteSummary.pro_count)
    setDisagreeCount(voteSummary.con_count)
    setUserVote(voteSummary.my_vote === 'PRO' ? 'for' : voteSummary.my_vote === 'CON' ? 'against' : null)
  }, [voteSummary])

  const decided = agreeCount + disagreeCount
  const forPct = decided > 0 ? Math.round((agreeCount / decided) * 100) : 50
  const againstPct = 100 - forPct

  const handleVote = (side: 'for' | 'against') => {
    // Optimistic — mirrors the toggle behaviour the backend applies (voting
    // the side you're already on removes your vote).
    if (userVote === side) {
      setUserVote(null)
      if (side === 'for') setAgreeCount(c => Math.max(0, c - 1))
      else setDisagreeCount(c => Math.max(0, c - 1))
    } else {
      if (userVote === 'for') setAgreeCount(c => Math.max(0, c - 1))
      else if (userVote === 'against') setDisagreeCount(c => Math.max(0, c - 1))
      setUserVote(side)
      if (side === 'for') setAgreeCount(c => c + 1)
      else setDisagreeCount(c => c + 1)
    }

    const apiSide: TopicSide = side === 'for' ? 'PRO' : 'CON'
    castTopicVote(topicId, apiSide)
      .then(summary => {
        setAgreeCount(summary.pro_count)
        setDisagreeCount(summary.con_count)
        setUserVote(summary.my_vote === 'PRO' ? 'for' : summary.my_vote === 'CON' ? 'against' : null)
      })
      .catch(() => {
        // Optimistic update may now be wrong — resync with the server.
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.topicVotes(topicId) })
      })
  }

  const { data: myProfile } = useUserProfile()
  const { data: comments } = useTopicComments(topicId)
  const [commentText, setCommentText] = useState('')
  const [posting, setPosting] = useState(false)

  const handlePostComment = async () => {
    if (!commentText.trim() || !userVote || posting) return
    setPosting(true)
    try {
      await postTopicComment(
        topicId,
        commentText.trim(),
        userVote === 'for' ? 'PRO' : 'CON',
      )
      setCommentText('')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.topicComments(topicId) })
    } catch {
      // no toast wired on this screen yet — comment stays in the composer to retry
    } finally {
      setPosting(false)
    }
  }

  const handleShare = () => shareDebateCard(shareCardRef, motion)

  const [deleteTarget, setDeleteTarget] = useState<TopicComment | null>(null)
  const handleDeleteComment = async () => {
    if (!deleteTarget) return
    const id = deleteTarget.id
    setDeleteTarget(null)
    try {
      await deleteTopicComment(id)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.topicComments(topicId) })
    } catch {
      // no toast wired on this screen yet
    }
  }

  const commentShareCardRef = useRef<View>(null)
  const [shareComment, setShareComment] = useState<TopicComment | null>(null)
  useEffect(() => {
    if (!shareComment) return
    const id = setTimeout(() => {
      shareCommentCard(commentShareCardRef).then(() => setShareComment(null))
    }, 50)
    return () => clearTimeout(id)
  }, [shareComment])

  const handleAction = (key: string) => {
    setSheetOpen(false)
    // TODO: wire to real handlers
    console.log('debate action:', key)
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* ── Top bar ── */}
      <View style={s.topBar}>
        <IconButton
          icon={<Text style={s.iconGlyph}>←</Text>}
          accent={colors.text}
          onPress={() => navigation.goBack()}
        />
        <View style={s.topBarRight}>
          <IconButton
            icon={<ShareIcon size={16} color={colors.text} />}
            accent={colors.text}
            onPress={handleShare}
          />
          <IconButton
            icon={<Text style={s.iconGlyph}>⋯</Text>}
            accent={colors.text}
            onPress={() => setSheetOpen(true)}
          />
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.scrollContent, { paddingBottom: 120 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Full-bleed hero ── */}
        <DebateHeroCard
          motion={motion}
          categoryName={categoryName}
          categoryAccent={categoryAccent}
          image={imageUri ? { uri: imageUri } : undefined}
          height={HERO_HEIGHT}
          borderRadius={0}
          motionSize={24}
          style={s.hero}
        />

        {/* ── Stats card ── */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardEyebrow}>COMMUNITY VOTE</Text>
          </View>
          <View style={s.pctGroup}>
            <View style={s.pctSide}>
              {agreeCount > 0 && (
                <>
                  <AvatarStack />
                  <Text style={s.pctMore}>+ {fmt(agreeCount)}</Text>
                </>
              )}
            </View>
            <Text style={s.pctNum}>
              {forPct}<Text style={s.pctSign}>%</Text>
            </Text>
            <Text style={s.pctSep}>:</Text>
            <Text style={s.pctNum}>
              {againstPct}<Text style={s.pctSign}>%</Text>
            </Text>
            <View style={s.pctSide}>
              {disagreeCount > 0 && (
                <>
                  <Text style={s.pctMore}>+ {fmt(disagreeCount)}</Text>
                  <AvatarStack />
                </>
              )}
            </View>
          </View>
          {agreeCount === 0 && disagreeCount === 0 && (
            <Text style={s.noVotesHint}>Be the first to debate this topic</Text>
          )}
        </View>

        {/* ── Context card ── */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardEyebrow}>CONTEXT</Text>
          </View>
          <ExpandableText
            text={context ? `${context}\n\n${whyDebate ?? ''}` : (whyDebate ?? '')}
            style={s.cardBody}
            lines={6}
          />
        </View>

        {/* ── Stances card ── */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardEyebrow}>VIEWS</Text>
          </View>

          <StanceRow
            accent={FOR_ACCENT}
            label="FOR"
            body={proBody}
            image={require('../assets/forthemotion.png')}
          />

          <View style={s.cardDivider} />

          <StanceRow
            accent={AGAINST_ACCENT}
            label="AGAINST"
            body={conBody}
            image={require('../assets/againstthemotion.png')}
          />
        </View>

        {/* ── Comments card ── */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardEyebrow}>COMMENTS</Text>
          </View>

          {!userVote ? (
            <Text style={s.noVotesHint}>Vote FOR or AGAINST below to join the conversation.</Text>
          ) : (
            <View style={s.composerRow}>
              <View style={[s.composerSideTag, { backgroundColor: (userVote === 'for' ? FOR_ACCENT : AGAINST_ACCENT) + '3D' }]}>
                <Text style={s.composerSideTagLabel}>
                  {userVote === 'for' ? 'FOR' : 'AGAINST'}
                </Text>
              </View>
              <TextInput
                value={commentText}
                onChangeText={setCommentText}
                placeholder="Share your take…"
                placeholderTextColor={colors.textFaint}
                style={s.composerInput}
                multiline
                maxLength={400}
              />
              <TouchableOpacity
                onPress={handlePostComment}
                disabled={!commentText.trim() || posting}
                style={[s.postBtn, (!commentText.trim() || posting) && s.postBtnDisabled]}
                activeOpacity={0.8}
              >
                <Text style={s.postBtnLabel}>{posting ? '…' : 'Post'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {!comments || comments.length === 0 ? (
            <Text style={s.noVotesHint}>No comments yet, be the first to share your take.</Text>
          ) : (
            comments.map((c, i) => (
              <CommentRow
                key={c.id}
                comment={c}
                isLast={i === comments.length - 1}
                isMine={!!myProfile && c.user.id === myProfile.user.id}
                onDelete={() => setDeleteTarget(c)}
                onShare={() => setShareComment(c)}
                onPressUser={() => navigation.navigate('UserProfile', { userId: c.user.id })}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* ── Fixed bottom CTA ── */}
      <View style={[s.ctaBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <View style={s.voteSection}>
          <VoteIconButton
            voted={userVote === 'for'}
            onPress={() => handleVote('for')}
            label="For"
            renderIcon={(active) => (
              <ThumbUpIcon size={24} filled={active} color={active ? colors.text : colors.textSubtle} />
            )}
          />
          <VoteIconButton
            voted={userVote === 'against'}
            onPress={() => handleVote('against')}
            label="Against"
            renderIcon={(active) => (
              <ThumbDownIcon size={24} filled={active} color={active ? colors.text : colors.textSubtle} />
            )}
          />
        </View>
        <View style={s.ctaDivider} />
        <View style={s.startSection}>
          <Button
            label="Start Debate"
            variant="steel"
            size="md"
            onPress={() => navigation.navigate('JoinDebate', {
              topicId: Number(route.params.debateId),
              categoryId,
              categoryAccent,
              topicTitle: motion,
            })}
          />
        </View>
      </View>

      <MoreMenuModal
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        actions={[
          {
            key: 'report',
            label: 'Report this debate',
            description: 'Flag for misinformation, harassment, or rule violations',
            icon: <FlagIcon size={18} color={colors.textMuted} />,
            danger: true,
            onPress: () => handleAction('report'),
          },
          {
            key: 'hide',
            label: 'Hide from my feed',
            description: "Stop showing this debate. We'll surface less like it.",
            icon: <EyeOffIcon size={18} color={colors.textMuted} />,
            onPress: () => handleAction('hide'),
          },
        ]}
      />

      {/* Off-screen share card — captured by view-shot when sharing */}
      <View style={s.shareCapture} pointerEvents="none">
        <DebateShareCard
          ref={shareCardRef}
          motion={motion}
          categoryName={categoryName}
          categoryAccent={categoryAccent}
          forPct={forPct}
          againstPct={againstPct}
          image={imageUri ? { uri: imageUri } : undefined}
        />
      </View>

      {/* Off-screen comment share card — captured by view-shot when sharing a comment */}
      <View style={s.shareCapture} pointerEvents="none">
        <CommentShareCard
          ref={commentShareCardRef}
          motion={motion}
          username={shareComment?.user.username ?? ''}
          side={shareComment?.side ?? 'PRO'}
          comment={shareComment?.comment ?? ''}
          image={imageUri ? { uri: imageUri } : undefined}
        />
      </View>

      <ConfirmModal
        visible={!!deleteTarget}
        title="Delete comment?"
        message="This can't be undone."
        confirmLabel="Delete"
        cancelLabel="Keep"
        danger
        onConfirm={handleDeleteComment}
        onCancel={() => setDeleteTarget(null)}
      />
    </SafeAreaView>
  )
}

// ─── Vote icon button ─────────────────────────────────────────────

function VoteIconButton({
  voted,
  renderIcon,
  label,
  onPress,
}: {
  voted: boolean
  renderIcon: (active: boolean) => React.ReactNode
  label: string
  onPress: () => void
}) {
  const scale = useRef(new Animated.Value(1)).current
  const prevVotedRef = useRef(voted)

  useEffect(() => {
    const wasVoted = prevVotedRef.current
    prevVotedRef.current = voted

    if (voted && !wasVoted) {
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.22, useNativeDriver: true, tension: 600, friction: 5 }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 300, friction: 12 }),
      ]).start()
    }
  }, [voted]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      onPressIn={() =>
        Animated.spring(scale, { toValue: 0.88, useNativeDriver: true, tension: 600, friction: 20 }).start()
      }
      onPressOut={() => {
        if (!voted) {
          Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 400, friction: 15 }).start()
        }
      }}
    >
      <Animated.View style={[s.voteButton, voted && s.voteButtonActive, { transform: [{ scale }] }]}>
        {renderIcon(voted)}
        <Text style={[s.voteLabel, voted && s.voteLabelActive]}>{label}</Text>
      </Animated.View>
    </Pressable>
  )
}

// ─── Comment row ──────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  if (ms < 0 || Number.isNaN(ms)) return 'just now'
  const mins = Math.floor(ms / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d`
  return `${Math.floor(days / 7)}w`
}

function CommentRow({
  comment,
  isLast,
  isMine,
  onDelete,
  onShare,
  onPressUser,
}: {
  comment: TopicComment
  isLast: boolean
  isMine: boolean
  onDelete: () => void
  onShare: () => void
  onPressUser: () => void
}) {
  const accent = comment.side === 'PRO' ? FOR_ACCENT : AGAINST_ACCENT
  const initials = comment.user.username.slice(0, 2).toUpperCase()
  return (
    <View style={[s.commentRow, !isLast && s.commentRowDivider]}>
      <View style={s.commentHeader}>
        <TouchableOpacity onPress={onPressUser} activeOpacity={0.75} style={s.commentAuthorRow}>
          <View style={s.commentAvatar}>
            <Text style={s.commentAvatarLabel}>{initials}</Text>
          </View>
          <Text style={s.commentUsername}>@{comment.user.username}</Text>
        </TouchableOpacity>
        <View style={[s.commentSideTag, { backgroundColor: accent + '3D' }]}>
          <Text style={s.commentSideTagLabel}>
            {comment.side === 'PRO' ? 'FOR' : 'AGAINST'}
          </Text>
        </View>
        <Text style={s.commentTime}>{timeAgo(comment.created_at)}</Text>
      </View>
      <Text style={s.commentText}>{comment.comment}</Text>
      <View style={s.commentFooter}>
        <TouchableOpacity onPress={onShare} hitSlop={8} style={s.commentActionBtn}>
          <ShareNodesIcon size={13} color={colors.textFaint} />
        </TouchableOpacity>
        {isMine && (
          <TouchableOpacity onPress={onDelete} hitSlop={8} style={s.commentActionBtn}>
            <TrashIcon size={13} color={colors.textFaint} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

// ─── Expandable text ──────────────────────────────────────────────

function ExpandableText({
  text,
  style,
  lines = 3,
}: {
  text: string
  style?: StyleProp<TextStyle>
  lines?: number
}) {
  const [expanded, setExpanded] = useState(false)
  const [needsToggle, setNeedsToggle] = useState<boolean | null>(null)

  const isMeasuring = needsToggle === null
  const numberOfLines = isMeasuring || expanded ? undefined : lines

  return (
    <View>
      <Text
        style={[style, isMeasuring && { opacity: 0 }]}
        numberOfLines={numberOfLines}
        onTextLayout={(e) => {
          if (isMeasuring) {
            setNeedsToggle(e.nativeEvent.lines.length > lines)
          }
        }}
      >
        {text}
      </Text>
      {needsToggle ? (
        <TouchableOpacity onPress={() => setExpanded(v => !v)} activeOpacity={0.6}>
          <Text style={s.expandToggle}>{expanded ? 'Show less' : 'Read more'}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  )
}

// ─── Avatar stack ─────────────────────────────────────────────────

function AvatarStack() {
  const shades = [colors.textMuted, colors.textSubtle, colors.textFaint]
  return (
    <View style={s.stack}>
      {shades.map((c, i) => (
        <View
          key={i}
          style={[s.avatar, { backgroundColor: c, marginLeft: i === 0 ? 0 : -7 }]}
        />
      ))}
    </View>
  )
}

// ─── Square tile ───────────────────────────────────────────────────

function SquareTile({
  accent,
  image,
  size,
}: {
  accent: string
  image: any
  size: number
}) {
  return (
    <View
      style={[
        s.tileOuter,
        {
          width: size,
          height: size,
          borderColor: accent + '55',
          borderBottomColor: accent + 'AA',
        },
      ]}
    >
      <View style={[s.tileInner, { backgroundColor: accent + '22' }]}>
        <Image source={image} style={s.tileImg} resizeMode="contain" />
      </View>
    </View>
  )
}

// ─── Stance row ────────────────────────────────────────────────────

function StanceRow({
  accent,
  label,
  body,
  image,
}: {
  accent: string
  label: string
  body?: string
  image: any
}) {
  return (
    <View style={s.stanceRow}>
      <View style={s.stanceImageCol}>
        <SquareTile accent={accent} image={image} size={76} />
        <Text style={s.stanceLabel}>{label}</Text>
      </View>
      <View style={s.stanceBody}>
        {body ? (
          <ExpandableText text={body} style={s.stanceText} lines={4} />
        ) : (
          <Text style={s.stanceText}>No context provided yet.</Text>
        )}
      </View>
    </View>
  )
}

// ─── Styles ────────────────────────────────────────────────────────

const HERO_HEIGHT = 320

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.black },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SCREEN_PADDING },

  // ── Top bar ──
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  shareCapture: {
    position: 'absolute',
    left: -9999,
    top: 0,
  },
  iconGlyph: {
    fontFamily: fonts.jakarta.bold,
    fontSize: 18,
    color: colors.text,
    lineHeight: 20,
  },

  // ── Hero ── full-bleed: cancel the screen padding and add bottom spacing
  hero: {
    marginHorizontal: -SCREEN_PADDING,
    marginBottom: spacing.lg,
  },

  // ── Split card ──
  pctGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  pctSide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  pctNum: {
    fontFamily: fonts.display.black,
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: -0.8,
    color: colors.text,
  },
  pctSign: {
    fontFamily: fonts.display.bold,
    fontSize: 16,
    letterSpacing: -0.2,
    color: colors.textMuted,
  },
  pctMore: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.2,
  },
  noVotesHint: {
    fontFamily: fonts.jakarta.medium,
    fontSize: 12,
    color: colors.textFaint,
    textAlign: 'center',
    marginTop: spacing.sm,
    letterSpacing: 0.1,
  },
  pctSep: {
    fontFamily: fonts.jakarta.bold,
    fontSize: 30,
    lineHeight: 44,
    color: colors.textMuted,
  },
  stack: {
    flexDirection: 'row',
  },
  avatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },

  // ── Cards (Context / Stances) ──
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  cardEyebrow: {
    fontFamily: fonts.jakarta.extraBold,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 1.4,
  },
  cardBody: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 15.5,
    lineHeight: 24,
    color: colors.text,
    letterSpacing: -0.1,
    opacity: 0.85,
  },
  expandToggle: {
    fontFamily: fonts.jakarta.bold,
    fontSize: 12,
    color: colors.text,
    marginTop: spacing.sm,
    letterSpacing: 0.1,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },

  // ── Tile (reusable) ──
  tileOuter: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderBottomWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 0,
    elevation: 5,
  },
  tileInner: {
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tileImg: {
    width: '95%',
    height: '95%',
  },

  // ── Stance row ──
  stanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  stanceImageCol: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  stanceBody: {
    flex: 1,
    gap: spacing.xs,
  },
  stanceLabel: {
    fontFamily: fonts.jakarta.extraBold,
    fontSize: 10,
    letterSpacing: 1.6,
    textAlign: 'center',
    color: colors.text,
  },
  stanceTitle: {
    fontFamily: fonts.display.bold,
    fontSize: 15,
    color: colors.text,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  stanceText: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 14.5,
    lineHeight: 23,
    color: colors.textMuted,
    letterSpacing: -0.1,
    marginTop: spacing.xs,
  },

  // ── Fixed CTA ──
  ctaBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: spacing.md,
    backgroundColor: colors.black,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  voteSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  voteButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    width: 52,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
  voteButtonActive: {
    backgroundColor: colors.surface2,
    borderColor: colors.borderStrong,
  },
  voteLabel: {
    fontFamily: fonts.jakarta.bold,
    fontSize: 9,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.textSubtle,
  },
  voteLabelActive: {
    color: colors.text,
  },
  ctaDivider: {
    width: StyleSheet.hairlineWidth,
    height: 36,
    backgroundColor: colors.border,
  },
  startSection: {
    flex: 1,
  },

  // ── Comments ──
  composerSideTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 8,
  },
  composerSideTagLabel: {
    fontFamily: fonts.jakarta.bold,
    fontSize: 11,
    letterSpacing: 0.8,
    color: colors.text,
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  composerInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    fontFamily: fonts.jakarta.regular,
    fontSize: 14,
    color: colors.text,
  },
  postBtn: {
    height: 40,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.text,
  },
  postBtnDisabled: {
    backgroundColor: colors.surface2,
  },
  postBtnLabel: {
    fontFamily: fonts.jakarta.bold,
    fontSize: 13,
    color: colors.black,
  },
  commentRow: {
    paddingVertical: spacing.sm,
    gap: 4,
  },
  commentRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  commentAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  commentAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarLabel: {
    fontFamily: fonts.display.bold,
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 0.2,
  },
  commentUsername: {
    fontFamily: fonts.jakarta.bold,
    fontSize: 13,
    color: colors.text,
  },
  commentSideTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  commentSideTagLabel: {
    fontFamily: fonts.jakarta.bold,
    fontSize: 9,
    letterSpacing: 0.6,
    color: colors.text,
  },
  commentTime: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 11,
    color: colors.textFaint,
    marginLeft: 'auto',
  },
  commentFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: 6,
  },
  commentActionBtn: {
    padding: 2,
  },
  commentText: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
})
