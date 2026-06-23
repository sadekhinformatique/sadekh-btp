export interface AdminStats {
  totalProperties: number;
  activeProperties: number;
  totalMessages: number;
  unreadMessages: number;
  totalUsers: number;
  totalViews: number;
  pendingProperties: number;
  monthlyViews: { month: string; views: number }[];
  propertiesByType: { type: string; count: number }[];
  recentProperties: any[];
}

export interface SettingsForm {
  siteName: string;
  siteSlogan: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  accentColor: string;
  contactEmail: string;
  contactPhone: string;
  contactWhatsapp: string;
  contactAddress: string;
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
  tiktok: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  heroTitleFr: string;
  heroSubtitleFr: string;
  footerAboutFr: string;
  heroTitleWo: string;
  heroSubtitleWo: string;
  footerAboutWo: string;
  boostPrice: string;
  premiumPrice: string;
  currency: string;
  currencySymbol: string;
}

export interface PropertyForm {
  title: string;
  description: string;
  price: string;
  type: string;
  region: string;
  locality: string;
  status: string;
  area: string;
  rooms: string;
  bedrooms: string;
  bathrooms: string;
  features: string[];
  images: string[];
  latitude: string;
  longitude: string;
  agent_name: string;
  agent_contact: string;
  is_featured: boolean;
  transaction_type: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
}
