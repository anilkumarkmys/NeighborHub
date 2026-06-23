import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AddressVerificationScreen from '../screens/onboarding/AddressVerificationScreen';
import OtpVerificationScreen from '../screens/onboarding/OtpVerificationScreen';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import ProfileSetupScreen from '../screens/onboarding/ProfileSetupScreen';

export type OnboardingStackParamList = {
  Welcome: undefined;
  AddressVerification: undefined;
  OtpVerification: { email: string };
  ProfileSetup: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="AddressVerification" component={AddressVerificationScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
    </Stack.Navigator>
  );
}
