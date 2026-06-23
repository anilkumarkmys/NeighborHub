export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api/v1';

export const POST_CATEGORIES = [
  { key: 'general', label: 'General', icon: 'home' },
  { key: 'safety', label: 'Safety & Emergency', icon: 'shield-alert' },
  { key: 'events', label: 'Events', icon: 'calendar' },
  { key: 'marketplace', label: 'For Sale & Free', icon: 'tag' },
  { key: 'recommendations', label: 'Recommendations', icon: 'thumbs-up' },
  { key: 'lost_found', label: 'Lost & Found', icon: 'search' },
  { key: 'help_request', label: 'Help Request', icon: 'help-circle' },
  { key: 'announcement', label: 'Announcement', icon: 'megaphone' },
] as const;

export const MARKETPLACE_CATEGORIES = [
  'Electronics',
  'Furniture',
  'Clothing',
  'Books & Media',
  'Garden & Outdoor',
  'Baby & Kids',
  'Sports & Recreation',
  'Tools',
  'Household',
  'Vehicles',
  'Other',
] as const;

export const ITEM_CONDITIONS = [
  { key: 'new', label: 'New' },
  { key: 'like_new', label: 'Like New' },
  { key: 'good', label: 'Good' },
  { key: 'fair', label: 'Fair' },
  { key: 'poor', label: 'Poor' },
] as const;

export const REPORT_REASONS = [
  { key: 'spam', label: 'Spam or Scam' },
  { key: 'harassment', label: 'Harassment or Bullying' },
  { key: 'misinformation', label: 'Misinformation' },
  { key: 'inappropriate', label: 'Inappropriate Content' },
  { key: 'other', label: 'Other' },
] as const;

export const EVENT_CATEGORIES = [
  'Community',
  'Sports & Fitness',
  'Arts & Culture',
  'Food & Drink',
  'Learning',
  'Volunteering',
  'Yard Sale',
  'Other',
] as const;

export const COLORS = {
  primary: '#00B060',
  primaryDark: '#008040',
  primaryLight: '#E6F7F0',
  secondary: '#2D3748',
  accent: '#F6C344',
  background: '#F7F8FA',
  surface: '#FFFFFF',
  error: '#E53E3E',
  warning: '#DD6B20',
  success: '#38A169',
  info: '#3182CE',
  text: '#1A202C',
  textSecondary: '#718096',
  border: '#E2E8F0',
  divider: '#EDF2F7',
  safety: '#E53E3E',
  event: '#805AD5',
  marketplace: '#D69E2E',
  lost_found: '#2B6CB0',
  help_request: '#C05621',
  announcement: '#2C7A7B',
  general: '#4A5568',
  recommendations: '#2F855A',
};

export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

export const AUTH = {
  ACCESS_TOKEN_EXPIRY: 15 * 60,
  REFRESH_TOKEN_EXPIRY: 30 * 24 * 60 * 60,
  OTP_EXPIRY: 10 * 60,
};

export const APP_CONFIG = {
  name: 'NeighborHub',
  customerAppId: 'com.neighborhub.customer',
  adminAppId: 'com.neighborhub.admin',
  supportEmail: 'support@neighborhub.com',
  privacyUrl: 'https://neighborhub.com/privacy',
  termsUrl: 'https://neighborhub.com/terms',
};
