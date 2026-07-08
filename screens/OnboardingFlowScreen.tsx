import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  Animated,
  TouchableOpacity,
  PanResponder,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../App';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { text } from '../constants/typography';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { completeOnboarding } from '../services/api/auth';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'OnboardingFlow'>;
  route: RouteProp<RootStackParamList, 'OnboardingFlow'>;
};

const { width: WIDTH } = Dimensions.get('window');
const TOTAL_STEPS = 3;
const MIN_USERNAME = 3;
const MAX_USERNAME = 20;
const USERNAME_RE = /^[A-Za-z0-9_]+$/;

// ─── Topic data ────────────────────────────────────────────────────────────

const TOPICS: Array<{ section: string; icon: string; items: string[] }> = [
  {
    section: 'Sports',
    icon: '⚽',
    items: [
      'Cricket', 'Football', 'Basketball', 'Tennis',
      'Formula 1', 'MMA & UFC', 'Baseball', 'Rugby',
      'Cycling', 'Olympics & Athletics',
    ],
  },
  {
    section: 'Arts & Culture',
    icon: '🎬',
    items: [
      'Movies', 'TV Shows', 'Music', 'Bollywood',
      'Books & Literature', 'Art & Design', 'Photography',
      'Animation', 'Theater', 'Podcasts',
    ],
  },
  {
    section: 'Ideas & Society',
    icon: '🧠',
    items: [
      'Philosophy', 'Ethics', 'Politics', 'Economics',
      'Psychology', 'History', 'Law & Justice',
      'Environment', 'Sociology', 'Religion & Spirituality',
    ],
  },
  {
    section: 'Tech & Future',
    icon: '🚀',
    items: [
      'Artificial Intelligence', 'Space Exploration',
      'Startups', 'Cybersecurity', 'Crypto & Web3',
      'Robotics', 'Climate Tech', 'Biotech',
      'Gaming', 'Social Media & Privacy',
    ],
  },
];

// ─── Main component ────────────────────────────────────────────────────────

export default function OnboardingFlowScreen({ navigation, route }: Props) {
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState(route.params?.suggestedUsername ?? '');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const slideAnim = useRef(new Animated.Value(0)).current;

  // ── Derived validity ─────────────────────────────────────────────────────

  const cleaned = username.trim();
  const usernameValid =
    cleaned.length >= MIN_USERNAME &&
    cleaned.length <= MAX_USERNAME &&
    USERNAME_RE.test(cleaned);
  // Require at least 1 pick from every section
  const topicsValid = TOPICS.every(group =>
    group.items.some(item => selected.has(item))
  );

  const canAdvance =
    step === 0 ? usernameValid :
      step === 1 ? topicsValid :
        true;

  // ── Step navigation ──────────────────────────────────────────────────────

  const snapTo = (s: number, velocity = 0) => {
    Animated.spring(slideAnim, {
      toValue: -s * WIDTH,
      useNativeDriver: true,
      tension: 68,
      friction: 13,
      velocity,
    }).start();
  };

  const goNext = async () => {
    if (!canAdvance || submitting) return;
    if (step === TOTAL_STEPS - 1) {
      setSubmitError(null);
      setSubmitting(true);
      try {
        await completeOnboarding(cleaned);
        navigation.replace('Main');
      } catch (err: any) {
        setSubmitError(err?.message ?? 'Could not save your username. Please try again.');
      } finally {
        setSubmitting(false);
      }
      return;
    }
    const next = step + 1;
    setStep(next);
    snapTo(next);
  };

  const goBack = () => {
    if (step === 0) {
      navigation.goBack();
      return;
    }
    const prev = step - 1;
    setStep(prev);
    snapTo(prev);
  };

  // ── Swipe gesture ────────────────────────────────────────────────────────

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 1.8,
        onPanResponderMove: (_, g) => {
          const base = -step * WIDTH;
          const drag = g.dx;
          // Resist over-dragging at the edges
          const atStart = step === 0 && drag > 0;
          const atEnd = step === TOTAL_STEPS - 1 && drag < 0;
          const resistance = atStart || atEnd ? 0.25 : 1;
          slideAnim.setValue(base + drag * resistance);
        },
        onPanResponderRelease: (_, g) => {
          const threshold = WIDTH * 0.3;
          if (g.dx < -threshold && step < TOTAL_STEPS - 1 && canAdvance) {
            const next = step + 1;
            setStep(next);
            snapTo(next, g.vx);
          } else if (g.dx > threshold && step > 0) {
            const prev = step - 1;
            setStep(prev);
            snapTo(prev, g.vx);
          } else {
            snapTo(step);
          }
        },
      }),
    [step, canAdvance],
  );

  // ── Topic toggle ─────────────────────────────────────────────────────────

  const toggleTopic = (item: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(item) ? next.delete(item) : next.add(item);
      return next;
    });
  };

  // ── CTA label ────────────────────────────────────────────────────────────

  const ctaLabel =
    step === 0 ? 'Continue' :
      step === 1 ? `Continue${selected.size > 0 ? ` (${selected.size})` : ''}` :
        'Enter Arena';

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar style="light" />

      {/* ── Top bar ── */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={goBack} hitSlop={8}>
          <Text variant="titleLg">←</Text>
        </TouchableOpacity>

        <View style={s.progressRow}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View
              key={i}
              style={[
                s.progressSeg,
                i < step && s.progressDone,
                i === step && s.progressActive,
              ]}
            />
          ))}
        </View>
      </View>

      {/* ── Swipeable step area ── */}
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={s.viewport} {...panResponder.panHandlers}>
          <Animated.View
            style={[s.stepsRow, { transform: [{ translateX: slideAnim }] }]}
          >
            <StepUsername
              username={username}
              setUsername={setUsername}
              valid={usernameValid}
              tooShort={cleaned.length > 0 && cleaned.length < MIN_USERNAME}
              badChars={cleaned.length >= MIN_USERNAME && !USERNAME_RE.test(cleaned)}
              maxLen={MAX_USERNAME}
            />
            <StepTopics selected={selected} onToggle={toggleTopic} />
            <StepReady username={cleaned} topicCount={selected.size} />
          </Animated.View>
        </View>

        {/* ── Footer CTA ── */}
        <View style={s.footer}>
          {submitError && (
            <Text variant="bodySm" tone="danger" style={s.submitError}>
              {submitError}
            </Text>
          )}
          <Button
            label={ctaLabel}
            onPress={goNext}
            shadowColor={colors.lime}
            disabled={!canAdvance || submitting}
            isLoading={submitting}
            arrow
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Step 1: Username ──────────────────────────────────────────────────────

type StepUsernameProps = {
  username: string;
  setUsername: (v: string) => void;
  valid: boolean;
  tooShort: boolean;
  badChars: boolean;
  maxLen: number;
};

function StepUsername({ username, setUsername, valid, tooShort, badChars, maxLen }: StepUsernameProps) {
  const cleaned = username.trim();
  return (
    <View style={s.step}>
      <Text variant="overline" tone="accent" style={s.stepLabel}>STEP 1 OF 3</Text>
      <Text variant="displayMd" style={s.headline}>Pick your{'\n'}username</Text>
      <Text variant="bodyLg" tone="muted" style={s.subhead}>
        This is how you'll appear in every debate.
      </Text>

      <View style={[s.field, valid && s.fieldOk, (tooShort || badChars) && s.fieldErr]}>
        <Text variant="labelMd" tone="subtle" style={s.atSign}>@</Text>
        <TextInput
          style={s.input}
          value={username}
          onChangeText={setUsername}
          placeholder="yourname"
          placeholderTextColor={colors.textSubtle}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={maxLen + 2}
          returnKeyType="done"
        />
        {valid && (
          <View style={s.tick}>
            <Text variant="labelSm" tone="inverse">✓</Text>
          </View>
        )}
      </View>

      <Text variant="bodySm" tone={badChars ? 'danger' : 'subtle'} style={s.hint}>
        {tooShort
          ? `At least ${MIN_USERNAME} characters`
          : badChars
            ? 'Letters, numbers and _ only'
            : `${cleaned.length}/${maxLen}`}
      </Text>
    </View>
  );
}

// ─── Step 2: Topics ────────────────────────────────────────────────────────

type StepTopicsProps = {
  selected: Set<string>;
  onToggle: (item: string) => void;
};

function StepTopics({ selected, onToggle }: StepTopicsProps) {
  const sectionsComplete = TOPICS.filter(g =>
    g.items.some(item => selected.has(item))
  ).length;

  return (
    <View style={s.step}>
      <Text variant="overline" tone="accent" style={s.stepLabel}>STEP 2 OF 3</Text>
      <Text variant="displayMd" style={s.headline}>What do you{'\n'}want to debate?</Text>
      <Text variant="bodyLg" tone="muted" style={s.subheadTopics}>
        Pick at least one topic per section.{' '}
        <Text variant="bodyLg" tone="accent">{sectionsComplete}/{TOPICS.length} done</Text>
      </Text>

      <ScrollView
        style={s.topicsScroll}
        contentContainerStyle={s.topicsContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        {TOPICS.map(group => {
          const sectionDone = group.items.some(item => selected.has(item));
          return (
            <View key={group.section} style={s.topicSection}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionIcon}>{group.icon}</Text>
                <Text variant="titleMd" style={s.sectionTitle}>{group.section}</Text>
                {sectionDone && (
                  <View style={s.sectionCheck}>
                    <Text variant="labelSm" tone="inverse">✓</Text>
                  </View>
                )}
              </View>
              <View style={s.pillGrid}>
                {group.items.map(item => {
                  const on = selected.has(item);
                  return (
                    <View key={item} style={s.pillWrap}>
                      {on && <View style={s.pillShadow} />}
                      <Pressable
                        onPress={() => onToggle(item)}
                        style={[s.pill, on && s.pillOn]}
                      >
                        <Text
                          variant="labelSm"
                          style={on ? s.pillTextOn : s.pillText}
                        >
                          {item}
                        </Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ─── Step 3: Ready ─────────────────────────────────────────────────────────

type StepReadyProps = {
  username: string;
  topicCount: number;
};

function StepReady({ username, topicCount }: StepReadyProps) {
  return (
    <View style={[s.step, s.stepReady]}>
      <Text variant="overline" tone="accent" style={s.stepLabel}>STEP 3 OF 3</Text>

      <Text variant="displayLg" style={s.readyHeadline}>
        You're in
      </Text>
      <Text variant="titleLg" style={s.readyHeadline}>
        {username ? `${username}` : ''}
      </Text>

      <Text variant="bodyLg" tone="muted" style={s.readySub}>
        Let the best argument win.
      </Text>

      <View style={s.readyImageArea}>
        <Image
          source={require('../assets/allset.png')}
          style={s.readyImage}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const HORIZONTAL = 24;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.black },
  flex: { flex: 1 },

  // ── Top bar ──
  topBar: {
    paddingHorizontal: HORIZONTAL,
    paddingTop: spacing.sm,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  progressSeg: {
    width: 54,
    height: 5,
    borderRadius: 8,
    backgroundColor: colors.surface2,
  },
  progressDone: {
    backgroundColor: colors.lime,
    opacity: 0.45,
  },
  progressActive: {
    backgroundColor: colors.lime,
  },

  // ── Viewport + slide ──
  viewport: {
    flex: 1,
    overflow: 'hidden',
  },
  stepsRow: {
    flexDirection: 'row',
    width: WIDTH * TOTAL_STEPS,
    flex: 1,
  },
  step: {
    width: WIDTH,
    paddingHorizontal: HORIZONTAL,
    paddingTop: spacing.xl,
  },
  stepReady: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 0,
  },

  // ── Step common ──
  stepLabel: {
    marginBottom: spacing.lg,
  },
  headline: {
    marginBottom: spacing.md,
  },
  subhead: {
    marginBottom: spacing.xxl,
  },
  subheadTopics: {
    marginBottom: spacing.lg,
  },

  // ── Username step ──
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  fieldOk: { borderColor: colors.lime },
  fieldErr: { borderColor: colors.red },
  atSign: { lineHeight: 20 },
  input: {
    ...text.titleSm,
    flex: 1,
    color: colors.text,
  },
  tick: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: { paddingHorizontal: 4 },

  // ── Topics step ──
  topicsScroll: { flex: 1 },
  topicsContent: { paddingBottom: spacing.lg },
  topicSection: { marginBottom: spacing.xl },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionIcon: { fontSize: 18 },
  sectionTitle: { flex: 1 },
  sectionCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  // Neo-brutalist pill wrapper: creates room for the offset shadow
  pillWrap: {
    paddingRight: 3,
    paddingBottom: 3,
    position: 'relative',
  },
  // Static lime shadow shown only when pill is selected
  pillShadow: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: 0,
    bottom: 0,
    borderRadius: 999,
    backgroundColor: colors.limeMuted,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  pillOn: {
    backgroundColor: colors.text,
    borderColor: colors.black,
    borderWidth: 1.5,
  },
  pillText: { color: colors.textMuted },
  pillTextOn: { color: colors.black },

  // ── Ready step ──
  readyHeadline: {
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  readySub: {
    textAlign: 'center',
    marginBottom: spacing.xl,
    maxWidth: 280,
  },
  readyImageArea: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  readyImage: {
    width: '100%',
    height: '100%',
  },

  // ── Footer CTA ──
  footer: {
    paddingHorizontal: HORIZONTAL,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
  submitError: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
});
