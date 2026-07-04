import React, { useState } from 'react'
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Text as RNText,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { colors } from '../constants/colors'
import { fonts } from '../constants/fonts'
import { spacing, SCREEN_PADDING } from '../constants/spacing'
import { Text } from '../components/Text'
import { Button } from '../components/Button'
import { IconButton } from '../components/IconButton'
import { ChevronLeftIcon } from '../components/Icons'

type Mode = 'course' | 'character'

const OPTIONS: {
  id: Mode
  emoji: string
  title: string
  description: string
  accent: string
  inputLabel: string
  inputPlaceholder: string
}[] = [
  {
    id: 'course',
    emoji: '📚',
    title: 'Structured Course',
    description:
      'Follow step-by-step lessons on debate techniques, logical reasoning, and argument framing.',
    accent: colors.lime,
    inputLabel: 'Any skill you want to focus on?',
    inputPlaceholder: 'e.g. rebuttals, logical fallacies, opening statements…',
  },
  {
    id: 'character',
    emoji: '🎭',
    title: 'Spar with a Character',
    description:
      'Face off against AI opponents with distinct debate styles — Socratic questioners, aggressive debaters, and more.',
    accent: colors.purple2,
    inputLabel: 'Describe your ideal opponent or scenario',
    inputPlaceholder: "e.g. a devil's advocate who never concedes, a formal academic…",
  },
]

export default function LearnScreen() {
  const navigation = useNavigation()
  const [selected, setSelected] = useState<Mode | null>(null)
  const [notes, setNotes] = useState<Record<Mode, string>>({ course: '', character: '' })

  function toggle(id: Mode) {
    setSelected(prev => (prev === id ? null : id))
  }

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={s.header}>
          <IconButton
            size="md"
            icon={<ChevronLeftIcon size={18} color={colors.text} />}
            onPress={() => navigation.goBack()}
            accent={colors.text}
          />
          <Text variant="titleLg">Study Room</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          style={s.flex}
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text variant="displayMd" style={s.title}>{'How would you\nlike to practice?'}</Text>
          <Text variant="bodyMd" tone="muted" style={s.subtitle}>
            Pick a format — you can always change it later.
          </Text>

          {/* Option Cards */}
          <View style={s.cards}>
            {OPTIONS.map(opt => {
              const isSelected = selected === opt.id
              return (
                <View
                  key={opt.id}
                  style={[
                    s.card,
                    isSelected && {
                      borderColor: opt.accent,
                      borderBottomColor: opt.accent,
                      backgroundColor: opt.accent + '0F',
                    },
                  ]}
                >
                  {/* Check badge */}
                  {isSelected && (
                    <View style={[s.checkBadge, { backgroundColor: opt.accent }]}>
                      <RNText style={s.checkMark}>✓</RNText>
                    </View>
                  )}

                  {/* Icon + text row — tappable */}
                  <View style={s.cardRow}>
                    <View
                      style={[
                        s.iconBadge,
                        { backgroundColor: opt.accent + '22', borderColor: opt.accent + '55' },
                      ]}
                    >
                      <RNText style={s.iconEmoji}>{opt.emoji}</RNText>
                    </View>
                    <View style={s.cardText}>
                      <Text
                        variant="titleSm"
                        style={[s.cardTitle, isSelected && { color: opt.accent }]}
                        onPress={() => toggle(opt.id)}
                      >
                        {opt.title}
                      </Text>
                      <Text variant="bodySm" tone="muted" style={s.cardDesc}>
                        {opt.description}
                      </Text>
                      <Text
                        variant="labelSm"
                        style={[s.selectToggle, { color: opt.accent }]}
                        onPress={() => toggle(opt.id)}
                      >
                        {isSelected ? 'Deselect' : 'Select this'}
                      </Text>
                    </View>
                  </View>

                  {/* Expanded input */}
                  {isSelected && (
                    <View style={[s.inputSection, { borderTopColor: opt.accent + '33' }]}>
                      <Text variant="labelSm" tone="muted" style={s.inputLabel}>
                        {opt.inputLabel}
                      </Text>
                      <TextInput
                        style={[s.input, { borderColor: opt.accent + '66' }]}
                        placeholder={opt.inputPlaceholder}
                        placeholderTextColor={colors.textFaint}
                        value={notes[opt.id]}
                        onChangeText={v => setNotes(prev => ({ ...prev, [opt.id]: v }))}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                      />
                    </View>
                  )}
                </View>
              )
            })}
          </View>

          <Text variant="caption" tone="subtle" style={s.hint}>
            The more detail you add, the better tailored your practice will be.
          </Text>
        </ScrollView>

        {/* Footer */}
        <View style={s.footer}>
          <Button
            variant={selected ? 'primary' : 'outline'}
            size="lg"
            label="Continue"
            onPress={() => { /* TODO: route to practice */ }}
            disabled={!selected}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.black },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_PADDING,
    paddingVertical: spacing.md,
  },
  scroll: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: spacing.xxl,
  },
  title: { marginBottom: spacing.sm },
  subtitle: { marginBottom: spacing.xxl },
  cards: { gap: spacing.lg },
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: colors.borderStrong,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    overflow: 'hidden',
  },
  checkBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  checkMark: {
    fontSize: 12,
    color: colors.black,
    fontFamily: fonts.display.bold,
    lineHeight: 14,
  },
  cardRow: { flexDirection: 'row', gap: spacing.md },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconEmoji: { fontSize: 26 },
  cardText: { flex: 1, paddingRight: spacing.lg },
  cardTitle: { marginBottom: spacing.xs },
  cardDesc: { lineHeight: 18, marginBottom: spacing.sm },
  selectToggle: { marginTop: spacing.xs },
  inputSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
  },
  inputLabel: { marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    color: colors.text,
    fontFamily: fonts.jakarta.regular,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 82,
  },
  hint: {
    textAlign: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  footer: {
    padding: SCREEN_PADDING,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.black,
  },
})
