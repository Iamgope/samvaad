import React, { useRef, useState } from 'react'
import { View, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native'
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
import { DiceIcon, AnalysisIcon, ChevronLeftIcon, ShareIcon, ShareNodesIcon } from '../components/Icons'
import { ResultShareCard, shareResultCard } from '../components/ResultShareCard'
import { shareOpeningCard } from './DebateChat/OpeningShareCard'

const QUOTE_CARD_BG = '#D7D9DE'

type Props = NativeStackScreenProps<RootStackParamList, 'DebateResult'>

const SCREEN_H = Dimensions.get('window').height

const POSTER: Record<string, any> = {
  politics: require('../assets/poster_politics.png'),
  sports:   require('../assets/poster_sports.png'),
  lit:      require('../assets/poster_culture.png'),
  culture:  require('../assets/poster_culture.png'),
}

const FOR_COLOR     = '#4ADE80'
const AGAINST_COLOR = '#FF3B5C'

export default function DebateResultScreen({ route, navigation }: Props) {
  const {
    motion, categoryId, categoryName, categoryAccent,
    userSide, myUsername, myRating, opponentName,
    result, ratingDelta, xpDelta,
    reasoning, strongestMoment, coachingTip, scores,
  } = route.params
  const insets = useSafeAreaInsets()
  const [showAnalysis, setShowAnalysis] = useState(false)

  const opponentSide: 'for' | 'against' = userSide === 'for' ? 'against' : 'for'
  const shareCardRef = useRef<View>(null)
  const momentCardRef = useRef<View>(null)
  const [showCoachingTip, setShowCoachingTip] = useState(false)
  const deltaColor   = ratingDelta >= 0 ? FOR_COLOR : AGAINST_COLOR
  const ratingStr    = ratingDelta >= 0 ? `+${ratingDelta}` : String(ratingDelta)

  // PRO on right, AGAINST on left
  const myInitials  = myUsername.slice(0, 2).toUpperCase()
  const opInitials  = opponentName.slice(0, 2).toUpperCase()
  const left  = userSide === 'against'
    ? { name: myUsername,   initials: myInitials, side: userSide }
    : { name: opponentName, initials: opInitials, side: opponentSide }
  const right = userSide === 'for'
    ? { name: myUsername,   initials: myInitials, side: userSide }
    : { name: opponentName, initials: opInitials, side: opponentSide }

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
          onPress={() => shareResultCard(shareCardRef, motion)}
          accent={colors.text}
        />
      </View>

      {/* WON / LOST — outside modal, above it */}
      <ResultBadge result={result} />

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

        <ScrollView style={s.body} contentContainerStyle={s.bodyContent} showsVerticalScrollIndicator={false}>

          {/* Avatars row */}
          <View style={s.avatarsRow}>
            <PlayerAvatar {...left}  align="left" />
            <Text style={s.vsText} allowFontScaling={false}>VS</Text>
            <PlayerAvatar {...right} align="right" />
          </View>

          <View style={s.divider} />

          {/* Stat boxes */}
          <View style={s.statBoxRow}>
            <View style={s.statBox}>
              <Text style={s.statBoxLabel}>RATING</Text>
              <View style={s.statBoxInner}>
                <Text style={s.statBoxMain}>{myRating}</Text>
                <Text style={[s.statBoxDelta, { color: deltaColor }]}>{ratingStr}</Text>
              </View>
            </View>
            <View style={s.statBox}>
              <Text style={s.statBoxLabel}>TOTAL XP</Text>
              <View style={s.statBoxInner}>
                <Text style={s.statBoxMain}>{xpDelta}</Text>
                <Text style={[s.statBoxDelta, { color: colors.lime }]}>+{xpDelta}</Text>
              </View>
            </View>
          </View>

          {/* Analysis — only shown once the user taps "View Analysis" */}
          {showAnalysis && scores && (
            <>
              <View style={s.divider} />
              <Text style={s.analysisSectionLabel}>SCORECARD</Text>
              <View style={s.scoreHeader}>
                <Text style={s.scoreHeaderSide}>FOR</Text>
                <View style={{ flex: 1 }} />
                <Text style={s.scoreHeaderSide}>AGAINST</Text>
              </View>
              {([
                ['ARGUMENT',   scores.argumentPro,   scores.argumentCon],
                ['REBUTTAL',   scores.rebuttalPro,   scores.rebuttalCon],
                ['CLARITY',    scores.clarityPro,    scores.clarityCon],
                ['PERSUASION', scores.persuasionPro, scores.persuasionCon],
              ] as [string, number, number][]).map(([label, pro, con]) => (
                <View key={label} style={s.scoreRow}>
                  <Text style={s.scoreNum}>{pro.toFixed(1)}</Text>
                  <Text style={s.scoreLabel}>{label}</Text>
                  <Text style={s.scoreNum}>{con.toFixed(1)}</Text>
                </View>
              ))}
            </>
          )}

          {showAnalysis && !!reasoning && (
            <>
              <View style={s.divider} />
              <Text style={s.analysisSectionLabel}>REASONING</Text>
              <Text style={s.analysisBody}>{reasoning}</Text>
            </>
          )}

          {showAnalysis && !!strongestMoment && (
            <>
              <Text style={[s.analysisSectionLabel, { marginTop: spacing.md }]}>STRONGEST MOMENT</Text>
              <View ref={momentCardRef} collapsable={false} style={s.momentCard}>
                <Text style={s.momentBody}>{strongestMoment}</Text>
                <View style={s.momentDivider} />
                <View style={s.momentFooter}>
                  <Text style={s.momentAttr}>AI VERDICT</Text>
                  <TouchableOpacity
                    onPress={() => shareOpeningCard(momentCardRef)}
                    hitSlop={8}
                    style={s.momentShareBtn}
                  >
                    <ShareNodesIcon size={13} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          {showAnalysis && !!coachingTip && (
            <>
              <View style={s.coachingHeaderRow}>
                <Text style={[s.analysisSectionLabel, { marginTop: spacing.md }]}>COACHING TIP FOR YOU</Text>
                {!showCoachingTip && (
                  <TouchableOpacity onPress={() => setShowCoachingTip(true)} hitSlop={8}>
                    <Text style={s.viewLink}>View</Text>
                  </TouchableOpacity>
                )}
              </View>
              {showCoachingTip && <Text style={s.analysisBody}>{coachingTip}</Text>}
            </>
          )}

        </ScrollView>
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
          label={showAnalysis ? 'Hide Analysis' : 'View Analysis'}
          leadingIcon={<AnalysisIcon size={18} color={colors.text} />}
          onPress={() => setShowAnalysis(v => !v)}
          size="md"
          style={s.outsideBtn}
        />
      </View>

      {/* Off-screen capture target */}
      <View style={s.offScreen}>
        <ResultShareCard
          ref={shareCardRef}
          motion={motion}
          result={result}
          categoryName={categoryName}
          categoryAccent={categoryAccent}
          userUsername={myUsername}
          opponentUsername={opponentName}
          userSide={userSide}
          ratingDelta={ratingStr}
          xp={xpDelta}
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
    maxHeight: SCREEN_H * 0.44,
  },
  bodyContent: {
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
  offScreen: { position: 'absolute', left: -9999, top: -9999 },

  // Analysis section
  analysisSectionLabel: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 9,
    color: colors.textSubtle,
    letterSpacing: 1.5,
    marginTop: spacing.xs,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  scoreHeaderSide: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 9,
    letterSpacing: 1,
    color: colors.textSubtle,
    width: 52,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  scoreNum: {
    fontFamily: fonts.display.bold,
    fontSize: 14,
    color: colors.text,
    width: 52,
  },
  scoreLabel: {
    flex: 1,
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.textMuted,
    textAlign: 'center',
  },
  analysisBody: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
    marginTop: 4,
  },

  // Strongest moment — quote card, same look as the chat's OpeningCard
  momentCard: {
    backgroundColor: QUOTE_CARD_BG,
    borderRadius: 14,
    padding: spacing.md,
    marginTop: 4,
    gap: 6,
  },
  momentBody: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 15,
    lineHeight: 20,
    color: colors.textOnLight,
    letterSpacing: -0.1,
  },
  momentDivider: {
    height: 1,
    backgroundColor: '#00000014',
    marginTop: 2,
  },
  momentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  momentAttr: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 11.5,
    color: colors.textOnLightMuted,
  },
  momentShareBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.textOnLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Coaching tip — hidden behind a "View" reveal
  coachingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewLink: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 11,
    color: colors.lime,
    marginTop: spacing.md,
  },
})
