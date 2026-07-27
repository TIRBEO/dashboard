-- ═════════════════════════════════════════════════════════════════════════════
-- Tirbeo Admin Panel — site_config table
-- Stores the full landing page config as a single JSONB row.
-- Edit from admin panel or Supabase dashboard → table editor.
-- ═════════════════════════════════════════════════════════════════════════════

create table if not exists site_config (
  id          uuid primary key default gen_random_uuid(),
  -- Section key: 'navbar', 'hero', 'brand', 'chat', 'faq', etc.
  -- Each section gets its own row so admins can update independently.
  section     text not null unique,

  -- The actual config data for this section.
  -- Shape matches the TypeScript interfaces in siteConfig.ts.
  data        jsonb not null default '{}'::jsonb,

  -- Optional description shown in admin UI tooltip
  description text,

  -- Last modified timestamp (auto-updated)
  updated_at  timestamptz not null default now()
);

-- Auto-update updated_at on row change
create or replace function update_site_config_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger site_config_updated
  before update on site_config
  for each row execute function update_site_config_timestamp();

-- ═════════════════════════════════════════════════════════════════════════════
-- Seed data — insert default values for each section.
-- ═════════════════════════════════════════════════════════════════════════════

-- brand: Site name, logo URL, home link
-- Fields:
--   name     : text — The brand name shown in navbar and everywhere (e.g. "Tirbeo")
--   logo     : text — URL or path to the logo image (e.g. "/logo.png" or "https://...")
--   glyph    : text — Icon identifier from lucide-react (e.g. "Globe")
--   logoHref : text — URL the logo links to (e.g. "https://tirbeo.app")
insert into site_config (section, data, description) values (
  'brand',
  '{
    "name": "Tirbeo",
    "logo": "/logo.png",
    "glyph": "Globe",
    "logoHref": "https://tirbeo.app"
  }'::jsonb,
  'Brand identity: name, logo image, icon glyph, and home link URL.'
) on conflict (section) do nothing;

-- navbar: Navigation links and CTA buttons
-- Fields:
--   links      : array of { key, label:{en,ne}, href, target? }
--                  key     : unique string identifier (e.g. "nav.products")
--                  label   : bilingual display text
--                  href    : URL to navigate to
--                  target  : optional, "_blank" for external links
--   signup     : { label:{en,ne}, href } — Sign up button config
--   login      : { label:{en,ne}, href } — Login button config
--   earlyAccess: { label, placeholder, cta, success, href } — Early access form
insert into site_config (section, data, description) values (
  'navbar',
  '{
    "links": [
      { "key": "nav.products",  "label": { "en": "Products",  "ne": "उत्पादनहरू" }, "href": "https://tirbeo.app/products" },
      { "key": "nav.solutions", "label": { "en": "Solutions",  "ne": "समाधानहरू" }, "href": "https://docs.tirbeo.app/solutions" },
      { "key": "nav.docs",      "label": { "en": "Documents",  "ne": "कागजात" },     "href": "https://docs.tirbeo.app/" },
      { "key": "nav.about",     "label": { "en": "About",      "ne": "बारेमा" },     "href": "https://docs.tirbeo.app/about" }
    ],
    "signup": { "label": { "en": "Sign Up", "ne": "साइन अप" }, "href": "https://accounts.tirbeo.app/login?mode=signup" },
    "login":  { "label": { "en": "Login",   "ne": "लग इन" },   "href": "https://accounts.tirbeo.app/login" },
    "earlyAccess": {
      "label": { "en": "Get Early Access", "ne": "अर्ली एक्सेस पाउनुहोस्" },
      "placeholder": { "en": "Enter your email", "ne": "आफ्नो इमेल राख्नुहोस्" },
      "cta": { "en": "Join", "ne": "सामिल हुनुहोस्" },
      "success": { "en": "You'"'"'re on the list!", "ne": "तपाईं सूचीमा हुनुहुन्छ!" },
      "href": "https://accounts.tirbeo.app/"
    }
  }'::jsonb,
  'Navbar config: navigation links (label, href, key), signup/login buttons, early access form.'
) on conflict (section) do nothing;

-- hero: Main hero section content
insert into site_config (section, data, description) values (
  'hero',
  '{
    "tagline": { "en": "BUILD THE FUTURE OF SOCIAL — LAUNCHING 2027", "ne": "सामाजिक सञ्जालको भविष्य निर्माण गरौं — २०२७ मा सुरु हुँदै" },
    "title": { "en": "A new way to connect, create and belong", "ne": "जोडिने, सिर्जना गर्ने र साथी बन्ने नयाँ तरिका" },
    "cta": { "en": "Get early access", "ne": "अगाडि पहुँच पाउनुहोस्" },
    "placeholderEn": "Enter Your Email Here For Early Access",
    "placeholderNe": "अगाडि पहुँचको लागि आफ्नो इमेल लेख्नुहोस्",
    "submittedEn": "You Will Receive Notifications By Email",
    "submittedNe": "तपाईंलाई इमेलमार्फत सूचना आउनेछ"
  }'::jsonb,
  'Hero section: tagline, title, CTA button text, email placeholders (en/ne), submitted messages. CTA text is changeable from admin.'
) on conflict (section) do nothing;

-- products: Products showcase section
-- Fields:
--   heading : bilingual section heading (e.g. "Products")
--   items   : array of product cards
--     n       : display number (e.g. "01")
--     name    : bilingual product name
--     category: bilingual category label (can be empty string)
--     cta     : bilingual button text (e.g. "Live Project")
--     href    : URL the CTA button links to
--     col1Top : image URL for top-left card
--     col1Bottom: image URL for bottom-left card
--     col2    : image URL for right card
insert into site_config (section, data, description) values (
  'products',
  '{
    "heading": { "en": "Products", "ne": "उत्पादनहरू" },
    "items": [
      {
        "n": "01",
        "name": { "en": "Tirbeo Collab", "ne": "तिर्बिओ कोलाब" },
        "category": { "en": "", "ne": "" },
        "cta": { "en": "Live Project", "ne": "लाइभ प्रोजेक्ट" },
        "href": "https://collab.tirbeo.app",
        "col1Top": "https://media.discordapp.net/attachments/1528388244419379301/1528388282910638252/img.png?ex=6a5e1e02&is=6a5ccc82&hm=dee4bf6c510e65cb77efc0d0a4f4fb87472805ac1459ac460c96216374ae83d7&=&format=webp&quality=lossless&width=720&height=296",
        "col1Bottom": "https://media.discordapp.net/attachments/1528388244419379301/1528394569425883316/main.png?ex=6a5e23dd&is=6a5cd25d&hm=f4f73119c3647e93f53fa13b77911b2fffd0abc8a7a8b1a74e0e8c212eeffc9b&=&format=webp&quality=lossless&width=1858&height=782",
        "col2": "https://media.discordapp.net/attachments/1528388244419379301/1528395699362857030/image.png?ex=6a5e24ea&is=6a5cd36a&hm=1b31871640011d0de934c12d7cdfbf97504eea2a48960d9a35a44a3a89594e0b&=&format=webp&quality=lossless&width=707&height=707"
      }
    ]
  }'::jsonb,
  'Products section: heading, array of {n, name, category, cta, href, col1Top, col1Bottom, col2}. Add/edit/remove products from admin.'
) on conflict (section) do nothing;

-- chat: Chat section config
insert into site_config (section, data, description) values (
  'chat',
  '{
    "eyebrow": { "en": "Chat", "ne": "च्याट" },
    "heading": { "en": "A convo that feels human.", "ne": "मानवीय लाग्ने कुराकानीहरू।" },
    "sub": { "en": "Tirbeo'"'"'s chat is built for depth — threaded replies, shared media, live sessions, and a clean, focused interface. No noise, no endless notifications, no algorithm sorting your friends. Just real conversations with people you want to hear from.", "ne": "तिर्बिओको च्याट गहिराइको लागि बनाइएको छ — थ्रेडेड जवाफहरू, साझा मिडिया, लाइभ सेसनहरू, र सफा, केन्द्रित इन्टरफेस। कुनै हल्ला छैन, अनन्त सूचनाहरू छैनन्, तपाईंका साथीहरूलाई एल्गोरिदमले क्रमबद्ध गर्दैन। जससँग कुरा गर्न चाहनुहुन्छ, उनीहरूसँग मात्र वास्तविक कुराकानी।" },
    "gated": { "en": "This conversation is only available inside Tirbeo. Join to keep chatting with Maya and the community.", "ne": "यो कुराकानी तिर्बिओ भित्र मात्र उपलब्ध छ। मायासँग र समुदायसँग कुरा गर्न जारी राख्न सामिल हुनुहोस्।" },
    "joinBtn": { "en": "Join Tirbeo", "ne": "तिर्बिओमा सामिल हुनुहोस्" },
    "placeholder": { "en": "Message Tirbeo…", "ne": "तिर्बिओलाई सन्देश…" },
    "encrypted": { "en": "End-to-end encrypted", "ne": "इन्ड-टु-इन्ड इन्क्रिप्टेड" },
    "peer": "Tirbeo"
  }'::jsonb,
  'Chat section: heading, sub (long description), gated message, join button, placeholder, encryption label, peer name. peer auto-syncs with brand name if left as same value.'
) on conflict (section) do nothing;

-- about: About section
-- Fields:
--   eyebrow    : bilingual section label (e.g. "About")
--   heading    : bilingual oversized heading
--   scroll     : bilingual scroll indicator text
--   paragraphs : array of bilingual paragraph strings (scroll-revealed word-by-word)
--   mission    : bilingual mission statement
--   principles : array of { num, title, sub, desc } — numbered principles
insert into site_config (section, data, description) values (
  'about',
  '{
    "eyebrow": { "en": "About", "ne": "बारेमा" },
    "heading": { "en": "Built different, on purpose.", "ne": "बुझेर, नियतले फरक।" },
    "scroll": { "en": "Scroll", "ne": "स्क्रोल" },
    "paragraphs": [
      { "en": "Tirbeo is built to make social networking feel personal again. We believe the best online experiences come from genuine conversations, shared interests, and communities where people feel welcome.", "ne": "तिर्बिओ सामाजिक सञ्जाललाई फेरि व्यक्तिगत महसुस गराउन बनाइएको छ। हाम्रो विश्वास छ कि उत्कृष्ट अनलाइन अनुभवहरू वास्तविक कुराकानी, साझा रुचि, र मानिसहरू स्वागत महसुस गर्ने समुदायहरूबाट आउँछन्।" },
      { "en": "Instead of endless scrolling, our platform encourages meaningful interactions that create real value and lasting connections. Every feature is designed with people in mind.", "ne": "अनन्त स्क्रोलिङको सट्टा, हाम्रो प्ल्याटफर्मले वास्तविक मूल्य र स्थायी जडान सिर्जना गर्ने अर्थपूर्ण अन्तक्रियालाई प्रोत्साहन गर्छ। हरेक सुविधा मानिसलाई ध्यानमा राखेर डिजाइन गरिएको छ।" },
      { "en": "Whether you'"'"'re discovering local communities, meeting like-minded individuals, or sharing your ideas with the world, Tirbeo provides a clean, distraction-free space where authentic conversations can naturally grow.", "ne": "तपाईं स्थानीय समुदाय पत्ता लगाइरहनुहुन्छ, सोच मिल्ने व्यक्तिहरू भेटिरहनुहुन्छ, वा आफ्ना विचार संसारसँग साझा गरिरहनुहुन्छ, तिर्बिओले एउटा सफा, विकर्षणमुक्त स्थान दिन्छ जहाँ प्रामाणिक कुराकानी स्वाभाविक रूपमा बढ्न सक्छ।" },
      { "en": "We prioritize privacy, performance, and simplicity. From secure messaging and modern technology to a fast, responsive experience across every device, Tirbeo is built to be reliable, intuitive, and respectful of your time and attention.", "ne": "हामी गोपनीयता, प्रदर्शन, र सरलतालाई प्राथमिकता दिन्छौं। सुरक्षित मेसेजिङ र आधुनिक प्रविधिदेखि हरेक यन्त्रमा द्रुत, प्रतिक्रियाशील अनुभवसम्म, तिर्बिओ भरपर्दो, सहज, र तपाईंको समय र ध्यानप्रति सम्मानपूर्ण हुने गरी बनाइएको छ।" }
    ],
    "mission": { "en": "Our mission is simple: create a platform where people connect because they genuinely want to — not because an algorithm tells them to.", "ne": "हाम्रो अभियान सरल छ: एउटा प्ल्याटफर्म सिर्जना गरौं जहाँ मानिसहरू आफैंले चाहेर जोडिन्छन् — एल्गोरिदमले भनेकोले होइन।" },
    "principles": [
      { "num": { "en": "01", "ne": "०१" }, "title": { "en": "Foundation", "ne": "आधार" }, "sub": { "en": "Built to last.", "ne": "स्थायी रूपमा निर्मित।" }, "desc": { "en": "No shortcuts, no gimmicks. Just solid principles that outlive every trend.", "ne": "कुनै शर्टकट छैन, कुनै चालबाजी छैन। बस दृढ सिद्धान्तहरू जसले हरेक ट्रेन्डभन्दा बाँच्छन्।" } },
      { "num": { "en": "02", "ne": "०२" }, "title": { "en": "Framework", "ne": "ढाँचा" }, "sub": { "en": "Every feature has a reason.", "ne": "हरेक सुविधाको कारण छ।" }, "desc": { "en": "Designed to connect, not to keep you hooked. Purpose-driven, intentional.", "ne": "जोड्नको लागि डिजाइन गरिएको, तपाईंलाई बान्की बनाउन होइन। उद्देश्यप्रेरित, जानीजानी।" } },
      { "num": { "en": "03", "ne": "०३" }, "title": { "en": "Connection", "ne": "जडान" }, "sub": { "en": "Less is more.", "ne": "कम भनेको बढी हो।" }, "desc": { "en": "A bridge carries only what'"'"'s needed. Every line of code serves a purpose.", "ne": "एउटा पुलले आवश्यक पर्नेमात्र बोक्छ। कोडको हरेक लाइनले उद्देश्य पूरा गर्छ।" } }
    ]
  }'::jsonb,
  'About section: eyebrow, heading, scroll label, paragraphs (word-by-word reveal), mission, principles (numbered cards).'
) on conflict (section) do nothing;

-- faq: FAQ section
insert into site_config (section, data, description) values (
  'faq',
  '{
    "eyebrow": { "en": "FAQ", "ne": "बारम्बार सोधिने" },
    "heading": { "en": "Frequently asked.", "ne": "बारम्बार सोधिने प्रश्नहरू।" },
    "items": [
      { "q": { "en": "What is Tirbeo?", "ne": "तिर्बिओ के हो?" }, "a": { "en": "Tirbeo is a community-first platform designed for meaningful conversations.", "ne": "तिर्बिओ समुदाय-प्रथम प्ल्याटफर्म हो जुन अर्थपूर्ण कुराकानीको लागि डिजाइन गरिएको छ।" } },
      { "q": { "en": "How do I join?", "ne": "म कसरी सामिल हुने?" }, "a": { "en": "Enter your email above to join our waitlist.", "ne": "माथि आफ्नो इमेल लेखेर हाम्रो वेटलिस्टमा सामिल हुन सक्नुहुन्छ।" } },
      { "q": { "en": "How is my data handled?", "ne": "मेरो डाटालाई कसरी हेरचार गरिन्छ?" }, "a": { "en": "Your data belongs to you. We never sell personal data.", "ne": "तपाईंको डाटा तपाईंकै हो। हामी व्यक्तिगत डाटा कहिल्यै बेच्दैनौं।" } }
    ]
  }'::jsonb,
  'FAQ section: heading, array of {q:{en,ne}, a:{en,ne}} items. Add/remove questions from admin.'
) on conflict (section) do nothing;

-- newsletter: Newsletter signup section
insert into site_config (section, data, description) values (
  'newsletter',
  '{
    "heading": { "en": "Never miss an update", "ne": "कुनै अपडेट नछुटाउनुहोस्" },
    "sub": { "en": "Subscribe for launch announcements.", "ne": "सुरुवातका घोषणाहरूको लागि सदस्यता लिनुहोस्।" },
    "emailPlaceholder": { "en": "Enter your email here", "ne": "आफ्नो इमेल यहाँ लेख्नुहोस्" },
    "subscribe": { "en": "Subscribe", "ne": "सदस्यता" },
    "subscribed": { "en": "You'"'"'re subscribed!", "ne": "तपाईं सदस्य भयो!" },
    "spam": { "en": "No spam. Unsubscribe anytime.", "ne": "स्प्याम होइन। जहिले पनि हटाउन सकिन्छ।" }
  }'::jsonb,
  'Newsletter section: heading, placeholder, subscribe button text, success/spam messages.'
) on conflict (section) do nothing;

-- footer: Footer columns, legal links, social links
insert into site_config (section, data, description) values (
  'footer',
  '{
    "tagline": { "en": "Connecting communities.", "ne": "समुदायहरू जोड्दै।" },
    "rights": { "en": "© 2027 Tirbeo. All rights reserved.", "ne": "© २०२७ तिर्बिओ। सबै अधिकार सुरक्षित।" },
    "columns": [
      {
        "title": { "en": "Platform", "ne": "प्ल्याटफर्म" },
        "links": [
          { "label": { "en": "About", "ne": "बारेमा" }, "href": "https://docs.tirbeo.app/about" },
          { "label": { "en": "Chat", "ne": "च्याट" }, "href": "https://chat.tirbeo.app" }
        ]
      },
      {
        "title": { "en": "Company", "ne": "कम्पनी" },
        "links": [
          { "label": { "en": "About", "ne": "बारेमा" }, "href": "https://docs.tirbeo.app/about" },
          { "label": { "en": "Contact", "ne": "सम्पर्क" }, "href": "https://support.tirbeo.app" },
          { "label": { "en": "Privacy", "ne": "गोपनीयता" }, "href": "https://docs.tirbeo.app/privacy" },
          { "label": { "en": "Terms", "ne": "सर्तहरू" }, "href": "https://docs.tirbeo.app/terms" }
        ]
      }
    ],
    "connect": [
      { "label": "X (Twitter)", "icon": "Twitter", "href": "https://x.com/tirbeo" },
      { "label": "Discord", "icon": "Send", "href": "https://discord.gg/rpfQY6VnHd" },
      { "label": "GitHub", "icon": "Github", "href": "https://github.com/tirbeo" }
    ],
    "legal": [
      { "label": { "en": "Privacy", "ne": "गोपनीयता" }, "href": "https://docs.tirbeo.app/privacy" },
      { "label": { "en": "Terms", "ne": "सर्तहरू" }, "href": "https://docs.tirbeo.app/terms" },
      { "label": { "en": "Cookies", "ne": "कुकिज" }, "href": "https://docs.tirbeo.app/cookies" }
    ]
  }'::jsonb,
  'Footer: columns with links, social icons, legal links, tagline, copyright text.'
) on conflict (section) do nothing;

-- testimonials: Testimonial cards
insert into site_config (section, data, description) values (
  'testimonials',
  '{
    "heading": { "en": "Early believers.", "ne": "अगाडि अपनाउने विश्वासिला।" },
    "sub": { "en": "What early access members and investors are saying.", "ne": "अगाडि पहुँच सदस्य र लगानीकर्ताहरू के भन्छन्।" },
    "items": [
      { "quote": { "en": "As a brand, the targeting precision and community depth on Tirbeo is exactly what marketing needs today. We'"'"'re all in.", "ne": "एउटा ब्रान्डको रूपमा, तिर्बिओको लक्ष्य निशाना र समुदाय गहिराइ बजार प्रचारको लागि आज आवश्यक पर्ने कुरा हो। हामी पूर्ण रूपमा सामिल छौं।" }, "name": "Claire Beaulieu", "role": "CMO", "avatar": "https://randomuser.me/api/portraits/women/44.jpg" },
      { "quote": { "en": "We found Tirbeo months before launch and the early community already feels more real than anything on legacy social.", "ne": "हामीले तिर्बिओ सुरुवातभन्दा महिनौं अगाडि पायौं र अगाडिको समुदाय पुरानो सामाजिक भन्दा बढी वास्तविक लाग्छ।" }, "name": "Daniel Roth", "role": "Partner", "avatar": "https://randomuser.me/api/portraits/men/32.jpg" },
      { "quote": { "en": "The threaded discussions blow Discord away. No noise, just real conversations with a beginning, middle, and end.", "ne": "थ्रेडेड छलफलले डिस्कोर्डलाई उछिन्छ। कुनै हल्ला छैन, सुरु, मध्य र अन्त भएको वास्तविक कुराकानी मात्र।" }, "name": "Maya Lindqvist", "role": "Designer", "avatar": "https://randomuser.me/api/portraits/women/68.jpg" },
      { "quote": { "en": "Shared libraries I actually own — I saved three posts and carried them straight into another community. That'"'"'s the future.", "ne": "मेरै स्वामित्वका साझा लाइब्रेरीहरू — मैले तीन पोस्ट बचाएँ र अर्को समुदायमा लगें। त्यही भविष्य हो।" }, "name": "Aarav Sharma", "role": "Creator", "avatar": "https://randomuser.me/api/portraits/men/76.jpg" },
      { "quote": { "en": "Live sessions capped for real connection, not crowds. We booked Friday and it felt like a room, not a stadium.", "ne": "वास्तविक जडानको लागि सीमित लाइभ सेसन, भीडको लागि होइन। शुक्रवार बुक गर्यौं र त्यो रंगशाला हैन, कोठा जस्तो लाग्यो।" }, "name": "Priya Nair", "role": "Community Lead", "avatar": "https://randomuser.me/api/portraits/women/12.jpg" },
      { "quote": { "en": "Privacy by default changed how our team talks. Every message sealed, only who we chose can read it.", "ne": "पूर्वनिर्धारित गोपनीयताले हाम्रो टोलीको कुराकानी परिवर्तन गर्यो। हरेक सन्देश सिल, हामीले छानेकाले मात्र पढ्न सक्छन्।" }, "name": "Liam O'"'"'Connor", "role": "Founder", "avatar": "https://randomuser.me/api/portraits/men/45.jpg" },
      { "quote": { "en": "Finally a platform that respects my attention. No algorithm sorting my friends. Just the people I want to hear from.", "ne": "अन्तमा एउटा प्ल्याटफर्म जसले मेरो ध्यानको सम्मान गर्छ। कुनै एल्गोरिदमले मेरा साथीलाई छान्दैन।" }, "name": "Sofia Marchetti", "role": "Writer", "avatar": "https://randomuser.me/api/portraits/women/90.jpg" },
      { "quote": { "en": "We moved our whole studio into Tirbeo Collab. The focused interface keeps the work front and center, not the noise.", "ne": "हामीले सबै स्टुडियो तिर्बिओ कोलाबमा ल्यायौं। केन्द्रित इन्टरफेसले कामलाई केन्द्रमा राख्छ।" }, "name": "Noah Bergström", "role": "Director", "avatar": "https://randomuser.me/api/portraits/men/85.jpg" },
      { "quote": { "en": "I left three other apps in a week. Tirbeo is the only feed where I actually know everyone I'"'"'m talking to.", "ne": "मैले एक हप्तामा अरू तीन एप छोडें। तिर्बिओ मात्र त्यो फिड हो जहाँ म सबैसँग चिन्छु।" }, "name": "Hana Kim", "role": "Product Designer", "avatar": "https://randomuser.me/api/portraits/women/25.jpg" },
      { "quote": { "en": "The live rooms feel intimate even at 40 people. Conversations breathe instead of getting buried in a feed.", "ne": "लाइभ रूम ४० जनामा पनि नजिक लाग्छ। कुराकानी फिडमा हराइन बरु सास फेर्छ।" }, "name": "Marcus Webb", "role": "Indie Hacker", "avatar": "https://randomuser.me/api/portraits/men/52.jpg" },
      { "quote": { "en": "Saved a whole research thread to my library and reused it in two communities. That portability is unreal.", "ne": "मैले एउटा अनुसन्धान थ्रेड लाइब्रेरीमा बचाएँ र दुई समुदायमा फेरि प्रयोग गरें। त्यो पोर्टेबिलिटी अविश्वसनीय छ।" }, "name": "Yuki Tanaka", "role": "Researcher", "avatar": "https://randomuser.me/api/portraits/women/33.jpg" }
    ]
  }'::jsonb,
  'Testimonials: heading, sub-heading, array of {quote:{en,ne}, name, role, avatar}. All 11 testimonials configurable from admin.'
) on conflict (section) do nothing;

-- preview: App preview section (live feed mockup)
-- This section shows the live app preview with sidebar, communities, feed, and live viewers.
-- Fields:
--   heading    : bilingual section heading
--   sub        : bilingual section description
--   appTitle   : bilingual app title in mockup header
--   trending   : bilingual "Trending Communities" label
--   join       : bilingual "Join" button text
--   watching   : bilingual "watching" label
--   live       : bilingual "Live" badge text
--   home       : bilingual "Home" sidebar label
--   share      : bilingual "Share" button text
--   members    : bilingual "members" label
--   sidebar    : array of { id, icon (lucide name), label:{en,ne} }
--   communities: array of { name:{en,ne}, members (string like "128K") }
--   feed       : array of { id, user (handle), time, text:{en,ne}, likes, replies }
insert into site_config (section, data, description) values (
  'preview',
  '{
    "heading": { "en": "See Tirbeo live.", "ne": "तिर्बिओ लाइभ हेर्नुहोस्।" },
    "sub": { "en": "A peek at the app — your feed, communities and conversations.", "ne": "एपको झलक — तपाईंको फिड, समुदाय र कुराकानी।" },
    "appTitle": { "en": "Tirbeo App — Preview", "ne": "तिर्बिओ एप — पूर्वावलोकन" },
    "trending": { "en": "Trending Communities", "ne": "ट्रेन्डिङ समुदायहरू" },
    "join": { "en": "Join", "ne": "सामिल हुनुहोस्" },
    "watching": { "en": "watching", "ne": "हेरिरहेका" },
    "live": { "en": "Live", "ne": "लाइभ" },
    "home": { "en": "Home", "ne": "गृह" },
    "share": { "en": "Share", "ne": "साझा गर्नुहोस्" },
    "members": { "en": "members", "ne": "सदस्य" },
    "sidebar": [
      { "id": "profile", "icon": "Users", "label": { "en": "Profile", "ne": "प्रोफाइल" } },
      { "id": "security", "icon": "Globe", "label": { "en": "Security", "ne": "सुरक्षा" } },
      { "id": "workspace", "icon": "TrendingUp", "label": { "en": "Workspace", "ne": "कार्यस्थान" } },
      { "id": "notifications", "icon": "Bell", "label": { "en": "Notifications", "ne": "सूचनाहरू" } },
      { "id": "integrations", "icon": "Zap", "label": { "en": "Integrations", "ne": "एकीकरणहरू" } },
      { "id": "preferences", "icon": "MessageCircle", "label": { "en": "Preferences", "ne": "प्राथमिकताहरू" } },
      { "id": "activity", "icon": "Share2", "label": { "en": "Activity", "ne": "गतिविधि" } },
      { "id": "help", "icon": "Heart", "label": { "en": "Help & Support", "ne": "सहायता र समर्थन" } }
    ],
    "communities": [
      { "name": { "en": "Design Culture", "ne": "डिजाइन संस्कृति" }, "members": "128K" },
      { "name": { "en": "Builders", "ne": "निर्माताहरू" }, "members": "94K" },
      { "name": { "en": "Indie Creators", "ne": "स्वतन्त्र निर्माता" }, "members": "210K" },
      { "name": { "en": "Music Underground", "ne": "संगीत अन्डरग्राउन्ड" }, "members": "76K" }
    ],
    "feed": [
      { "id": 1, "user": "@maya", "time": "12m", "text": { "en": "Shipped my first community drop on Tirbeo — the threading is unreal. 🚀", "ne": "तिर्बिओमा मेरो पहिलो समुदाय पोस्ट सारेँ — थ्रेडिङ अविश्वसनीय छ। 🚀" }, "likes": 1200, "replies": 84 },
      { "id": 2, "user": "@devon", "time": "34m", "text": { "en": "Finally a feed that doesn'"'"'t make me feel worse after scrolling. Love this.", "ne": "अन्ततः एउटा फिड जसले स्क्रोल गरेपछि नराम्रो महसुस गराउँदैन। मन पर्यो।" }, "likes": 3400, "replies": 210 },
      { "id": 3, "user": "@studio", "time": "1h", "text": { "en": "Live session Friday at 6PM. Bringing the whole design team. Who'"'"'s in?", "ne": "शुक्रबार साँझ ६ बजे लाइभ सेसन। सबै डिजाइन टिम ल्याउँदैछु। को सामिल हुन्छ?" }, "likes": 890, "replies": 56 }
    ]
  }'::jsonb,
  'App preview section: heading, sidebar items, communities, feed posts with bilingual text, live viewer count. All configurable from admin.'
) on conflict (section) do nothing;

-- ═════════════════════════════════════════════════════════════════════════════
-- RLS — allow anonymous read, authenticated write
-- ═════════════════════════════════════════════════════════════════════════════

alter table site_config enable row level security;

-- Anyone can read (public site needs config)
create policy "Public read access"
  on site_config for select
  using (true);

-- Only authenticated users (admins) can update
create policy "Authenticated write access"
  on site_config for update
  using (auth.role() = 'authenticated');

-- Only authenticated users can insert new sections
create policy "Authenticated insert access"
  on site_config for insert
  with check (auth.role() = 'authenticated');
