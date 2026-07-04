import React from 'react'
import { Modal, View, StyleSheet, ScrollView, Pressable } from 'react-native'
import { colors } from '../../constants/colors'
import { fonts } from '../../constants/fonts'
import { spacing } from '../../constants/spacing'
import { Text } from '../../components/Text'
import { Button } from '../../components/Button'
import type { Judgement, Side } from './types'

type Metric = { label: string; pro: number; con: number }

function metricsFor(j: Judgement): Metric[] {
  return [
    { label: 'ARGUMENT',   pro: j.argument_score_pro,   con: j.argument_score_con },
    { label: 'REBUTTAL',   pro: j.rebuttal_score_pro,   con: j.rebuttal_score_con },
    { label: 'CLARITY',    pro: j.clarity_score_pro,    con: j.clarity_score_con },
    { label: 'PERSUASION', pro: j.persuasion_score_pro, con: j.persuasion_score_con },
  ]
}

export function JudgementModal({
  visible,
  judgement,
  myUserId,
  userSide,
  opponentName,
  onClose,
}: {
  visible: boolean
  judgement: Judgement | null
  myUserId: number
  userSide: Side
  opponentName: string
  onClose: () => void
}) {
  if (!judgement) return null

  const isDraw = !judgement.winner
  const iWon = !isDraw && Number(judgement.winner!.id) === Number(myUserId)
  const label = isDraw ? 'DRAW' : iWon ? 'YOU WON' : 'YOU LOST'
  const labelColor = isDraw ? colors.sky : iWon ? colors.lime : colors.red

  const myTip = userSide === 'for' ? judgement.coaching_tip_pro : judgement.coaching_tip_con

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={s.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={s.card}>
          <Text style={[s.badge, { color: labelColor }]} allowFontScaling={false}>{label}</Text>
          {!isDraw && (
            <Text style={s.winnerLine}>@{judgement.winner!.username} takes it</Text>
          )}

          <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
            <View style={s.scoreHeader}>
              <Text style={s.scoreHeaderCol}>FOR</Text>
              <Text style={s.scoreHeaderLabel}> </Text>
              <Text style={s.scoreHeaderCol}>AGAINST</Text>
            </View>
            {metricsFor(judgement).map(m => (
              <View key={m.label} style={s.metricRow}>
                <Text style={s.metricScore}>{m.pro.toFixed(1)}</Text>
                <Text style={s.metricLabel}>{m.label}</Text>
                <Text style={s.metricScore}>{m.con.toFixed(1)}</Text>
              </View>
            ))}

            <View style={s.divider} />

            <Text style={s.sectionLabel}>REASONING</Text>
            <Text style={s.bodyText}>{judgement.reasoning}</Text>

            <Text style={s.sectionLabel}>STRONGEST MOMENT</Text>
            <Text style={s.bodyText}>{judgement.strongest_moment}</Text>

            {!!myTip && (
              <>
                <Text style={s.sectionLabel}>COACHING TIP FOR YOU</Text>
                <Text style={s.bodyText}>{myTip}</Text>
              </>
            )}
          </ScrollView>

          <Button variant="darkSteel" label="Continue" onPress={onClose} size="md" style={s.continueBtn} />
        </View>
      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.72)',
    paddingHorizontal: spacing.lg,
  },
  card: {
    width: '100%',
    maxHeight: '82%',
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  badge: {
    fontFamily: fonts.display.black,
    fontSize: 26,
    letterSpacing: 3,
    textAlign: 'center',
  },
  winnerLine: {
    fontFamily: fonts.jakarta.medium,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  scroll: {
    marginTop: spacing.xs,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scoreHeaderCol: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.textSubtle,
    width: 60,
  },
  scoreHeaderLabel: { flex: 1 },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  metricScore: {
    fontFamily: fonts.display.bold,
    fontSize: 15,
    color: colors.text,
    width: 60,
  },
  metricLabel: {
    flex: 1,
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 11,
    letterSpacing: 0.8,
    color: colors.textMuted,
    textAlign: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  sectionLabel: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.textSubtle,
    marginTop: spacing.sm,
    marginBottom: 4,
  },
  bodyText: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },
  continueBtn: {
    marginTop: spacing.md,
  },
})
