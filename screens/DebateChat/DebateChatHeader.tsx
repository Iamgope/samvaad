import React, { useState } from 'react'
import { View, StyleSheet, TouchableOpacity, Pressable } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { colors } from '../../constants/colors'
import { fonts } from '../../constants/fonts'
import { spacing, SCREEN_PADDING } from '../../constants/spacing'
import { Text } from '../../components/Text'
import { IconButton } from '../../components/IconButton'
import { ChevronLeftIcon, FlagIcon } from '../../components/Icons'

function DotsVerticalIcon({ size = 18, color = colors.text as string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="5" r="1.8" fill={color} />
      <Circle cx="12" cy="12" r="1.8" fill={color} />
      <Circle cx="12" cy="19" r="1.8" fill={color} />
    </Svg>
  )
}

export function DebateChatHeader({
  motion,
  over,
  onBack,
  onForfeit,
  onReport,
}: {
  motion: string
  over: boolean
  onBack: () => void
  onForfeit: () => void
  onReport: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <View style={s.header}>
      <IconButton
        icon={<ChevronLeftIcon size={18} color={colors.text} strokeWidth={2.2} />}
        accent={colors.text}
        onPress={onBack}
      />
      <View style={s.headerCenter}>
        <Text style={s.motion} numberOfLines={2}>{motion}</Text>
      </View>
      <View style={s.menuWrap}>
        <IconButton
          icon={<DotsVerticalIcon size={18} color={colors.text} />}
          accent={colors.text}
          onPress={() => setMenuOpen(v => !v)}
        />
        {menuOpen && (
          <>
            <Pressable style={s.menuBackdrop} onPress={() => setMenuOpen(false)} />
            <View style={s.menu}>
              <TouchableOpacity
                style={s.menuItem}
                activeOpacity={0.7}
                onPress={() => { setMenuOpen(false); onReport() }}
              >
                <FlagIcon size={15} color={colors.red} />
                <Text style={s.menuLabel}>Report user</Text>
              </TouchableOpacity>
              {!over && (
                <TouchableOpacity
                  style={[s.menuItem, s.menuItemDivider]}
                  activeOpacity={0.7}
                  onPress={() => { setMenuOpen(false); onForfeit() }}
                >
                  <Text style={s.menuLabel}>Forfeit debate</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SCREEN_PADDING,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    zIndex: 20,
  },
  headerCenter: { flex: 1, alignItems: 'center', gap: 3 },
  motion: {
    fontFamily: fonts.display.bold, fontSize: 16, lineHeight: 21,
    color: colors.text, letterSpacing: -0.3, textAlign: 'center',
  },
  menuWrap: { position: 'relative' },
  menuBackdrop: { position: 'absolute', top: -1000, left: -2000, right: -2000, height: 4000 },
  menu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: 6,
    minWidth: 168,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  menuItemDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  menuLabel: { fontFamily: fonts.jakarta.medium, fontSize: 14, color: colors.red },
})
