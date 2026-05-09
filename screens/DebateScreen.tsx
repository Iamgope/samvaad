import React, { useState } from 'react'
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../constants/colors'
import { fonts } from '../constants/fonts'
import { spacing, SCREEN_PADDING } from '../constants/spacing'
import { Text } from '../components/Text'

// ─── TYPES ────────────────────────────────────────────────────────

type Stance = 'for' | 'against' | 'unsure' | null

type Argument = {
  id: string
  author: string
  avatarColor: string
  stance: 'for' | 'against'
  text: string
  upvotes: number
  replies: number
}

// ─── DATA ─────────────────────────────────────────────────────────

const CATEGORY_META: Record<string, { name: string; accent: string; emoji: string }> = {
  politics:   { name: 'Politics',   accent: '#FF6B35', emoji: '🏛️' },
  sports:     { name: 'Sports',     accent: '#38BDF8', emoji: '🏆' },
  lit:        { name: 'Culture',    accent: '#8B5CF6', emoji: '🎨' },
  philosophy: { name: 'Philosophy', accent: '#10B981', emoji: '🧠' },
}

const MOCK_ARGUMENTS: Argument[] = [
  {
    id: 'a1',
    author: 'Arjun V.',
    avatarColor: colors.streak,
    stance: 'for',
    text: 'Separation of religion from law ensures equal treatment for all citizens regardless of faith. Personal law systems create systemic inequalities that disproportionately affect women and minorities.',
    upvotes: 142,
    replies: 28,
  },
  {
    id: 'a2',
    author: 'Priya K.',
    avatarColor: '#8B5CF6',
    stance: 'against',
    text: 'Religion-based personal laws are integral to cultural identity. Removing them imposes a homogenised legal framework that disrespects centuries of diverse tradition.',
    upvotes: 98,
    replies: 34,
  },
  {
    id: 'a3',
    author: 'Rohan M.',
    avatarColor: '#38BDF8',
    stance: 'for',
    text: 'A uniform civil code would simplify the legal system and eliminate ambiguity that is often exploited at the expense of marginalised communities.',
    upvotes: 77,
    replies: 19,
  },
  {
    id: 'a4',
    author: 'Fatima A.',
    avatarColor: '#34D399',
    stance: 'against',
    text: 'Faith communities have practised their customs for centuries. State intervention in personal law without genuine community consent is authoritarian overreach.',
    upvotes: 61,
    replies: 22,
  },
]

// ─── HELPERS ──────────────────────────────────────────────────────

const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`

// ─── ARGUMENT CARD ────────────────────────────────────────────────

function ArgumentCard({ arg, accent }: { arg: Argument; accent: string }) {
  const isFor = arg.stance === 'for'
  const stanceColor = isFor ? colors.lime : accent

  return (
    <View style={[s.argCard, { borderColor: stanceColor + '44' }]}>
      <View style={s.argHeader}>
        <View style={s.argAuthorRow}>
          <View style={[s.argAvatar, { backgroundColor: arg.avatarColor }]} />
          <Text style={s.argAuthor}>{arg.author}</Text>
        </View>
        <View style={[s.argStancePill, { backgroundColor: stanceColor + '22', borderColor: stanceColor + '55' }]}>
          <Text style={[s.argStanceText, { color: stanceColor }]}>
            {isFor ? 'FOR' : 'AGAINST'}
          </Text>
        </View>
      </View>

      <Text style={s.argText}>{arg.text}</Text>

      <View style={s.argFooter}>
        <Text style={s.argMeta}>↑ {arg.upvotes}</Text>
        <Text style={s.argMeta}>💬 {arg.replies}</Text>
      </View>
    </View>
  )
}

// ─── STANCE PICKER ────────────────────────────────────────────────

const STANCE_OPTIONS: { key: 'for' | 'against' | 'unsure'; label: string; emoji: string }[] = [
  { key: 'for',     label: 'For',      emoji: '👍' },
  { key: 'against', label: 'Against',  emoji: '👎' },
  { key: 'unsure',  label: 'Not sure', emoji: '🤷' },
]

function StancePicker({
  selected,
  accent,
  onSelect,
}: {
  selected: Stance
  accent: string
  onSelect: (s: Stance) => void
}) {
  return (
    <View style={s.stancePicker}>
      <Text style={s.stanceLabel}>Take your stance</Text>
      <View style={s.stanceRow}>
        {STANCE_OPTIONS.map(opt => {
          const isActive   = selected === opt.key
          const activeBg   = opt.key === 'for' ? colors.lime : opt.key === 'against' ? accent : colors.surface2
          const activeText = opt.key === 'for' ? colors.black : '#fff'

          return (
            <TouchableOpacity
              key={opt.key}
              style={[
                s.stanceBtn,
                isActive
                  ? { backgroundColor: activeBg, borderColor: activeBg, borderBottomColor: activeBg }
                  : { backgroundColor: 'transparent', borderColor: colors.borderStrong, borderBottomColor: '#3D4A5C' },
              ]}
              onPress={() => onSelect(isActive ? null : opt.key)}
              activeOpacity={0.8}
            >
              <Text style={s.stanceEmoji}>{opt.emoji}</Text>
              <Text style={[s.stanceBtnText, isActive && { color: activeText }]}>{opt.label}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

// ─── MAIN SCREEN ──────────────────────────────────────────────────

type Props = {
  navigation: any
  route: any
}

export default function DebateScreen({ navigation, route }: Props) {
  const { categoryId, motion, debating } = route.params ?? {}
  const meta = CATEGORY_META[categoryId] ?? CATEGORY_META.politics

  const [stance, setStance] = useState<Stance>(null)

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top bar ── */}
        <View style={s.topBar}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Text style={s.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={[s.catChip, { backgroundColor: meta.accent + '22', borderColor: meta.accent + '55' }]}>
            <Text style={[s.catChipText, { color: meta.accent }]}>{meta.emoji}  {meta.name}</Text>
          </View>
        </View>

        {/* ── Motion ── */}
        <View style={s.motionBlock}>
          <Text style={s.motion}>{motion ?? 'Untitled Debate'}</Text>
          <View style={s.debatingRow}>
            <View style={s.avatarStack}>
              <View style={[s.avatar, { backgroundColor: colors.streak,  left: 0  }]} />
              <View style={[s.avatar, { backgroundColor: meta.accent,    left: 14 }]} />
              <View style={[s.avatar, { backgroundColor: colors.purple2, left: 28 }]} />
            </View>
            <Text style={s.debatingText}>{fmt(debating ?? 0)} debating</Text>
          </View>
        </View>

        <View style={s.divider} />

        {/* ── Stance picker ── */}
        <StancePicker selected={stance} accent={meta.accent} onSelect={setStance} />

        {/* ── Arguments ── */}
        <View style={s.argsSection}>
          <Text style={s.argsSectionLabel}>TOP ARGUMENTS</Text>
          {MOCK_ARGUMENTS.map(arg => (
            <ArgumentCard key={arg.id} arg={arg} accent={meta.accent} />
          ))}
        </View>
      </ScrollView>

      {/* ── Sticky bottom CTA ── */}
      <View style={s.bottomBar}>
        <TouchableOpacity
          style={[s.ctaBtn, stance != null && { backgroundColor: colors.lime, borderColor: colors.lime, borderBottomColor: colors.limeMuted }]}
          activeOpacity={0.85}
        >
          <Text style={[s.ctaText, stance != null && { color: colors.black }]}>
            {stance != null ? 'Share your take →' : 'Pick a stance first'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

// ─── STYLES ───────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: colors.black },
  scroll:        { flex: 1 },
  scrollContent: { paddingBottom: spacing.xl },

  // ── Top bar ──
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  backBtn:   { width: 36, height: 36, justifyContent: 'center' },
  backArrow: { fontFamily: fonts.display.bold, fontSize: 24, color: colors.text },
  catChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  catChipText: { fontFamily: fonts.jakarta.semiBold, fontSize: 12, letterSpacing: 0.2 },

  // ── Motion ──
  motionBlock: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: spacing.xl,
  },
  motion: {
    fontFamily: fonts.display.black,
    fontSize: 28,
    lineHeight: 35,
    color: colors.text,
    letterSpacing: -0.7,
    marginBottom: spacing.md,
  },
  debatingRow: { flexDirection: 'row', alignItems: 'center' },
  avatarStack: { width: 56, height: 22, marginRight: spacing.sm, position: 'relative' },
  avatar: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.black,
  },
  debatingText: { fontFamily: fonts.jakarta.medium, fontSize: 13, color: colors.textMuted },

  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: SCREEN_PADDING, marginBottom: spacing.xl },

  // ── Stance picker ──
  stancePicker: {
    paddingHorizontal: SCREEN_PADDING,
    marginBottom: spacing.xl,
  },
  stanceLabel: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 12,
    color: colors.textSubtle,
    letterSpacing: 0.3,
    marginBottom: spacing.sm,
  },
  stanceRow: { flexDirection: 'row', gap: spacing.sm },
  stanceBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderBottomWidth: 4,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  stanceEmoji:   { fontSize: 18 },
  stanceBtnText: { fontFamily: fonts.jakarta.semiBold, fontSize: 12, color: colors.textMuted },

  // ── Arguments ──
  argsSection: { paddingHorizontal: SCREEN_PADDING },
  argsSectionLabel: {
    fontFamily: fonts.jakarta.extraBold,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  argCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderBottomWidth: 4,
    borderBottomColor: '#3D4A5C',
    padding: spacing.md + 2,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
  },
  argHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  argAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  argAvatar:    { width: 22, height: 22, borderRadius: 11 },
  argAuthor:    { fontFamily: fonts.jakarta.semiBold, fontSize: 13, color: colors.text },
  argStancePill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  argStanceText: { fontFamily: fonts.jakarta.extraBold, fontSize: 9, letterSpacing: 0.8 },
  argText: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  argFooter: { flexDirection: 'row', gap: spacing.md },
  argMeta:   { fontFamily: fonts.jakarta.medium, fontSize: 12, color: colors.textSubtle },

  // ── Bottom CTA ──
  bottomBar: {
    paddingHorizontal: SCREEN_PADDING,
    paddingVertical: spacing.md,
    backgroundColor: colors.black,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  ctaBtn: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderBottomWidth: 5,
    borderColor: colors.borderStrong,
    borderBottomColor: '#3D4A5C',
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
    elevation: 6,
  },
  ctaText: {
    fontFamily: fonts.display.black,
    fontSize: 15,
    color: colors.textSubtle,
    letterSpacing: 0.2,
  },
})
