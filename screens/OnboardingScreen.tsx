import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
};

const { width: W } = Dimensions.get('window');

const PURPLE = '#6B5CE7';
const GREEN  = '#B5FF00';
const DARK   = '#0D0D0D';
const WHITE  = '#FFFFFF';
const GAP    = 9;

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 1 — Crossed swords / pencils
// ─────────────────────────────────────────────────────────────────────────────
function SwordsIllustration() {
  return (
    <View style={il.wrap}>
      <View style={[il.circle, { backgroundColor: 'rgba(0,0,0,0.22)' }]}>
        <View style={[il.compassDot, { top: 14, left: '50%', marginLeft: -3 }]} />
        <View style={[il.compassDot, { bottom: 14, left: '50%', marginLeft: -3 }]} />
        <View style={[il.compassDot, { left: 14, top: '50%', marginTop: -3 }]} />
        <View style={[il.compassDot, { right: 14, top: '50%', marginTop: -3 }]} />
        <View style={[il.sword, { backgroundColor: GREEN, transform: [{ rotate: '-45deg' }] }]}>
          <View style={[il.grip, { backgroundColor: 'rgba(0,0,0,0.3)' }]} />
        </View>
        <View style={[il.sword, { backgroundColor: 'rgba(210,205,255,0.55)', transform: [{ rotate: '45deg' }] }]}>
          <View style={[il.grip, { backgroundColor: 'rgba(255,255,255,0.15)' }]} />
        </View>
        <View style={il.pivot} />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 2 — Category cards
// ─────────────────────────────────────────────────────────────────────────────
const CATS = [
  { name: 'Mela',     sub: 'Culture · Society',                bg: '#B06030', emoji: '🎪' },
  { name: 'Sports',   sub: 'Cricket · Football',               bg: '#2E5DB5', emoji: '⚽' },
  { name: 'Politics', sub: 'Power · Policy',                   bg: '#7A1F2A', emoji: '🏛️' },
  { name: 'Ideas',    sub: 'Philosophy · Tech',                bg: '#5048C8', emoji: '💡' },
  { name: 'Misc',     sub: 'Everything else · Wildcard topics', bg: '#1E1E1E', emoji: '🎲' },
];

function CategoriesGrid() {
  return (
    <View style={il.catGrid}>
      <View style={il.catRow}>
        {CATS.slice(0, 2).map(c => (
          <View key={c.name} style={[il.catCard, { backgroundColor: c.bg }]}>
            <View>
              <Text style={il.catName}>{c.name}</Text>
              <Text style={il.catSub}>{c.sub}</Text>
            </View>
            <Text style={il.catEmoji}>{c.emoji}</Text>
          </View>
        ))}
      </View>
      <View style={il.catRow}>
        {CATS.slice(2, 4).map(c => (
          <View key={c.name} style={[il.catCard, { backgroundColor: c.bg }]}>
            <View>
              <Text style={il.catName}>{c.name}</Text>
              <Text style={il.catSub}>{c.sub}</Text>
            </View>
            <Text style={il.catEmoji}>{c.emoji}</Text>
          </View>
        ))}
      </View>
      <View style={il.catRow}>
        <View style={[il.catCard, il.catWide, { backgroundColor: CATS[4].bg }]}>
          <View>
            <Text style={il.catName}>{CATS[4].name}</Text>
            <Text style={il.catSub}>{CATS[4].sub}</Text>
          </View>
          <Text style={il.catEmoji}>{CATS[4].emoji}</Text>
        </View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 3 — Ranking podium
// ─────────────────────────────────────────────────────────────────────────────
function RankingIllustration() {
  const BARS = [
    { label: '2',   height: 68,  bg: 'rgba(107,92,231,0.7)',   textColor: WHITE },
    { label: 'YOU', height: 100, bg: GREEN,                    textColor: DARK  },
    { label: '3',   height: 46,  bg: 'rgba(255,255,255,0.18)', textColor: WHITE },
  ];
  return (
    <View style={il.wrap}>
      <View style={[il.circle, { backgroundColor: 'rgba(107,92,231,0.18)' }]}>
        <Text style={il.crown}>👑</Text>
        <Text style={[il.star, { top: 26, left: 36 }]}>✦</Text>
        <Text style={[il.star, { top: 20, right: 40 }]}>✦</Text>
        <Text style={[il.star, { top: 50, right: 26, fontSize: 9 }]}>✦</Text>
        <View style={il.podiumRow}>
          {BARS.map((b, i) => (
            <View key={i} style={il.podiumCol}>
              <View style={[il.podiumBar, { height: b.height, backgroundColor: b.bg }]}>
                <Text style={[il.podiumLabel, { color: b.textColor }]}>{b.label}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={il.podiumFloor} />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE CONFIG
// ─────────────────────────────────────────────────────────────────────────────
type Slide = {
  bg: string;
  label: string;
  labelColor: string;
  pre: string;
  accent: string;
  body: string;
  activeDot: string;
  Illus: () => React.JSX.Element;
};

const SLIDES: Slide[] = [
  {
    bg: PURPLE,
    label: 'WELCOME',
    labelColor: GREEN,
    pre: 'Say what you\nactually ',
    accent: 'think.',
    body: 'Find people who disagree with you. Argue it out. No trolls. No chaos. Just sharp minds going head to head.',
    activeDot: GREEN,
    Illus: SwordsIllustration,
  },
  {
    bg: DARK,
    label: 'FIND YOUR ARENA',
    labelColor: PURPLE,
    pre: 'Every debate\nmakes\nyou ',
    accent: 'sharper.',
    body: "Pick your arena. Find someone who disagrees. Win or lose — you'll know exactly why you did.",
    activeDot: PURPLE,
    Illus: CategoriesGrid,
  },
  {
    bg: DARK,
    label: 'THE PUNCHLINE',
    labelColor: GREEN,
    pre: "Don't worry,\nwe'll judge ",
    accent: 'you.',
    body: "Lose a round? Good — you'll know exactly why. Every debate sharpens your thinking and builds your rank.",
    activeDot: GREEN,
    Illus: RankingIllustration,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
export default function OnboardingScreen({ navigation }: Props) {
  const [idx, setIdx] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;
  const slide = SLIDES[idx];

  const advance = () => {
    const isLast = idx === SLIDES.length - 1;
    if (isLast) {
      navigation.replace('Login');
      return;
    }
    // Fade out → swap content → fade in
    Animated.timing(fade, { toValue: 0, duration: 140, useNativeDriver: true }).start(() => {
      setIdx(i => i + 1);
      Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    });
  };

  const IllusComponent = slide.Illus;

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: slide.bg }]}>
      {/* Skip */}
      <TouchableOpacity style={s.skipRow} onPress={() => navigation.replace('Login')}>
        <Text style={s.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Illustration */}
      <Animated.View style={[s.illusArea, { opacity: fade }]}>
        <IllusComponent />
      </Animated.View>

      {/* Bottom content */}
      <Animated.View style={[s.content, { opacity: fade }]}>
        <Text style={[s.label, { color: slide.labelColor }]}>{slide.label}</Text>
        <Text style={s.headline}>
          {slide.pre}
          <Text style={{ color: GREEN }}>{slide.accent}</Text>
        </Text>
        <Text style={s.body}>{slide.body}</Text>

        {/* Progress dashes */}
        <View style={s.dotsRow}>
          {SLIDES.map((sl, i) => (
            <View
              key={i}
              style={[
                s.dash,
                i === idx
                  ? { backgroundColor: sl.activeDot, width: 28 }
                  : { backgroundColor: 'rgba(255,255,255,0.22)', width: 8 },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={s.nextBtn} onPress={advance} activeOpacity={0.88}>
          <Text style={s.nextText}>
            {idx === SLIDES.length - 1 ? 'Get Started →' : 'Next →'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ILLUSTRATION STYLES
// ─────────────────────────────────────────────────────────────────────────────
const CIRCLE = 224;

const il = StyleSheet.create({
  wrap: { justifyContent: 'center', alignItems: 'center' },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  compassDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  sword: {
    position: 'absolute',
    width: 11,
    height: 168,
    borderRadius: 7,
  },
  grip: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 34,
    borderRadius: 7,
  },
  pivot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: DARK,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  // Categories
  catGrid: { width: W - 52, gap: GAP },
  catRow: { flexDirection: 'row', gap: GAP },
  catCard: {
    flex: 1,
    height: 84,
    borderRadius: 14,
    padding: 14,
    justifyContent: 'space-between',
  },
  catWide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 70,
  },
  catName: { fontSize: 15, fontWeight: '800', color: WHITE, marginBottom: 3 },
  catSub:  { fontSize: 11, fontWeight: '500', color: 'rgba(255,255,255,0.6)' },
  catEmoji: { fontSize: 24 },
  // Podium
  crown: { position: 'absolute', top: 24, fontSize: 30, zIndex: 2 },
  star:  { position: 'absolute', fontSize: 11, color: 'rgba(181,255,0,0.55)' },
  podiumRow: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  podiumCol: { width: 58, alignItems: 'center' },
  podiumBar: {
    width: 58,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 10,
  },
  podiumLabel: { fontSize: 13, fontWeight: '900' },
  podiumFloor: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN STYLES
// ─────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1 },
  skipRow: {
    paddingHorizontal: 26,
    paddingTop: 12,
    alignItems: 'flex-end',
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
  },
  illusArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 26,
    paddingBottom: 38,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2.2,
    marginBottom: 12,
  },
  headline: {
    fontSize: 38,
    fontWeight: '900',
    color: WHITE,
    lineHeight: 44,
    letterSpacing: -1,
    marginBottom: 14,
  },
  body: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 24,
    fontWeight: '400',
    marginBottom: 26,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    marginBottom: 20,
  },
  dash: { height: 4, borderRadius: 2 },
  nextBtn: {
    backgroundColor: GREEN,
    borderRadius: 16,
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextText: {
    fontSize: 16,
    fontWeight: '900',
    color: DARK,
    letterSpacing: 0.3,
  },
});
