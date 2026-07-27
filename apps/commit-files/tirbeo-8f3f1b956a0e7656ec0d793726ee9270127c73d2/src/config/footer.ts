// ─── Footer Config ───
// Scalable column structure — add/remove/reorder columns freely.
// Each column = { title: Bilingual, links: { label: Bilingual, href: string }[] }

export const footerConfig = {
  tagline: { en: 'Connecting communities.', ne: 'समुदायहरू जोड्दै।' },
  rights: { en: '© 2027 Tirbeo. All rights reserved.', ne: '© २०२७ तिर्बिओ। सबै अधिकार सुरक्षित।' },
  columns: [
    {
      title: { en: 'Product', ne: 'उत्पादन' },
      links: [
        { label: { en: 'Tirbeo Collab', ne: 'तिर्बिओ कोलाब' }, href: 'https://collab.tirbeo.app' },
        { label: { en: 'Communities', ne: 'समुदायहरू' }, href: 'https://tirbeo.app/communities' },
        { label: { en: 'Pricing', ne: 'मूल्य' }, href: 'https://tirbeo.app/pricing' },
        { label: { en: 'Changelog', ne: 'परिवर्तन लग' }, href: 'https://tirbeo.app/changelog' },
      ],
    },
    {
      title: { en: 'Developers', ne: 'डेभलपरहरू' },
      links: [
        { label: { en: 'API Docs', ne: 'एपीआई कागजात' }, href: 'https://docs.tirbeo.app/api' },
        { label: { en: 'Manual', ne: 'म्यानुअल' }, href: 'https://docs.tirbeo.app' },
        { label: { en: 'Troubleshooting', ne: 'समस्या निवारण' }, href: 'https://docs.tirbeo.app/troubleshooting' },
        { label: { en: 'FAQ', ne: 'बारम्बार सोधिने' }, href: 'https://tirbeo.app/faq' },
      ],
    },
    {
      title: { en: 'Company', ne: 'कम्पनी' },
      links: [
        { label: { en: 'About', ne: 'बारेमा' }, href: 'https://docs.tirbeo.app/about' },
        { label: { en: 'Careers', ne: 'करियर' }, href: 'https://tirbeo.app/careers' },
        { label: { en: 'Contact', ne: 'सम्पर्क' }, href: 'https://support.tirbeo.app' },
        { label: { en: 'Press Kit', ne: 'प्रेस किट' }, href: 'https://tirbeo.app/press' },
      ],
    },
    {
      title: { en: 'Community', ne: 'समुदाय' },
      links: [
        { label: { en: 'Stories', ne: 'कथाहरू' }, href: 'https://tirbeo.app/stories' },
        { label: { en: 'Ambassadors', ne: 'दूतहरू' }, href: 'https://tirbeo.app/ambassadors' },
        { label: { en: 'X / Twitter', ne: 'एक्स / ट्विटर' }, href: 'https://x.com/tirbeo' },
        { label: { en: 'GitHub', ne: 'गिटहब' }, href: 'https://github.com/tirbeo' },
      ],
    },
  ],
  connect: [
    { label: 'X (Twitter)', icon: 'Twitter', href: 'https://x.com/tirbeo' },
    { label: 'Discord', icon: 'Send', href: 'https://discord.gg/rpfQY6VnHd' },
    { label: 'GitHub', icon: 'Github', href: 'https://github.com/tirbeo' },
  ],
  legal: [
    { label: { en: 'Privacy', ne: 'गोपनीयता' }, href: 'https://docs.tirbeo.app/privacy' },
    { label: { en: 'Terms', ne: 'सर्तहरू' }, href: 'https://docs.tirbeo.app/terms' },
    { label: { en: 'Cookies', ne: 'कुकिज' }, href: 'https://docs.tirbeo.app/cookies' },
  ],
};
