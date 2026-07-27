import type { SidebarItem, CommunityItem, FeedPost } from '../types';

export const previewSidebar: SidebarItem[] = [
  { id: 'profile', icon: 'Users', label: { en: 'Profile', ne: 'प्रोफाइल' } },
  { id: 'security', icon: 'Globe', label: { en: 'Security', ne: 'सुरक्षा' } },
  { id: 'workspace', icon: 'TrendingUp', label: { en: 'Workspace', ne: 'कार्यस्थान' } },
  { id: 'notifications', icon: 'Bell', label: { en: 'Notifications', ne: 'सूचनाहरू' } },
  { id: 'integrations', icon: 'Zap', label: { en: 'Integrations', ne: 'एकीकरणहरू' } },
  { id: 'preferences', icon: 'MessageCircle', label: { en: 'Preferences', ne: 'प्राथमिकताहरू' } },
  { id: 'activity', icon: 'Share2', label: { en: 'Activity', ne: 'गतिविधि' } },
  { id: 'help', icon: 'Heart', label: { en: 'Help & Support', ne: 'सहायता र समर्थन' } },
];

export const previewCommunities: CommunityItem[] = [
  { name: { en: 'Design Culture', ne: 'डिजाइन संस्कृति' }, members: '128K' },
  { name: { en: 'Builders', ne: 'निर्माताहरू' }, members: '94K' },
  { name: { en: 'Indie Creators', ne: 'स्वतन्त्र निर्माता' }, members: '210K' },
  { name: { en: 'Music Underground', ne: 'संगीत अन्डरग्राउन्ड' }, members: '76K' },
];

export const previewFeed: FeedPost[] = [
  { id: 1, user: '@maya', time: '12m', text: { en: "Shipped my first community drop on Tirbeo — the threading is unreal. 🚀", ne: 'तिर्बिओमा मेरो पहिलो समुदाय पोस्ट सारेँ — थ्रेडिङ अविश्वसनीय छ। 🚀' }, likes: 1200, replies: 84 },
  { id: 2, user: '@devon', time: '34m', text: { en: "Finally a feed that doesn't make me feel worse after scrolling. Love this.", ne: 'अन्ततः एउटा फिड जसले स्क्रोल गरेपछि नराम्रो महसुस गराउँदैन। मन पर्यो।' }, likes: 3400, replies: 210 },
  { id: 3, user: '@studio', time: '1h', text: { en: "Live session Friday at 6PM. Bringing the whole design team. Who's in?", ne: 'शुक्रबार साँझ ६ बजे लाइभ सेसन। सबै डिजाइन टिम ल्याउँदैछु। को सामिल हुन्छ?' }, likes: 890, replies: 56 },
];

export const previewConfig = {
  heading: { en: 'See Tirbeo live.', ne: 'तिर्बिओ लाइभ हेर्नुहोस्।' },
  sub: { en: 'A peek at the app — your feed, communities and conversations.', ne: 'एपको झलक — तपाईंको फिड, समुदाय र कुराकानी।' },
  appTitle: { en: 'Tirbeo App — Preview', ne: 'तिर्बिओ एप — पूर्वावलोकन' },
  trending: { en: 'Trending Communities', ne: 'ट्रेन्डिङ समुदायहरू' },
  join: { en: 'Join', ne: 'सामिल हुनुहोस्' },
  watching: { en: 'watching', ne: 'हेरिरहेका' },
  live: { en: 'Live', ne: 'लाइभ' },
  home: { en: 'Home', ne: 'गृह' },
  share: { en: 'Share', ne: 'साझा गर्नुहोस्' },
  members: { en: 'members', ne: 'सदस्य' },
};