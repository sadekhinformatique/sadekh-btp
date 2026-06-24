import { create } from 'zustand';
import type { Lang, View, PropertyType, ListingView, Filters, PublishForm, AlertForm, ChatMessage, Property, PaymentType, SiteSettings, CurrentUser } from './types';

interface AppState {
  lang: Lang;
  setLang: (lang: Lang) => void;

  view: View;
  setView: (view: View) => void;

  selectedProperty: Property | null;
  setSelectedProperty: (p: Property | null) => void;

  showDetail: boolean;
  setShowDetail: (v: boolean) => void;

  mobileMenu: boolean;
  setMobileMenu: (v: boolean) => void;

  searchQuery: string;
  setSearchQuery: (q: string) => void;

  filters: Filters;
  setFilters: (f: Filters) => void;
  updateFilter: (key: string, value: string) => void;
  resetFilters: () => void;

  page: number;
  setPage: (p: number) => void;

  compareIds: string[];
  setCompareIds: (ids: string[]) => void;
  toggleCompare: (id: string) => void;

  showChatbot: boolean;
  setShowChatbot: (v: boolean) => void;

  chatMessages: ChatMessage[];
  setChatMessages: (msgs: ChatMessage[]) => void;
  addChatMessage: (msg: ChatMessage) => void;

  chatLoading: boolean;
  setChatLoading: (v: boolean) => void;

  publishStep: number;
  setPublishStep: (s: number) => void;

  publishForm: PublishForm;
  setPublishForm: (f: PublishForm) => void;

  publishing: boolean;
  setPublishing: (v: boolean) => void;

  publishSuccess: boolean;
  setPublishSuccess: (v: boolean) => void;

  listingView: ListingView;
  setListingView: (v: ListingView) => void;

  showAuth: boolean;
  setShowAuth: (v: boolean) => void;

  currentUser: CurrentUser | null;
  setCurrentUser: (u: CurrentUser | null) => void;

  paymentProperty: Property | null;
  setPaymentProperty: (p: Property | null) => void;

  paymentType: PaymentType;
  setPaymentType: (t: PaymentType) => void;

  showAlertPanel: boolean;
  setShowAlertPanel: (v: boolean) => void;

  newAlert: AlertForm;
  setNewAlert: (a: AlertForm) => void;

  alertCreating: boolean;
  setAlertCreating: (v: boolean) => void;

  msgText: string;
  setMsgText: (t: string) => void;

  sendingMsg: boolean;
  setSendingMsg: (v: boolean) => void;

  isOffline: boolean;
  setIsOffline: (v: boolean) => void;

  siteSettings: SiteSettings | null;
  setSiteSettings: (s: SiteSettings | null) => void;

  handleSearch: (q: string) => void;
  openProperty: (p: Property) => void;
  resetView: () => void;
}

const initialFilters: Filters = {
  type: 'all',
  region: 'all',
  maxPrice: '',
  minSurface: '',
  rooms: '',
  sort: 'recent',
};

const initialPublishForm: PublishForm = {
  type: 'maison',
  title: '',
  description: '',
  price: '',
  surfaceM2: '',
  rooms: '',
  region: 'Dakar',
  city: '',
  quartier: '',
  lat: '',
  lng: '',
  titleFoncier: false,
  priceNegotiable: false,
  images: [],
};

export const useStore = create<AppState>((set) => ({
  lang: 'fr',
  setLang: (lang) => set({ lang }),

  view: 'home',
  setView: (view) => set({ view }),

  selectedProperty: null,
  setSelectedProperty: (selectedProperty) => set({ selectedProperty }),

  showDetail: false,
  setShowDetail: (showDetail) => set({ showDetail }),

  mobileMenu: false,
  setMobileMenu: (mobileMenu) => set({ mobileMenu }),

  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  filters: { ...initialFilters },
  setFilters: (filters) => set({ filters }),
  updateFilter: (key, value) => set((state) => ({ filters: { ...state.filters, [key]: value }, page: 1 })),
  resetFilters: () => set({ filters: { ...initialFilters }, searchQuery: '', page: 1 }),

  page: 1,
  setPage: (page) => set({ page }),

  compareIds: [],
  setCompareIds: (compareIds) => set({ compareIds }),
  toggleCompare: (id) => set((state) => ({
    compareIds: state.compareIds.includes(id)
      ? state.compareIds.filter((x) => x !== id)
      : state.compareIds.length < 3
        ? [...state.compareIds, id]
        : state.compareIds,
  })),

  showChatbot: false,
  setShowChatbot: (showChatbot) => set({ showChatbot }),

  chatMessages: [{ role: 'assistant', content: '' }],
  setChatMessages: (chatMessages) => set({ chatMessages }),
  addChatMessage: (msg) => set((state) => ({ chatMessages: [...state.chatMessages, msg] })),

  chatLoading: false,
  setChatLoading: (chatLoading) => set({ chatLoading }),

  publishStep: 1,
  setPublishStep: (publishStep) => set({ publishStep }),

  publishForm: { ...initialPublishForm },
  setPublishForm: (publishForm) => set({ publishForm }),

  publishing: false,
  setPublishing: (publishing) => set({ publishing }),

  publishSuccess: false,
  setPublishSuccess: (publishSuccess) => set({ publishSuccess }),

  listingView: 'grid',
  setListingView: (listingView) => set({ listingView }),

  showAuth: false,
  setShowAuth: (showAuth) => set({ showAuth }),

  currentUser: null,
  setCurrentUser: (currentUser) => set({ currentUser }),

  paymentProperty: null,
  setPaymentProperty: (paymentProperty) => set({ paymentProperty }),

  paymentType: 'boost',
  setPaymentType: (paymentType) => set({ paymentType }),

  showAlertPanel: false,
  setShowAlertPanel: (showAlertPanel) => set({ showAlertPanel }),

  newAlert: { type: 'all', region: 'Dakar', maxPrice: '' },
  setNewAlert: (newAlert) => set({ newAlert }),

  alertCreating: false,
  setAlertCreating: (alertCreating) => set({ alertCreating }),

  msgText: '',
  setMsgText: (msgText) => set({ msgText }),

  sendingMsg: false,
  setSendingMsg: (sendingMsg) => set({ sendingMsg }),

  isOffline: false,
  setIsOffline: (isOffline) => set({ isOffline }),

  siteSettings: null,
  setSiteSettings: (siteSettings) => set({ siteSettings }),

  handleSearch: (q) => set({ searchQuery: q, page: 1, view: q ? 'listing' : 'home' }),

  openProperty: (p) => set({ selectedProperty: p, showDetail: true, view: 'listing' }),

  resetView: () => set({
    view: 'home',
    page: 1,
    searchQuery: '',
    filters: { ...initialFilters },
    selectedProperty: null,
    showDetail: false,
  }),
}));
