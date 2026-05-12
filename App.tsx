import React from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Archivo_700Bold,
  Archivo_800ExtraBold,
  Archivo_900Black,
} from '@expo-google-fonts/archivo';
import {
  InstrumentSerif_400Regular,
  InstrumentSerif_400Regular_Italic,
} from '@expo-google-fonts/instrument-serif';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_400Regular_Italic,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import * as Notifications from 'expo-notifications';
import OnboardingScreen from './screens/OnboardingScreen';
import LoginScreen from './screens/LoginScreen';
import PhoneScreen from './screens/PhoneScreen';
import OTPScreen from './screens/OTPScreen';
import OnboardingFlowScreen from './screens/OnboardingFlowScreen';
import TopicScreen from './screens/TopicScreen';
import DebateScreen from './screens/DebateScreen';
import JoinDebateScreen from './screens/JoinDebateScreen';
import EditProfileScreen, { type EditableProfile } from './screens/EditProfileScreen';
import AllTrophiesScreen from './screens/AllTrophiesScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import HelpSupportScreen from './screens/HelpSupportScreen';
import type { Badge } from './components/profile/TrophyCase';
import { TabNavigator } from './navigation/TabNavigator';
import { colors } from './constants/colors';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Phone: undefined;
  OTP: { phone: string };
  OnboardingFlow: undefined;
  Main: undefined;
  TopicScreen: { category: string };
  Debate: { debateId: string; categoryId: string; motion: string; debating: number };
  JoinDebate: { topicId?: string; stanceId?: string } | undefined;
  EditProfile: {
    initial: EditableProfile;
    onSave: (next: EditableProfile) => void;
  };
  AllTrophies: { badges: Badge[] };
  PrivacyPolicy: undefined;
  HelpSupport: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Override the default (white) navigation theme background. This is what shows
// through during fade transitions when one screen is unmounting and the next
// has not yet painted — without it, you get a brief white flash on every push.
const navTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.black },
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Archivo_700Bold,
    Archivo_800ExtraBold,
    Archivo_900Black,
    InstrumentSerif_400Regular,
    InstrumentSerif_400Regular_Italic,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_400Regular_Italic,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.black }} />;
  }

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: colors.black }}>
        <NavigationContainer theme={navTheme}>
          <StatusBar style="light" />
          <Stack.Navigator
            initialRouteName="Main"
            screenOptions={{
              headerShown: false,
              animation: 'fade',
              animationDuration: 150,
              contentStyle: { backgroundColor: colors.black },
            }}
          >
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Phone" component={PhoneScreen} />
            <Stack.Screen name="OTP" component={OTPScreen} />
            <Stack.Screen name="OnboardingFlow" component={OnboardingFlowScreen} />
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="TopicScreen" component={TopicScreen} />
            <Stack.Screen name="Debate" component={DebateScreen} />
            <Stack.Screen name="JoinDebate" component={JoinDebateScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="AllTrophies" component={AllTrophiesScreen} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
            <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}
