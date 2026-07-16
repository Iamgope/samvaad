import React, { useEffect, useRef, useState } from 'react'
import {
  Animated,
  Image,
  Pressable,
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  type StyleProp,
  type TextStyle,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../App'
import { colors } from '../constants/colors'
import { fonts } from '../constants/fonts'
import { spacing, SCREEN_PADDING } from '../constants/spacing'
import { Text } from '../components/Text'
import { IconButton } from '../components/IconButton'
import { Button } from '../components/Button'
import { MoreMenuModal } from '../components/MoreMenuModal'
import { FlagIcon, EyeOffIcon, ShareIcon, ThumbUpIcon, ThumbDownIcon } from '../components/Icons'
import { DebateShareCard, shareDebateCard } from '../components/DebateShareCard'
import { DebateHeroCard } from '../components/DebateHeroCard'

type Props = NativeStackScreenProps<RootStackParamList, 'DebateDetail'>

const FOR_ACCENT = '#4ADE80'
const AGAINST_ACCENT = colors.red

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

  const [agreeCount, setAgreeCount] = useState(initialAgreeCount)
  const [disagreeCount, setDisagreeCount] = useState(initialDisagreeCount)
  const [userVote, setUserVote] = useState<'for' | 'against' | null>(null)

  const decided = agreeCount + disagreeCount
  const forPct = decided > 0 ? Math.round((agreeCount / decided) * 100) : 50
  const againstPct = 100 - forPct

  const handleVote = (side: 'for' | 'against') => {
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
  }

  const handleShare = () => shareDebateCard(shareCardRef, motion)

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
        <Text style={[s.stanceLabel, { color: accent }]}>{label}</Text>
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

})
