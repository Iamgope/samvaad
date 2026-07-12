import React from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text as RNText,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import Svg, { Path } from 'react-native-svg'
import { colors } from '../constants/colors'
import { fonts } from '../constants/fonts'
import { spacing, SCREEN_PADDING } from '../constants/spacing'
import { Text } from '../components/Text'
import { Button } from '../components/Button'
import { IconButton } from '../components/IconButton'
import { ChevronLeftIcon } from '../components/Icons'

function HeadIcon({ size = 28, color = colors.steel }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 155.739 155.739" fill="none">
      <Path
        fill={color}
        d="M93.192,25.738c8.326,0,15.073,6.752,15.073,15.081c0,8.325-6.747,15.078-15.073,15.078
          c-8.33,0-15.079-6.753-15.079-15.078C78.113,32.49,84.862,25.738,93.192,25.738z"
      />
      <Path
        fill={color}
        d="M101.102,73.074c5.354,0,9.692,4.339,9.692,9.691c0,5.356-4.338,9.697-9.692,9.697c-5.356,0-9.693-4.341-9.693-9.697
          C91.409,77.413,95.746,73.074,101.102,73.074z"
      />
      <Path
        fill={color}
        d="M52.781,155.739h86.949c0,0-25.232-20.279-24.701-42.513c0.317-12.388,24.701-28.158,24.58-62.58
          c-0.076-17.311-16.865-46.088-45.371-49.675C65.724-2.62,44.386,3.656,35.062,21.235c-9.335,17.57-10.042,32.999-9.325,35.861
          c0.726,2.876,3.769,8.255,3.769,8.255S15.16,87.405,16.049,90.988c0.908,3.596,10.748,5.527,10.748,5.527s0.892,2.497-0.906,7.335
          c-1.795,4.846,3.338,10.468,4.88,12.43c1.519,1.954-2.158,8.062-0.908,11.476c1.253,3.398,7.176,7.523,13.986,6.632
          c6.819-0.902,15.566-2.504,18.604-3.054C69.312,147.479,52.781,155.739,52.781,155.739z M117.141,90.021l-2.947,4.525
          l-2.867-1.883c-1.315,1.353-2.919,2.452-4.714,3.207l0.708,3.371l-5.276,1.1l-0.706-3.364c-1.97,0.032-3.864-0.335-5.602-1.051
          l-1.883,2.872l-4.527-2.955l1.877-2.872c-1.346-1.312-2.451-2.912-3.199-4.706l-3.376,0.705l-1.11-5.285l3.38-0.701
          c-0.027-1.952,0.333-3.852,1.045-5.598l-2.871-1.882l2.952-4.522l2.876,1.879c1.312-1.36,2.908-2.458,4.711-3.212l-0.708-3.368
          l5.28-1.111l0.708,3.374c1.952-0.033,3.853,0.338,5.599,1.048l1.882-2.875l4.52,2.949l-1.878,2.878
          c1.351,1.313,2.456,2.905,3.208,4.711l3.357-0.7l1.111,5.28l-3.365,0.7c0.032,1.958-0.338,3.857-1.051,5.604L117.141,90.021z
          M67.762,30.636l5.218,1.207c1.188-2.685,2.925-5.145,5.157-7.213L75.3,20.086l7.115-4.449l2.84,4.545
          c2.835-1.095,5.807-1.581,8.739-1.475l1.2-5.204l8.189,1.883l-1.204,5.203c2.682,1.196,5.128,2.931,7.204,5.158l4.539-2.838
          l4.454,7.122l-4.547,2.829c1.097,2.837,1.576,5.811,1.479,8.741l5.202,1.207l-1.888,8.181l-5.215-1.207
          c-1.182,2.679-2.917,5.146-5.149,7.212l2.842,4.54l-7.124,4.448l-2.831-4.539c-2.846,1.1-5.817,1.587-8.748,1.475l-1.206,5.204
          l-8.178-1.888l1.195-5.204c-2.676-1.186-5.135-2.925-7.194-5.155l-4.55,2.841l-4.45-7.122l4.55-2.834
          c-1.1-2.843-1.581-5.806-1.48-8.736l-5.211-1.204L67.762,30.636z"
      />
    </Svg>
  )
}

function PlayIcon({ size = 14, color = colors.black }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 4.5L19 12L6 19.5V4.5Z" fill={color} />
    </Svg>
  )
}

type Course = {
  id: string
  title: string
  subtitle: string
  progress?: number
  inProgress?: boolean
}

const COURSES: Course[] = [
  {
    id: 'popular-beliefs',
    title: 'Popular Beliefs',
    subtitle: 'Ideas on popular beliefs and why they might not be correct.',
    progress: 35,
    inProgress: true,
  },
]

// Hero unit for the course a person is actively working through.
// Layout mirrors the "in progress" card pattern: badge, title, progress bar,
// continue button. Colors stay inside the existing dark/steel theme.
function HeroCourseCard({ course, onPress }: { course: Course; onPress: () => void }) {
  return (
    <View style={s.hero}>
      {/* <View style={s.heroBadge}>
        <RNText style={s.heroBadgeText}>New</RNText>
      </View> */}

      <View style={s.heroTitleRow}>
        <View style={s.iconBox}>
          <HeadIcon size={34} />
        </View>
        <Text variant="titleLg" style={[s.heroTitle, s.heroTitleSize]}>
          {course.title}
        </Text>
      </View>

      <Text variant="bodyMd" tone="muted" style={s.heroSubtitle}>
        {course.subtitle}
      </Text>

      <View style={s.heroButtonWrap}>
        <Button
          variant="steel"
          size="md"
          label="Explore"
          onPress={onPress}
          labelStyle={s.heroButtonLabel}
        />
      </View>
    </View>
  )
}

function CourseCard({ course, onPress }: { course: Course; onPress: () => void }) {
  const progress = course.progress ?? 0

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.85}>
      <View style={s.cardHeader}>
        <View style={s.iconBox}>
          <HeadIcon size={34} />
        </View>
        <RNText style={s.menuDots}>•••</RNText>
      </View>

      <Text variant="titleSm" style={s.cardTitle} numberOfLines={1}>
        {course.title}
      </Text>
      <Text variant="bodySm" tone="muted" style={s.cardSubtitle} numberOfLines={2}>
        {course.subtitle}
      </Text>

      <View style={s.progressTrack}>
        <View style={[s.progressFill, { width: `${progress}%` }]} />
      </View>
    </TouchableOpacity>
  )
}

export default function LearnScreen() {
  const navigation = useNavigation()

  const activeCourse = COURSES.find(c => c.inProgress)
  const otherCourses = COURSES.filter(c => !c.inProgress)

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <View style={s.header}>
        <IconButton
          size="md"
          icon={<ChevronLeftIcon size={18} color={colors.text} />}
          onPress={() => navigation.goBack()}
          accent={colors.text}
        />
        <Text variant="titleLg">Practice</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={s.flex}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {activeCourse && (
          <HeroCourseCard course={activeCourse} onPress={() => {}} />
        )}

        {otherCourses.length > 0 && (
          <>
            <Text style={s.sectionLabel}>COURSES</Text>
            <View style={s.list}>
              {otherCourses.map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onPress={() => {}}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>
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

  // Hero "in progress" card
  hero: {
    padding: spacing.lg,
    borderRadius: 20,
    backgroundColor: colors.surface2,
    marginBottom: spacing.xl,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.steel + '22',
    marginBottom: spacing.md,
  },
  heroBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.steel,
    marginRight: 6,
  },
  heroBadgeText: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 11,
    color: colors.steel,
    letterSpacing: 0.3,
  },
  heroTitle: {
    flex: 1,
  },
  heroTitleSize: {
    fontSize: 26,
    lineHeight: 32,
  },
  heroSubtitle: {
    marginBottom: spacing.lg,
  },
  // Page-local override: clips the shared steel button into a full pill
  // shape here without touching Button.tsx's default steel radius.
  heroButtonWrap: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  heroButtonLabel: {
    fontSize: 17,
  },

  sectionLabel: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 11,
    color: colors.textSubtle,
    letterSpacing: 1,
    marginBottom: spacing.md,
  },

  list: {
    gap: spacing.sm,
  },

  // Card
  card: {
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.steel + '22',
    borderWidth: 1,
    borderColor: colors.steel + '55',
  },
  menuDots: {
    color: colors.textSubtle,
    fontSize: 16,
    letterSpacing: 1,
  },
  cardTitle: {
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    lineHeight: 16,
    marginBottom: spacing.md,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surface2,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.steel,
  },
})