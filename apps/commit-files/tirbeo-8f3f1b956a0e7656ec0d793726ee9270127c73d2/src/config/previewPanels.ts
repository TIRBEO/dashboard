import type { PanelRow } from '../types';

export type { PanelRow } from '../types';

export const panelData: Record<string, PanelRow[]> = {
  profile: [
    { id: 'displayName', k: { en: 'Display name', ne: 'प्रदर्शन नाम' }, v: '@yourhandle' },
    { id: 'role', k: { en: 'Role', ne: 'भूमिका' }, v: { en: 'Creator', ne: 'निर्माता' } },
    { id: 'bio', k: { en: 'Bio', ne: 'परिचय' }, v: 'Building the future of social.' },
    { id: 'location', k: { en: 'Location', ne: 'स्थान' }, v: 'San Francisco' },
  ],
  security: [
    { id: 'twoFactor', k: { en: 'Two-factor', ne: 'दुई-चरण' }, v: 'Enabled' },
    { id: 'sessions', k: { en: 'Sessions', ne: 'सेसनहरू' }, v: '3 active devices' },
    { id: 'dataOwnership', k: { en: 'Data ownership', ne: 'डाटा स्वामित्व' }, v: 'You' },
    { id: 'encryption', k: { en: 'Encryption', ne: 'इन्क्रिप्सन' }, v: 'End-to-end' },
  ],
  workspace: [
    { id: 'communities', k: { en: 'Communities', ne: 'समुदायहरू' }, v: '12 joined' },
    { id: 'storage', k: { en: 'Storage', ne: 'भण्डारण' }, v: '4.2 GB of 20 GB' },
    { id: 'members', k: { en: 'Members', ne: 'सदस्यहरू' }, v: '1,204' },
    { id: 'plan', k: { en: 'Plan', ne: 'योजना' }, v: 'Creator' },
  ],
  notifications: [
    { id: 'mentions', k: { en: 'Mentions', ne: 'उल्लेख' }, v: 'On' },
    { id: 'liveSessions', k: { en: 'Live sessions', ne: 'लाइभ सेसनहरू' }, v: 'On' },
    { id: 'digest', k: { en: 'Digest', ne: 'डाइजेस्ट' }, v: 'Weekly' },
    { id: 'quietHours', k: { en: 'Quiet hours', ne: 'शान्त समय' }, v: '10 PM – 8 AM' },
  ],
  integrations: [
    { id: 'calendar', k: { en: 'Calendar', ne: 'पात्रो' }, v: 'Connected' },
    { id: 'music', k: { en: 'Music', ne: 'संगीत' }, v: 'Connected' },
    { id: 'webhooks', k: { en: 'Webhooks', ne: 'वेबहुकहरू' }, v: '2 active' },
    { id: 'apiKey', k: { en: 'API key', ne: 'एपीआई कुञ्जी' }, v: '••••••••' },
  ],
  preferences: [
    { id: 'theme', k: { en: 'Theme', ne: 'थिम' }, v: 'System (Dark)' },
    { id: 'language', k: { en: 'Language', ne: 'भाषा' }, v: 'English' },
    { id: 'density', k: { en: 'Density', ne: 'घनत्व' }, v: 'Comfortable' },
    { id: 'animations', k: { en: 'Animations', ne: 'एनिमेसनहरू' }, v: 'Reduced' },
  ],
  activity: [
    { id: 'posts', k: { en: 'Posts', ne: 'पोस्टहरू' }, v: '318' },
    { id: 'replies', k: { en: 'Replies', ne: 'जवाफहरू' }, v: '1,902' },
    { id: 'reactions', k: { en: 'Reactions', ne: 'प्रतिक्रियाहरू' }, v: '7,440' },
    { id: 'streak', k: { en: 'Streak', ne: 'लगातार' }, v: '42 days' },
  ],
  help: [
    { id: 'status', k: { en: 'Status', ne: 'स्थिति' }, v: 'All systems operational' },
    { id: 'docs', k: { en: 'Docs', ne: 'कागजात' }, v: 'View guides' },
    { id: 'contact', k: { en: 'Contact', ne: 'सम्पर्क' }, v: 'support@tirbeo.com' },
    { id: 'community', k: { en: 'Community', ne: 'समुदाय' }, v: 'Join Discord' },
  ],
};