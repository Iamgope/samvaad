import React, { useRef, useState } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  type StyleProp,
  type TextStyle,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../App'
import { colors } from '../constants/colors'
import { fonts } from '../constants/fonts'
import { spacing, SCREEN_PADDING } from '../constants/spacing'
import { Text } from '../components/Text'
import { IconButton } from '../components/IconButton'
import { Button } from '../components/Button'
import { MoreMenuModal } from '../components/MoreMenuModal'
import { FlagIcon, EyeOffIcon, ShareIcon } from '../components/Icons'
import { DebateShareCard, shareDebateCard } from '../components/DebateShareCard'

type Props = NativeStackScreenProps<RootStackParamList, 'DebateDetail'>

const FOR_ACCENT = '#4ADE80'
const AGAINST_ACCENT = colors.red

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`)

export default function DebateDetailScreen({ route, navigation }: Props) {
  const {
    motion,
    context,
    categoryName,
    categoryAccent,
    agreeCount,
    disagreeCount,
    whyDebate,
    proTitle,
    proBody,
    conTitle,
    conBody,
  } = route.params

  const insets = useSafeAreaInsets()
  const [sheetOpen, setSheetOpen] = useState(false)
  const shareCardRef = useRef<View>(null)

  const decided = agreeCount + disagreeCount
  const forPct = decided > 0 ? Math.round((agreeCount / decided) * 100) : 50
  const againstPct = 100 - forPct

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
        {/* ── Full-bleed hero (placeholder — artwork TBD) ── */}
        <View style={[s.hero, { backgroundColor: categoryAccent + '22' }]}>
          <View style={s.heroPlaceholder}>
            <Text style={s.heroPlaceholderText}>Hero artwork placeholder</Text>
          </View>
          <LinearGradient
            colors={['transparent', 'rgba(12,15,22,0.6)', 'rgba(12,15,22,0.98)']}
            locations={[0, 0.5, 1]}
            style={s.heroScrim}
            pointerEvents="none"
          />

          <View
            style={[
              s.heroTag,
              {
                backgroundColor: categoryAccent + '33',
                borderColor: categoryAccent + '50',
                borderBottomColor: categoryAccent,
              },
            ]}
          >
            <Text style={[s.heroTagText, { color: categoryAccent }]}>{categoryName}</Text>
          </View>

          <View style={s.heroFooter}>
            <Text style={s.heroMotion}>{motion}</Text>
          </View>
        </View>

        {/* ── Split card ── */}
        <View style={s.card}>
          <View style={s.pctGroup}>
            <View style={s.pctSide}>
              <AvatarStack />
              <Text style={s.pctMore}>+ {fmt(agreeCount)}</Text>
            </View>
            <Text style={s.pctNum}>
              {forPct}<Text style={s.pctSign}>%</Text>
            </Text>
            <Text style={s.pctSep}>:</Text>
            <Text style={s.pctNum}>
              {againstPct}<Text style={s.pctSign}>%</Text>
            </Text>
            <View style={s.pctSide}>
              <Text style={s.pctMore}>+ {fmt(disagreeCount)}</Text>
              <AvatarStack />
            </View>
          </View>
        </View>

        {/* ── Context card ── */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardEyebrow}>CONTEXT</Text>
          </View>
          <ExpandableText
            text={context ? `${context}\n\n${whyDebate}` : whyDebate}
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
            title={proTitle}
            body={proBody}
            image={require('../assets/forthemotion.png')}
          />

          <View style={s.cardDivider} />

          <StanceRow
            accent={AGAINST_ACCENT}
            label="AGAINST"
            title={conTitle}
            body={conBody}
            image={require('../assets/againstthemotion.png')}
          />
        </View>
      </ScrollView>

      {/* ── Fixed bottom CTA ── */}
      <View style={[s.ctaBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <Button
          label="Start Debate"
          variant="steel"
          size="md"
          onPress={() => navigation.navigate('JoinDebate', {})}
        />
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
        />
      </View>
    </SafeAreaView>
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
  title,
  body,
  image,
}: {
  accent: string
  label: string
  title: string
  body: string
  image: any
}) {
  return (
    <View style={s.stanceRow}>
      <SquareTile accent={accent} image={image} size={76} />
      <View style={s.stanceBody}>
        <Text style={[s.stanceLabel, { color: accent }]}>{label}</Text>
        <Text style={s.stanceTitle}>{title}</Text>
        <ExpandableText text={body} style={s.stanceText} lines={3} />
      </View>
    </View>
  )
}

// ─── Styles ────────────────────────────────────────────────────────

const HERO_HEIGHT = 320

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.black },
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

  // ── Hero ──
  hero: {
    height: HERO_HEIGHT,
    marginHorizontal: -SCREEN_PADDING,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  heroScrim: {
    ...StyleSheet.absoluteFillObject,
    top: '35%',
  },
  heroPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPlaceholderText: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 12,
    color: colors.textSubtle,
    letterSpacing: 0.4,
  },
  heroTag: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderBottomWidth: 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  heroTagText: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 12,
    letterSpacing: 0.1,
  },
  heroFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: spacing.lg,
  },
  heroMotion: {
    fontFamily: fonts.display.black,
    fontSize: 24,
    lineHeight: 30,
    color: colors.text,
    letterSpacing: -0.6,
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
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
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
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  stanceBody: {
    flex: 1,
    gap: spacing.xs,
  },
  stanceLabel: {
    fontFamily: fonts.jakarta.extraBold,
    fontSize: 10,
    letterSpacing: 1.6,
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
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
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
  },

})
