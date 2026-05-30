import React, { useState } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { colors } from '../constants/colors'
import { fonts } from '../constants/fonts'
import { spacing, SCREEN_PADDING } from '../constants/spacing'
import { Text } from '../components/Text'
import { IconButton } from '../components/IconButton'
import { ChevronLeftIcon, BellIcon } from '../components/Icons'

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

type Notif = {
  id: string
  emoji: string
  accent: string
  title: string
  body: string
  time: string
  read: boolean
}

const INITIAL: Notif[] = [
  {
    id: 'n1', emoji: '⚔️', accent: colors.streak,
    title: 'Your turn to argue',
    body: 'Arjun V. replied in “Should India remove religion-based laws?”',
    time: '2m', read: false,
  },
  {
    id: 'n2', emoji: '🔥', accent: colors.red,
    title: 'Your debate is trending',
    body: '“Is money ruining the spirit of sport?” crossed 5K participants.',
    time: '1h', read: false,
  },
  {
    id: 'n3', emoji: '🏆', accent: colors.gold,
    title: 'You won a debate',
    body: 'You beat Riya M. on “Should cricket be added to the Olympics?” — +24 rating.',
    time: '3h', read: false,
  },
  {
    id: 'n4', emoji: '🗳️', accent: colors.sky,
    title: 'Result is in',
    body: 'The motion you voted on closed 58% for. See how it ended.',
    time: 'Yesterday', read: true,
  },
  {
    id: 'n5', emoji: '🎭', accent: colors.purple2,
    title: 'New persona unlocked',
    body: 'You can now argue as “The Contrarian” in practice debates.',
    time: '2d', read: true,
  },
]

export default function NotificationsScreen() {
  const navigation = useNavigation()
  const [items, setItems] = useState<Notif[]>(INITIAL)

  const unread = items.filter(n => !n.read).length

  const animate = () =>
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)

  const markRead = (id: string) =>
    setItems(list => list.map(n => (n.id === id ? { ...n, read: true } : n)))

  const markAllRead = () => {
    animate()
    setItems(list => list.map(n => ({ ...n, read: true })))
  }

  const dismiss = (id: string) => {
    animate()
    setItems(list => list.filter(n => n.id !== id))
  }

  const clearAll = () => {
    animate()
    setItems([])
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <IconButton
          size="md"
          icon={<ChevronLeftIcon size={18} color={colors.text} />}
          accent={colors.text}
          onPress={() => navigation.goBack()}
        />
        <Text style={s.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={clearAll} disabled={items.length === 0} hitSlop={8}>
          <Text style={[s.clearAll, items.length === 0 && s.clearAllDisabled]}>Clear all</Text>
        </TouchableOpacity>
      </View>

      {items.length === 0 ? (
        <View style={s.empty}>
          <View style={s.emptyIcon}>
            <BellIcon size={30} color={colors.textSubtle} />
          </View>
          <Text style={s.emptyTitle}>You're all caught up</Text>
          <Text style={s.emptyBody}>New replies, results, and milestones will show up here.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Sub-row: unread count + mark all read */}
          <View style={s.subRow}>
            <Text style={s.subCount}>
              {unread > 0 ? `${unread} unread` : 'All read'}
            </Text>
            {unread > 0 && (
              <TouchableOpacity onPress={markAllRead} hitSlop={8}>
                <Text style={s.markAll}>Mark all as read</Text>
              </TouchableOpacity>
            )}
          </View>

          {items.map(n => (
            <TouchableOpacity
              key={n.id}
              style={[s.row, !n.read && s.rowUnread]}
              activeOpacity={0.7}
              onPress={() => markRead(n.id)}
            >
              <View style={[s.badge, { backgroundColor: n.accent + '22' }]}>
                <Text style={s.badgeEmoji}>{n.emoji}</Text>
              </View>

              <View style={s.rowBody}>
                <View style={s.rowTop}>
                  <Text style={s.rowTitle} numberOfLines={1}>{n.title}</Text>
                  <Text style={s.rowTime}>{n.time}</Text>
                </View>
                <Text style={s.rowText} numberOfLines={2}>{n.body}</Text>
              </View>

              {!n.read ? (
                <View style={s.unreadDot} />
              ) : (
                <TouchableOpacity onPress={() => dismiss(n.id)} hitSlop={8} style={s.dismiss}>
                  <Text style={s.dismissText}>✕</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.black },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_PADDING,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontFamily: fonts.display.bold,
    fontSize: 18,
    color: colors.text,
    letterSpacing: -0.3,
  },
  clearAll: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 13,
    color: colors.textMuted,
  },
  clearAllDisabled: { color: colors.textFaint },

  // ── List ──
  scrollContent: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: spacing.xxl,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },
  subCount: {
    fontFamily: fonts.jakarta.extraBold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.textSubtle,
    textTransform: 'uppercase',
  },
  markAll: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 13,
    color: colors.lime,
  },

  // ── Row ──
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 14,
    marginBottom: spacing.xs,
  },
  rowUnread: {
    backgroundColor: colors.surface,
  },
  badge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  badgeEmoji: { fontSize: 19 },
  rowBody: { flex: 1, gap: 3 },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  rowTitle: {
    flex: 1,
    fontFamily: fonts.jakarta.bold,
    fontSize: 14,
    color: colors.text,
  },
  rowTime: {
    fontFamily: fonts.jakarta.medium,
    fontSize: 11,
    color: colors.textSubtle,
  },
  rowText: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 12.5,
    lineHeight: 17,
    color: colors.textMuted,
  },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: colors.lime,
    flexShrink: 0,
  },
  dismiss: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  dismissText: {
    fontFamily: fonts.jakarta.medium,
    fontSize: 14,
    color: colors.textFaint,
  },

  // ── Empty ──
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: 80,
    gap: spacing.sm,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontFamily: fonts.display.bold,
    fontSize: 17,
    color: colors.text,
  },
  emptyBody: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 260,
  },
})
