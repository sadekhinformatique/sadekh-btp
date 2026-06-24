export type Lang = 'fr' | 'wo';
export type View = 'home' | 'listing' | 'favorites' | 'messages' | 'publish' | 'dashboard' | 'compare' | 'plans' | 'map';
export type PropertyType = 'all' | 'maison' | 'appartement' | 'terrain' | 'plan';
export type ListingView = 'grid' | 'map';
export type PaymentType = 'boost' | 'plan' | 'premium';

export interface Profile {
  id: string;
  userId?: string;
  fullName: string | null;
  phone: string | null;
  whatsapp: string | null;
  agencyName: string | null;
  role: string;
  verified: boolean;
  bio: string | null;
  avatar: string | null;
  email?: string;
}

export interface PropertyUser {
  id: string;
  name: string;
  email: string;
  profile: Profile | null;
}

export interface Property {
  id: string;
  userId: string;
  type: string;
  title: string;
  description: string;
  price: number;
  priceNegotiable: boolean;
  surfaceM2: number | null;
  rooms: number | null;
  region: string;
  city: string;
  quartier: string;
  lat: number | null;
  lng: number | null;
  images: string[];
  titleFoncier: boolean;
  status: string;
  isPremium: boolean;
  viewsCount: number;
  user: PropertyUser;
}

export interface FavItem {
  id: string;
  userId: string;
  propertyId: string;
  property: Property;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  propertyId: string | null;
  content: string;
  readAt: string | null;
  createdAt: string;
  sender: { id: string; name: string; profile: { fullName: string | null; avatar: string | null } | null };
  receiver: { id: string; name: string; profile: { fullName: string | null; avatar: string | null } | null };
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface Filters {
  type: PropertyType;
  region: string;
  maxPrice: string;
  minSurface: string;
  rooms: string;
  sort: string;
}

export interface PublishForm {
  type: string;
  title: string;
  description: string;
  price: string;
  surfaceM2: string;
  rooms: string;
  region: string;
  city: string;
  quartier: string;
  lat: string;
  lng: string;
  titleFoncier: boolean;
  priceNegotiable: boolean;
}

export interface AlertForm {
  type: string;
  region: string;
  maxPrice: string;
}

export interface Stats {
  totalProperties: number;
  activeProperties: number;
  totalUsers: number;
  totalViews: number;
  premiumProperties: number;
  totalMessages: number;
  totalFavorites: number;
  propertiesByType: { type: string; _count: { id: number } }[];
  recentProperties: { id: string; title: string; type: string; price: number; viewsCount: number }[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PropertiesResponse {
  properties: Property[];
  pagination: Pagination;
}

export interface SiteSettings {
  siteName: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  logoUrl: string;
  primaryColor: string;
  heroTitleFr?: string;
  heroTitleWo?: string;
  heroSubtitleFr?: string;
  heroSubtitleWo?: string;
  footerAboutFr?: string;
  footerAboutWo?: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  name?: string;
  profile?: Profile;
}

export interface Payment {
  id: string;
  userId: string;
  type: string;
  amount: number;
  method: string;
  status: string;
  refWave?: string;
  createdAt: string;
}
