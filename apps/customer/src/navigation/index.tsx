import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import { linking } from './linking';

export default function RootNavigator() {
  const { isAuthenticated, isAddressVerified, user } = useSelector(
    (state: RootState) => state.auth
  );

  return (
    <NavigationContainer linking={linking}>
      {!isAuthenticated ? (
        <AuthNavigator />
      ) : !isAddressVerified || !user?.isVerified ? (
        <OnboardingNavigator />
      ) : (
        <MainNavigator />
      )}
    </NavigationContainer>
  );
}
