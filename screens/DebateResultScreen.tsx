import React from 'react'
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../App'
import { colors } from '../constants/colors'
import { fonts } from '../constants/fonts'
import { spacing } from '../constants/spacing'
import { Text } from '../components/Text'
import { Button } from '../components/Button'
import { IconButton } from '../components/IconButton'
import { Avatar } from '../components/Avatar'
import { DebateHeroCard } from '../components/DebateHeroCard'
import { DiceIcon, AnalysisIcon, ChevronLeftIcon, ShareIcon } from '../components/Icons'

type Props = NativeStackScreenProps<RootStackParamList, 'DebateDetail'>

const SCREEN_H = Dimensions.get('window').height

const POSTER: Record<string, any> = {
  politics: require('../assets/poster_politics.png'),
  sports:   require('../assets/poster_sports.png'),
  lit:      require('../assets/poster_culture.png'),
  culture:  require('../assets/poster_culture.png'),
}

// ── Mocked until wired from DebateChat ────────────────────────────────────────
const MOCK_RESULT:    'win' | 'loss' | 'draw' = 'loss'
const MOCK_USER_SIDE: 'for' | 'against'       = 'for'
const MOCK_OPPONENT   = 'arjun.m'
const MOCK_XP         = 10

const FOR_COLOR = '#4ADE80'

const RESULT_META = {
  win:  { ratingDelta: '+3', xp: MOCK_XP },
  loss: { ratingDelta: '-4', xp: 10 },
  draw: { ratingDelta: '+1', xp: 5  },
}

export default function DebateResultScreen({ route, navigation }: Props) {
  const { motion, categoryId, categoryName, categoryAccent } = route.params
  const insets = useSafeAreaInsets()

  const meta         = RESULT_META[MOCK_RESULT]
  const opponentSide: 'for' | 'against' = MOCK_USER_SIDE === 'for' ? 'against' : 'for'

  // PRO on right, AGAINST on left
  const left  = MOCK_USER_SIDE === 'against'
    ? { name: 'you',         initials: 'Y',  side: MOCK_USER_SIDE as 'for' | 'against' }
    : { name: MOCK_OPPONENT, initials: 'AM', side: opponentSide }
  const right = MOCK_USER_SIDE === 'for'
    ? { name: 'you',         initials: 'Y',  side: MOCK_USER_SIDE as 'for' | 'against' }
    : { name: MOCK_OPPONENT, initials: 'AM', side: opponentSide }

  return (
    <View style={s.overlay}>
      <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={() => navigation.goBack()} />

      {/* Back + Share — page level */}
      <View style={[s.topBar, { top: insets.top + spacing.sm }]}>
        <IconButton
          size="md"
          icon={<ChevronLeftIcon size={18} color={colors.text} />}
          onPress={() => navigation.goBack()}
          accent={colors.text}
        />
        <IconButton
          size="md"
          icon={<ShareIcon size={15} color={colors.text} />}
          onPress={() => {}}
          accent={colors.text}
        />
      </View>

      {/* WON / LOST — outside modal, above it */}
      <ResultBadge result={MOCK_RESULT} />

      {/* ── Modal card ── */}
      <View style={s.sheet}>

        {/* Debate hero card */}
        <DebateHeroCard
          motion={motion}
          categoryName={categoryName}
          categoryAccent={categoryAccent}
          image={POSTER[categoryId]}
          height={180}
          borderRadius={0}
          motionSize={17}
          style={s.heroCard}
        />

        <View style={s.body}>

          {/* Avatars row */}
          <View style={s.avatarsRow}>
            <PlayerAvatar {...left}  align="left" />
            <Text style={s.vsText} allowFontScaling={false}>VS</Text>
            <PlayerAvatar {...right} align="right" />
          </View>

          <View style={s.divider} />

          {/* Stat boxes — 2 separate cards */}
          <View style={s.statBoxRow}>
            <View style={s.statBox}>
              <Text style={s.statBoxLabel}>RATING</Text>
              <View style={s.statBoxInner}>
                <Text style={s.statBoxMain}>1445</Text>
                <Text style={[s.statBoxDelta, { color: FOR_COLOR }]}>{meta.ratingDelta}</Text>
              </View>
            </View>
            <View style={s.statBox}>
              <Text style={s.statBoxLabel}>TOTAL XP</Text>
              <View style={s.statBoxInner}>
                <Text style={s.statBoxMain}>{meta.xp}</Text>
                <Text style={[s.statBoxDelta, { color: colors.lime }]}>+{meta.xp}</Text>
              </View>
            </View>
          </View>

        </View>
      </View>

      {/* Buttons — outside modal */}
      <View style={s.outsideBtns}>
        <Button
          variant="darkSteel"
          label="New Debate"
          leadingIcon={<DiceIcon size={20} />}
          onPress={() => navigation.goBack()}
          size="md"
          style={s.outsideBtn}
        />
        <Button
          variant="darkSteel"
          label="View Analysis"
          leadingIcon={<AnalysisIcon size={18} color={colors.text} />}
          onPress={() => {}}
          size="md"
          style={s.outsideBtn}
        />
      </View>
    </View>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function ResultBadge({ result }: { result: 'win' | 'loss' | 'draw' }) {
  const label = result === 'win' ? 'YOU WON' : result === 'loss' ? 'YOU LOST' : 'DRAW'

  const cfg = result === 'win'
    ? { top: '#F59E0B', layers: ['#78340F', '#92400E', '#A45214', '#B5651A', '#C87820'] }
    : result === 'loss'
    ? { top: '#9CA3AF', layers: ['#111827', '#1F2937', '#374151', '#4B5563', '#6B7280'] }
    : { top: '#38BDF8', layers: ['#0C2D48', '#0E3A5E', '#104872', '#135686', '#166499'] }

  const face = {
    fontFamily: fonts.display.black,
    fontSize: 28,
    letterSpacing: 5,
  }

  return (
    <View style={s.badge3DWrap}>
      {/* 3D extrusion layers — painted back to front */}
      {cfg.layers.map((c, i) => {
        const depth = (cfg.layers.length - i) * 1.3
        return (
          <Text key={i} style={[face, { color: c, position: 'absolute', top: depth, left: depth * 0.6 }]}>
            {label}
          </Text>
        )
      })}
      {/* Top bright face */}
      <Text style={[face, { color: cfg.top }]}>{label}</Text>
    </View>
  )
}

function PlayerAvatar({
  name, initials, side, align,
}: {
  name: string; initials: string; side: 'for' | 'against'
  align: 'left' | 'right'
}) {
  return (
    <View style={[s.playerAvatarCol, align === 'right' && s.playerAvatarRight]}>
      <Avatar
        size={64}
        initials={initials}
        borderColor={colors.borderStrong}
        backgroundColor={colors.surface2}
        textColor={colors.text}
      />
      <Text style={s.playerAvatarName} numberOfLines={1}>@{name}</Text>
      <Text style={s.sideLabel}>{side.toUpperCase()}</Text>
    </View>
  )
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.68)',
  },
  topBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Modal
  sheet: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
    maxHeight: SCREEN_H * 0.78,
    overflow: 'hidden',
  },

  // Hero
  resultBadge: {
    fontFamily: fonts.display.black,
    fontSize: 22,
    letterSpacing: 4,
    marginBottom: spacing.md,
  },
  badge3DWrap: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  badgeRow: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: 2,
  },
  heroCard: {},

  body: {
    padding: spacing.md,
    gap: spacing.md,
  },

  // Avatars row
  avatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerAvatarCol: {
    alignItems: 'flex-start',
    gap: 8,
  },
  playerAvatarRight: { alignItems: 'flex-end' },
  playerAvatarName: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
  sideLabel: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  vsText: {
    fontFamily: fonts.display.black,
    fontSize: 30,
    color: colors.text,
    letterSpacing: 4,
    marginBottom: 32,
    textShadowColor: 'rgba(0,0,0,0.85)',
    textShadowOffset: { width: 3, height: 5 },
    textShadowRadius: 0,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },

  // Stat boxes — 2 separate cards
  statBoxRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface2,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.md,
    gap: 6,
  },
  statBoxLabel: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 9,
    color: colors.textSubtle,
    letterSpacing: 1.5,
  },
  statBoxInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statBoxMain: {
    fontFamily: fonts.display.black,
    fontSize: 20,
    color: colors.text,
    letterSpacing: -0.5,
  },
  statBoxDelta: {
    fontFamily: fonts.display.bold,
    fontSize: 14,
  },

  // Buttons outside modal
  outsideBtns: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
    marginTop: spacing.md,
  },
  outsideBtn: { flex: 1 },
})
