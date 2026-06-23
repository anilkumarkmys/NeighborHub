import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

import DashboardScreen from '../screens/dashboard/DashboardScreen';
import UsersScreen from '../screens/users/UsersScreen';
import UserDetailScreen from '../screens/users/UserDetailScreen';
import ContentModerationScreen from '../screens/content/ContentModerationScreen';
import ReportsScreen from '../screens/reports/ReportsScreen';
import AnalyticsScreen from '../screens/analytics/AnalyticsScreen';
import VersionsScreen from '../screens/versions/VersionsScreen';
import CreateVersionScreen from '../screens/versions/CreateVersionScreen';
import NeighborhoodsScreen from '../screens/neighborhoods/NeighborhoodsScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';

const ADMIN_COLORS = { primary: '#2D3748', accent: '#48BB78', error: '#FC8181', warning: '#F6AD55' };

const Tab = createBottomTabNavigator();
const UsersStack = createNativeStackNavigator();
const ContentStack = createNativeStackNavigator();
const ReportsStack = createNativeStackNavigator();
const VersionsStack = createNativeStackNavigator();
const MoreStack = createNativeStackNavigator();

function UsersNavigator() {
  return (
    <UsersStack.Navigator>
      <UsersStack.Screen name="UsersScreen" component={UsersScreen} options={{ title: 'Users' }} />
      <UsersStack.Screen name="UserDetail" component={UserDetailScreen} options={{ title: 'User Profile' }} />
    </UsersStack.Navigator>
  );
}

function ContentNavigator() {
  return (
    <ContentStack.Navigator>
      <ContentStack.Screen name="ContentModeration" component={ContentModerationScreen} options={{ title: 'Content Moderation' }} />
    </ContentStack.Navigator>
  );
}

function ReportsNavigator() {
  return (
    <ReportsStack.Navigator>
      <ReportsStack.Screen name="ReportsScreen" component={ReportsScreen} options={{ title: 'Reports' }} />
    </ReportsStack.Navigator>
  );
}

function VersionsNavigator() {
  return (
    <VersionsStack.Navigator>
      <VersionsStack.Screen name="VersionsScreen" component={VersionsScreen} options={{ title: 'App Versions' }} />
      <VersionsStack.Screen name="CreateVersion" component={CreateVersionScreen} options={{ title: 'New Version' }} />
    </VersionsStack.Navigator>
  );
}

function MoreNavigator() {
  return (
    <MoreStack.Navigator>
      <MoreStack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      <MoreStack.Screen name="Analytics" component={AnalyticsScreen} options={{ title: 'Analytics' }} />
      <MoreStack.Screen name="Neighborhoods" component={NeighborhoodsScreen} options={{ title: 'Neighborhoods' }} />
      <MoreStack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Push Notifications' }} />
    </MoreStack.Navigator>
  );
}

export default function AdminMainNavigator() {
  const pendingReports = useSelector((s: RootState) => s.reports.reports.filter((r) => r.status === 'pending').length);
  const flaggedCount = useSelector((s: RootState) => s.content.flaggedPosts.length);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: ADMIN_COLORS.accent,
        tabBarInactiveTintColor: '#A0AEC0',
        tabBarStyle: { backgroundColor: ADMIN_COLORS.primary },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, string> = {
            Dashboard: focused ? 'grid' : 'grid-outline',
            Users: focused ? 'people' : 'people-outline',
            Content: focused ? 'shield' : 'shield-outline',
            Reports: focused ? 'flag' : 'flag-outline',
            Versions: focused ? 'layers' : 'layers-outline',
            More: focused ? 'menu' : 'menu-outline',
          };
          return <Ionicons name={(icons[route.name] || 'grid-outline') as never} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Users" component={UsersNavigator} />
      <Tab.Screen
        name="Content"
        component={ContentNavigator}
        options={{ tabBarBadge: flaggedCount > 0 ? flaggedCount : undefined }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsNavigator}
        options={{ tabBarBadge: pendingReports > 0 ? pendingReports : undefined }}
      />
      <Tab.Screen name="Versions" component={VersionsNavigator} />
      <Tab.Screen name="More" component={MoreNavigator} />
    </Tab.Navigator>
  );
}
