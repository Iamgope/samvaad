import React from 'react';
import { View, StyleSheet, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { colors } from '../../constants/colors';
import { Text } from '../Text';
import { StarIcon } from '../Icons';
import { TIERS, TIER_COLOR, getTierInfo } from '../../constants/tiers';

const DEFAULT_AVATAR = require('../../assets/defaultprofilepic.png');

type Props = {
  name: string;
  handle: string;
  rating: number;
  avatarUri: string | null;
};

export const ShareCard = React.forwardRef<View, Props>(
  ({ name, handle, rating, avatarUri }, ref) => {
    const { current } = getTierInfo(rating);
    const tierColor = TIER_COLOR[current.key] ?? colors.text;
    const tierIdx = Math.max(0, TIERS.findIndex(t => t.key === current.key));
    const topAlpha = ['55', '70', '88', 'AA'][tierIdx];
    const avatarSource = avatarUri ? { uri: avatarUri } : DEFAULT_AVATAR;

    return (
      <View ref={ref} collapsable={false} style={styles.card}>
        <LinearGradient
          colors={[tierColor + topAlpha, colors.black]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.body}>
          <Text style={[styles.tier, { color: tierColor }]}>
            {current.label.toUpperCase()}
          </Text>

          <View style={[styles.avatar, { borderColor: tierColor }]}>
            <Image source={avatarSource} style={styles.avatarImage} resizeMode="cover" />
          </View>

          <Text variant="displayMd" style={styles.name}>{name}</Text>
          <Text variant="bodySm" tone="muted">{handle}</Text>

          <View style={styles.ratingRow}>
            <StarIcon size={20} color={tierColor} />
            <Text style={[styles.rating, { color: colors.text }]}>{rating}</Text>
          </View>

          <Text variant="caption" tone="subtle" style={styles.brand}>SAMVAAD</Text>
        </View>
      </View>
    );
  }
);

export async function shareProfileCard(
  ref: React.RefObject<View | null>,
  name: string,
) {
  try {
    if (!ref.current) return;
    const uri = await captureRef(ref, { format: 'png', quality: 1, result: 'tmpfile' });
    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      Alert.alert('Sharing unavailable', 'Sharing is not available on this device.');
      return;
    }
    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      dialogTitle: `${name}'s Samvaad profile`,
    });
  } catch {
    Alert.alert('Could not share', 'Something went wrong while creating the share image.');
  }
}

const styles = StyleSheet.create({
  card: {
    width: 360,
    height: 540,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.black,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 36,
    gap: 12,
  },
  tier: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 24,
    borderWidth: 3,
    overflow: 'hidden',
    backgroundColor: colors.surface2,
    marginBottom: 12,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  name: {
    textAlign: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  rating: {
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  brand: {
    position: 'absolute',
    bottom: 24,
    letterSpacing: 3,
  },
});
