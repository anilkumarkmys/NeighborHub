import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@nextdoor-clone/shared';
import { RootState } from '../store';

import FeedScreen from '../screens/feed/FeedScreen';
import PostDetailScreen from '../screens/feed/PostDetailScreen';
import CreatePostScreen from '../screens/feed/CreatePostScreen';
import EventsScreen from '../screens/events/EventsScreen';
import EventDetailScreen from '../screens/events/EventDetailScreen';
import CreateEventScreen from '../screens/events/CreateEventScreen';
import MarketplaceScreen from '../screens/marketplace/MarketplaceScreen';
import ListingDetailScreen from '../screens/marketplace/ListingDetailScreen';
import CreateListingScreen from '../screens/marketplace/CreateListingScreen';
import ConversationsScreen from '../screens/messages/ConversationsScreen';
import ChatScreen from '../screens/messages/ChatScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import NeighborsMapScreen from '../screens/neighbors/NeighborsMapScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import SafetyAlertsScreen from '../screens/safety/SafetyAlertsScreen';
import NeighborProfileScreen from '../screens/neighbors/NeighborProfileScreen';

export type FeedStackParamList = {
  FeedScreen: undefined;
  PostDetail: { postId: string };
  CreatePost: undefined;
  SafetyAlerts: undefined;
  NeighborProfile: { userId: string };
};

export type EventsStackParamList = {
  EventsScreen: undefined;
  EventDetail: { eventId: string };
  CreateEvent: undefined;
};

export type MarketplaceStackParamList = {
  MarketplaceScreen: undefined;
  ListingDetail: { listingId: string };
  CreateListing: undefined;
};

export type MessagesStackParamList = {
  ConversationsScreen: undefined;
  ChatScreen: { conversationId: string; recipientName: string };
};

export type ProfileStackParamList = {
  ProfileScreen: undefined;
  Settings: undefined;
  Notifications: undefined;
  NeighborsMap: undefined;
};

const Tab = createBottomTabNavigator();
const FeedStack = createNativeStackNavigator<FeedStackParamList>();
const EventsStack = createNativeStackNavigator<EventsStackParamList>();
const MarketplaceStack = createNativeStackNavigator<MarketplaceStackParamList>();
const MessagesStack = createNativeStackNavigator<MessagesStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

function FeedNavigator() {
  return (
    <FeedStack.Navigator>
      <FeedStack.Screen name="FeedScreen" component={FeedScreen} options={{ title: 'NeighborHub', headerTintColor: COLORS.primary }} />
      <FeedStack.Screen name="PostDetail" component={PostDetailScreen} options={{ title: 'Post' }} />
      <FeedStack.Screen name="CreatePost" component={CreatePostScreen} options={{ title: 'New Post' }} />
      <FeedStack.Screen name="SafetyAlerts" component={SafetyAlertsScreen} options={{ title: 'Safety & Emergency' }} />
      <FeedStack.Screen name="NeighborProfile" component={NeighborProfileScreen} options={{ title: 'Profile' }} />
    </FeedStack.Navigator>
  );
}

function EventsNavigator() {
  return (
    <EventsStack.Navigator>
      <EventsStack.Screen name="EventsScreen" component={EventsScreen} options={{ title: 'Events' }} />
      <EventsStack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: 'Event' }} />
      <EventsStack.Screen name="CreateEvent" component={CreateEventScreen} options={{ title: 'Create Event' }} />
    </EventsStack.Navigator>
  );
}

function MarketplaceNavigator() {
  return (
    <MarketplaceStack.Navigator>
      <MarketplaceStack.Screen name="MarketplaceScreen" component={MarketplaceScreen} options={{ title: 'For Sale & Free' }} />
      <MarketplaceStack.Screen name="ListingDetail" component={ListingDetailScreen} options={{ title: 'Listing' }} />
      <MarketplaceStack.Screen name="CreateListing" component={CreateListingScreen} options={{ title: 'Create Listing' }} />
    </MarketplaceStack.Navigator>
  );
}

function MessagesNavigator() {
  return (
    <MessagesStack.Navigator>
      <MessagesStack.Screen name="ConversationsScreen" component={ConversationsScreen} options={{ title: 'Messages' }} />
      <MessagesStack.Screen name="ChatScreen" component={ChatScreen} options={({ route }) => ({ title: route.params.recipientName })} />
    </MessagesStack.Navigator>
  );
}

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen name="ProfileScreen" component={ProfileScreen} options={{ title: 'My Profile' }} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      <ProfileStack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <ProfileStack.Screen name="NeighborsMap" component={NeighborsMapScreen} options={{ title: 'My Neighbors' }} />
    </ProfileStack.Navigator>
  );
}

function BadgeIcon({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
}

export default function MainNavigator() {
  const unreadMessages = useSelector((state: RootState) => state.messages.unreadCount);
  const unreadNotifications = useSelector((state: RootState) => state.notifications.unreadCount);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: { backgroundColor: COLORS.surface, borderTopColor: COLORS.border },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, { focused: string; unfocused: string }> = {
            Feed: { focused: 'home', unfocused: 'home-outline' },
            Events: { focused: 'calendar', unfocused: 'calendar-outline' },
            Marketplace: { focused: 'pricetag', unfocused: 'pricetag-outline' },
            Messages: { focused: 'chatbubbles', unfocused: 'chatbubbles-outline' },
            Profile: { focused: 'person', unfocused: 'person-outline' },
          };
          const iconSet = icons[route.name] || icons.Feed;
          const iconName = focused ? iconSet.focused : iconSet.unfocused;
          return <Ionicons name={iconName as never} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Feed" component={FeedNavigator} />
      <Tab.Screen name="Events" component={EventsNavigator} />
      <Tab.Screen name="Marketplace" component={MarketplaceNavigator} />
      <Tab.Screen
        name="Messages"
        component={MessagesNavigator}
        options={{
          tabBarBadge: unreadMessages > 0 ? unreadMessages : undefined,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          tabBarBadge: unreadNotifications > 0 ? unreadNotifications : undefined,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
