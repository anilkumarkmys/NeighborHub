import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminLoginScreen from '../screens/auth/AdminLoginScreen';

export type AdminAuthStackParamList = {
  AdminLogin: undefined;
};

const Stack = createNativeStackNavigator<AdminAuthStackParamList>();

export default function AdminAuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
    </Stack.Navigator>
  );
}
