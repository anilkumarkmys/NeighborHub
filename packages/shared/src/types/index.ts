export type UserRole = 'customer' | 'admin' | 'moderator';

export type PostCategory =
  | 'general'
  | 'safety'
  | 'events'
  | 'marketplace'
  | 'recommendations'
  | 'lost_found'
  | 'help_request'
  | 'announcement';

export type PostStatus = 'active' | 'flagged' | 'removed' | 'archived';

export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'misinformation'
  | 'inappropriate'
  | 'other';

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  neighborhood?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatar?: string;
  role: UserRole;
  location: Location;
  neighborhood: string;
  neighborhoodId: string;
  bio?: string;
  phone?: string;
  isVerified: boolean;
  isActive: boolean;
  joinedAt: string;
  lastActiveAt: string;
  postCount: number;
  replyCount: number;
  thankCount: number;
}

export interface Neighborhood {
  id: string;
  name: string;
  city: string;
  state: string;
  zip: string;
  boundary: GeoPolygon;
  memberCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface GeoPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

export interface Post {
  id: string;
  authorId: string;
  author: Pick<User, 'id' | 'displayName' | 'avatar' | 'neighborhood'>;
  neighborhoodId: string;
  category: PostCategory;
  title: string;
  content: string;
  images?: string[];
  location?: Location;
  status: PostStatus;
  replyCount: number;
  thankCount: number;
  viewCount: number;
  isThankedByMe?: boolean;
  isPinnedByAdmin?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Reply {
  id: string;
  postId: string;
  parentReplyId?: string;
  authorId: string;
  author: Pick<User, 'id' | 'displayName' | 'avatar'>;
  content: string;
  images?: string[];
  thankCount: number;
  isThankedByMe?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  hostId: string;
  host: Pick<User, 'id' | 'displayName' | 'avatar'>;
  neighborhoodId: string;
  title: string;
  description: string;
  coverImage?: string;
  location: Location;
  startDate: string;
  endDate?: string;
  isOnline: boolean;
  rsvpCount: number;
  isRsvpedByMe?: boolean;
  maxAttendees?: number;
  category: string;
  status: 'upcoming' | 'ongoing' | 'past' | 'cancelled';
  createdAt: string;
}

export interface MarketplaceListing {
  id: string;
  sellerId: string;
  seller: Pick<User, 'id' | 'displayName' | 'avatar' | 'neighborhood'>;
  neighborhoodId: string;
  title: string;
  description: string;
  price: number;
  isFree: boolean;
  images: string[];
  category: string;
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  status: 'available' | 'pending' | 'sold';
  location?: Location;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  images?: string[];
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: Pick<User, 'id' | 'displayName' | 'avatar'>[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'reply' | 'thank' | 'mention' | 'event' | 'safety_alert' | 'system' | 'message';
  title: string;
  body: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reporter: Pick<User, 'id' | 'displayName'>;
  targetType: 'post' | 'reply' | 'user' | 'listing';
  targetId: string;
  reason: ReportReason;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  adminNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface AppVersion {
  id: string;
  platform: 'android' | 'ios' | 'both';
  appType: 'customer' | 'admin';
  version: string;
  buildNumber: number;
  releaseNotes: string;
  downloadUrl?: string;
  isForceUpdate: boolean;
  minSupportedVersion?: string;
  status: 'draft' | 'released' | 'deprecated';
  releasedAt: string;
  createdAt: string;
}

export interface Analytics {
  totalUsers: number;
  activeUsersToday: number;
  activeUsersWeek: number;
  totalPosts: number;
  postsToday: number;
  totalNeighborhoods: number;
  pendingReports: number;
  totalEvents: number;
  totalListings: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
