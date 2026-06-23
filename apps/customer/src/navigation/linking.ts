import { LinkingOptions } from '@react-navigation/native';

export const linking: LinkingOptions<Record<string, object | undefined>> = {
  prefixes: ['neighborhub://', 'https://app.neighborhub.com'],
  config: {
    screens: {
      Main: {
        screens: {
          Feed: {
            screens: {
              FeedScreen: 'feed',
              PostDetail: 'post/:postId',
            },
          },
          Events: {
            screens: {
              EventsScreen: 'events',
              EventDetail: 'event/:eventId',
            },
          },
          Marketplace: {
            screens: {
              MarketplaceScreen: 'marketplace',
              ListingDetail: 'listing/:listingId',
            },
          },
          Messages: {
            screens: {
              ConversationsScreen: 'messages',
              ChatScreen: 'chat/:conversationId',
            },
          },
          Profile: {
            screens: {
              ProfileScreen: 'profile',
              Settings: 'settings',
            },
          },
        },
      },
    },
  },
};
