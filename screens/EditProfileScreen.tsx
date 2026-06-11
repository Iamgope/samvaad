import React, { useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import { spacing, SCREEN_PADDING } from '../constants/spacing';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { IconButton } from '../components/IconButton';
import { ChevronLeftIcon, EditIcon } from '../components/Icons';
import { pickSquareImage } from '../utils/imagePicker';
import { updateUserProfile } from '../services/api';
import type { RootStackParamList } from '../App';

const DEFAULT_AVATAR = require('../assets/defaultprofilepic.png');

const MAX_NAME = 40;
const MAX_HANDLE = 20;
const MAX_BIO = 160;

export type EditableProfile = {
  name: string;
  handle: string;
  bio: string | null;
  avatarUri: string | null;
};

export default function EditProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'EditProfile'>>();
  const { initial, onSave } = route.params;

  const [name, setName] = useState(initial.name);
  const [handle, setHandle] = useState(initial.handle.replace(/^@/, ''));
  const [bio, setBio] = useState(initial.bio ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(initial.avatarUri);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const cleanedHandle = handle.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  const handleInvalid = cleanedHandle.length === 0;
  const nameInvalid = name.trim().length === 0;
  const canSave = !nameInvalid && !handleInvalid && !saving;

  const handlePickAvatar = async () => {
    const uri = await pickSquareImage();
    if (uri) setAvatarUri(uri);
  };

  const handleSave = async () => {
    if (!canSave) return;
    const trimmedName = name.trim();
    const trimmedBio = bio.trim() || null;
    setSaving(true);
    setSaveError(null);
    try {
      await updateUserProfile({
        name: trimmedName,
        username: cleanedHandle,
        bio: trimmedBio,
        profilePicUri: avatarUri,
      });
      onSave({
        name: trimmedName,
        handle: `@${cleanedHandle}`,
        bio: trimmedBio,
        avatarUri,
      });
      navigation.goBack();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Could not save changes');
    } finally {
      setSaving(false);
    }
  };

  const avatarSource = avatarUri ? { uri: avatarUri } : DEFAULT_AVATAR;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <IconButton
          size="md"
          icon={<ChevronLeftIcon size={18} color={colors.text} />}
          onPress={() => navigation.goBack()}
          accent={colors.text}
        />
        <Text variant="titleLg">Edit profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar */}
          <View style={s.avatarSection}>
            <TouchableOpacity
              style={s.avatar}
              onPress={handlePickAvatar}
              activeOpacity={0.85}
            >
              <Image source={avatarSource} style={s.avatarImage} resizeMode="cover" />
              <View style={s.avatarBadge}>
                <EditIcon size={14} color={colors.black} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePickAvatar} activeOpacity={0.6}>
              <Text variant="labelSm" tone="muted">Change photo</Text>
            </TouchableOpacity>
          </View>

          {/* Name */}
          <Field
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            maxLength={MAX_NAME}
            error={nameInvalid ? 'Name cannot be empty' : null}
            counter={`${name.length}/${MAX_NAME}`}
          />

          {/* Username */}
          <Field
            label="Username"
            value={handle}
            onChangeText={setHandle}
            placeholder="yourname"
            maxLength={MAX_HANDLE}
            prefix="@"
            autoCapitalize="none"
            autoCorrect={false}
            error={handleInvalid ? 'Letters, numbers and _ only' : null}
            counter={`${cleanedHandle.length}/${MAX_HANDLE}`}
          />

          {/* Bio */}
          <Field
            label="Bio"
            value={bio}
            onChangeText={setBio}
            placeholder="Tell people what you debate about"
            maxLength={MAX_BIO}
            multiline
            counter={`${bio.length}/${MAX_BIO}`}
          />

          <View style={{ height: spacing.xl }} />

          {saveError && (
            <Text variant="bodySm" tone="danger" style={s.saveError}>
              {saveError}
            </Text>
          )}

          <Button
            variant="pillBrand"
            label={saving ? 'Saving…' : 'Save changes'}
            onPress={handleSave}
            disabled={!canSave}
            shadowColor={colors.limeMuted}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── FIELD ─────────────────────────────────────────────────────────

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  maxLength,
  prefix,
  multiline,
  autoCapitalize = 'sentences',
  autoCorrect = true,
  error,
  counter,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  maxLength?: number;
  prefix?: string;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  error?: string | null;
  counter?: string;
}) {
  return (
    <View style={f.wrap}>
      <Text variant="labelSm" tone="subtle" style={f.label}>
        {label.toUpperCase()}
      </Text>
      <View style={[f.field, multiline && f.fieldMulti, error && f.fieldErr]}>
        {prefix && (
          <Text variant="bodyMd" tone="muted" style={f.prefix}>{prefix}</Text>
        )}
        <TextInput
          style={[f.input, multiline && f.inputMulti]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSubtle}
          maxLength={maxLength}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          returnKeyType={multiline ? 'default' : 'done'}
        />
      </View>
      <View style={f.metaRow}>
        <Text variant="bodySm" tone={error ? 'danger' : 'subtle'}>
          {error ?? ' '}
        </Text>
        {counter && (
          <Text variant="bodySm" tone="subtle">{counter}</Text>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.black },
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
  avatarSection: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    overflow: 'hidden',
    backgroundColor: colors.surface2,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarBadge: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.black,
  },
  saveError: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
});

const f = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
    letterSpacing: 1.2,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  fieldMulti: {
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    minHeight: 110,
  },
  fieldErr: { borderColor: colors.red },
  prefix: {
    paddingTop: 1,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    paddingVertical: 0,
  },
  inputMulti: {
    minHeight: 84,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 4,
  },
});
