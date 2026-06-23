import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import AdminAuthNavigator from './AdminAuthNavigator';
import AdminMainNavigator from './AdminMainNavigator';

export default function AdminRootNavigator() {
  const { isAuthenticated } = useSelector((s: RootState) => s.auth);
  return (
    <NavigationContainer>
      {isAuthenticated ? <AdminMainNavigator /> : <AdminAuthNavigator />}
    </NavigationContainer>
  );
}
