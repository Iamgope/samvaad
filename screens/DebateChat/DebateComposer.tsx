import React from 'react'
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import Svg, { Path, Circle } from 'react-native-svg'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '../../constants/colors'
import { fonts } from '../../constants/fonts'
import { spacing, SCREEN_PADDING } from '../../constants/spacing'
import { Text } from '../../components/Text'
import { CHAR_LIMIT, EMOJIS, USER_BLUE } from './types'

function ArrowUpIcon({ size = 18, color = colors.black as string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 19 V6 M6 12 L12 6 L18 12"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

function EmojiIcon({ size = 22, color = colors.textMuted as string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.8} />
      <Circle cx="9" cy="10" r="1.15" fill={color} />
      <Circle cx="15" cy="10" r="1.15" fill={color} />
      <Path
        d="M8.2 14 C 9.6 16, 14.4 16, 15.8 14"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  )
}

export function DebateComposer({
  draft,
  onChangeDraft,
  inputRef,
  showEmoji,
  onToggleEmoji,
  onHideEmoji,
  over,
  canType,
  canSend,
  canEndTurn,
  placeholder,
  onSend,
  onEndTurn,
  kbHeight,
}: {
  draft: string
  onChangeDraft: (t: string) => void
  inputRef: React.RefObject<TextInput | null>
  showEmoji: boolean
  onToggleEmoji: () => void
  onHideEmoji: () => void
  over: boolean
  canType: boolean
  canSend: boolean
  canEndTurn: boolean
  placeholder: string
  onSend: () => void
  onEndTurn: () => void
  kbHeight: number
}) {
  const { bottom } = useSafeAreaInsets()

  const addEmoji = (e: string) => onChangeDraft((draft + e).slice(0, CHAR_LIMIT))

  return (
    <>
      <View style={[s.composer, { paddingBottom: bottom + (kbHeight > 0 ? spacing.md : 0) }]}>
        {over && (
          <View style={s.statusRow}>
            <Text style={s.statusFlag}>🏁</Text>
            <Text style={s.statusText}>Match complete</Text>
          </View>
        )}

        {showEmoji && canType && (
          <View style={s.emojiPanel}>
            <ScrollView
              contentContainerStyle={s.emojiGrid}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {EMOJIS.map((e, i) => (
                <TouchableOpacity
                  key={`${e}_${i}`}
                  style={s.emojiCell}
                  onPress={() => addEmoji(e)}
                  activeOpacity={0.6}
                >
                  <Text style={s.emojiChar}>{e}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={s.inputBox}>
          <TextInput
            ref={inputRef}
            style={s.input}
            value={draft}
            onChangeText={onChangeDraft}
            onFocus={onHideEmoji}
            placeholder={placeholder}
            placeholderTextColor={colors.textSubtle}
            editable={canType}
            multiline
            maxLength={CHAR_LIMIT}
            contextMenuHidden
            returnKeyType="send"
            submitBehavior="blurAndSubmit"
            onSubmitEditing={onSend}
          />

          <View style={s.inputFooter}>
            {canType && (
              <TouchableOpacity onPress={onToggleEmoji} hitSlop={8} activeOpacity={0.7}>
                <EmojiIcon size={22} color={showEmoji ? USER_BLUE : colors.textMuted} />
              </TouchableOpacity>
            )}
            <View style={{ flex: 1 }} />
            {canType && <Text style={s.charCount}>{draft.length}/{CHAR_LIMIT}</Text>}
            {canEndTurn && (
              <TouchableOpacity onPress={onEndTurn} activeOpacity={0.85} style={s.endTurnBtn}>
                <Text style={s.endTurnLabel}>End Turn</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={onSend}
              disabled={!canSend}
              activeOpacity={0.85}
              style={[s.sendBtn, { backgroundColor: canSend ? USER_BLUE : colors.surface2 }]}
            >
              <ArrowUpIcon size={18} color={canSend ? colors.black : colors.textSubtle} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {kbHeight > 0 && <View style={{ height: kbHeight }} />}
    </>
  )
}

const s = StyleSheet.create({
  composer: {
    backgroundColor: colors.black,
    paddingHorizontal: SCREEN_PADDING, paddingTop: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: SCREEN_PADDING, paddingTop: spacing.xs,
  },
  statusFlag: { fontSize: 13 },
  statusText: { fontFamily: fonts.jakarta.bold, fontSize: 12, color: colors.textMuted },

  inputBox: {
    backgroundColor: colors.surface,
    borderRadius: 24, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md + 2,
    paddingTop: spacing.sm + 2, paddingBottom: spacing.sm,
  },
  input: {
    fontFamily: fonts.jakarta.regular, fontSize: 15, lineHeight: 21,
    color: colors.text, maxHeight: 120, paddingVertical: 0, paddingTop: 2,
  },
  inputFooter: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  charCount: { fontFamily: fonts.jakarta.regular, fontSize: 11, color: colors.textSubtle },

  emojiPanel: {
    height: 220,
    backgroundColor: colors.surface,
    borderRadius: 18, borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
  },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.xs },
  emojiCell: { width: `${100 / 8}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  emojiChar: { fontSize: 24 },

  sendBtn: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center',
  },
  endTurnBtn: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8, borderWidth: 1, borderColor: colors.border,
  },
  endTurnLabel: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 11, color: colors.textMuted, letterSpacing: 0.3,
  },
})
