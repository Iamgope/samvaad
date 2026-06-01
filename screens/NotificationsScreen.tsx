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
    body: 'Arjun V. replied in "Should India remove religion-based laws?"',
    time: '2m ago', read: false,
  },
  {
    id: 'n2', emoji: '🔥', accent: colors.red,
    title: 'Your debate is trending',
    body: '"Is money ruining the spirit of sport?" crossed 5K participants.',
    time: '1h ago', read: false,
  },
  {
    id: 'n3', emoji: '🏆', accent: colors.gold,
    title: 'You won a debate',
    body: 'You beat Riya M. on "Should cricket be added to the Olympics?" +24 rating.',
    time: '3h ago', read: false,
  },
  {
    id: 'n4', emoji: '🗳️', accent: colors.sky,
    title: 'Result is in',
    body: 'The motion you voted on closed 58% for. See how it ended.',
    time: '1 day ago', read: true,
  },
  {
    id: 'n5', emoji: '🎭', accent: colors.purple2,
    title: 'New persona unlocked',
    body: 'You can now argue as "The Contrarian" in practice debates.',
    time: '2 days ago', read: true,
  },
]

export default function NotificationsScreen() {
  const navigation = useNavigation()
  const [items, setItems] = useState<Notif[]>(INITIAL)

  const unread = items.filter(n => !n.read)
  const read   = items.filter(n => n.read)

  const animate = () =>
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)

  const markRead = (id: string) => {
    animate()
    setItems(list => list.map(n => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllRead = () => {
    animate()
    setItems(list => list.map(n => ({ ...n, read: true })))
  }

  const clearAll = () => {
    animate()
    setItems([])
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>

      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.headerTop}>
          <IconButton
            size="md"
            icon={<ChevronLeftIcon size={18} color={colors.text} />}
            accent={colors.text}
            onPress={() => navigation.goBack()}
          />
          <TouchableOpacity onPress={clearAll} disabled={items.length === 0} hitSlop={8}>
            <Text style={[s.clearAll, items.length === 0 && s.clearAllDisabled]}>
              Clear all
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={s.headerTitle}>Notifications</Text>
      </View>

      {items.length === 0 ? (

        <View style={s.empty}>
          <BellIcon size={26} color={colors.textFaint} />
          <Text style={s.emptyTitle}>All caught up</Text>
          <Text style={s.emptyBody}>
            New replies, results, and milestones will show up here.
          </Text>
        </View>

      ) : (
        <ScrollView contentContainerStyle={s.list} showsVerticalScrollIndicator={false}>

          {/* ── Unread ── */}
          {unread.length > 0 && (
            <>
              <View style={s.sectionRow}>
                <Text style={s.sectionLabel}>NEW</Text>
                <TouchableOpacity onPress={markAllRead} hitSlop={8}>
                  <Text style={s.markAll}>Mark all as read</Text>
                </TouchableOpacity>
              </View>

              {unread.map((n, i) => (
                <TouchableOpacity
                  key={n.id}
                  style={[s.row, i < unread.length - 1 && s.rowDivider]}
                  activeOpacity={0.6}
                  onPress={() => markRead(n.id)}
                >
                  <View style={[s.icon, { backgroundColor: n.accent + '40', borderRadius: i % 2 === 0 ? 21 : 10 }]} />
                  <View style={s.body}>
                    <Text style={s.notifTitle}>{n.title}</Text>
                    <Text style={s.notifBody}>{n.body}</Text>
                    <Text style={s.notifTime}>{n.time}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* ── Read ── */}
          {read.length > 0 && (
            <>
              <Text style={[s.sectionLabel, unread.length > 0 && s.sectionGap]}>
                EARLIER
              </Text>

              {read.map((n, i) => (
                <TouchableOpacity
                  key={n.id}
                  style={[s.row, s.rowRead, i < read.length - 1 && s.rowDivider]}
                  activeOpacity={0.5}
                >
                  <View style={[s.icon, { backgroundColor: n.accent + '22', borderRadius: i % 2 === 0 ? 21 : 10 }]} />
                  <View style={s.body}>
                    <Text style={s.notifTitleRead}>{n.title}</Text>
                    <Text style={s.notifBodyRead}>{n.body}</Text>
                    <Text style={s.notifTime}>{n.time}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}

        </ScrollView>
      )}

    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.black },

  // ── Header ──
  header: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontFamily: fonts.display.black,
    fontSize: 32,
    color: colors.text,
    letterSpacing: -1,
  },
  clearAll: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 13,
    color: colors.textMuted,
  },
  clearAllDisabled: { color: colors.textFaint },

  // ── List ──
  list: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: spacing.xxl,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    fontFamily: fonts.jakarta.bold,
    fontSize: 10,
    color: colors.textFaint,
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  sectionGap: { marginTop: spacing.xl },
  markAll: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 12,
    color: colors.textSubtle,
  },

  // ── Row ──
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowRead: { opacity: 0.55 },

  icon: {
    width: 42,
    height: 42,
    flexShrink: 0,
    marginTop: 2,
  },
  // ── Notification text (3-line stack) ──
  body: { flex: 1, gap: 2 },
  notifTitle: {
    fontFamily: fonts.jakarta.bold,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  notifTitleRead: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 14,
    color: colors.textSubtle,
    lineHeight: 20,
  },
  notifBody: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  notifBodyRead: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 13,
    color: colors.textSubtle,
    lineHeight: 18,
  },
  notifTime: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 11,
    color: colors.textFaint,
    marginTop: 2,
  },

  // ── Empty ──
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingBottom: 80,
  },
  emptyTitle: {
    fontFamily: fonts.display.bold,
    fontSize: 16,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  emptyBody: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSubtle,
    textAlign: 'center',
    maxWidth: 260,
  },
})
