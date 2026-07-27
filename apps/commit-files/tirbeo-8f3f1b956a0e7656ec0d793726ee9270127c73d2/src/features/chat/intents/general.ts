import type { Intent } from './types';

export const GENERAL_INTENTS: Intent[] = [
  // ── What is Tirbeo ──
  {
    patterns: [/what is tirbeo\b/i, /what'?s tirbeo\b/i, /tell me about tirbeo\b/i, /explain tirbeo\b/i, /what does tirbeo do\b/i, /about tirbeo\b/i],
    reply: "Tirbeo is a privacy-first platform built for meaningful conversations, communities, collaboration, and discovering opportunities. It helps people connect, share ideas, build projects, and grow together.",
  },
  {
    patterns: [/what is tirbeo collab\b/i, /tell me about collab\b/i, /about collab\b/i, /tirbeo collab\b/i],
    reply: "Tirbeo Collab is a professional collaboration platform where founders, developers, designers, freelancers, creators, investors, and businesses can connect, build teams, and work together on meaningful projects.",
  },
  {
    patterns: [/who is tirbeo for\b/i, /who can use tirbeo\b/i, /who uses tirbeo\b/i, /is tirbeo for everyone\b/i, /target audience\b/i],
    reply: "Tirbeo is built for creators, students, professionals, founders, developers, freelancers, communities, and businesses who want meaningful connections.",
  },
  {
    patterns: [/why was tirbeo created\b/i, /why create tirbeo\b/i, /why tirbeo\b/i, /problem tirbeo solves\b/i, /what problem\b/i],
    reply: "Tirbeo was created to improve online interactions by focusing on meaningful conversations, privacy, communities, and real collaboration instead of noisy engagement algorithms.",
  },
  {
    patterns: [/what makes tirbeo different\b/i, /how is tirbeo different\b/i, /why use tirbeo\b/i, /tirbeo vs\b/i, /compared to\b/i, /better than\b/i],
    reply: "Tirbeo focuses on privacy, community-driven conversations, collaboration, and meaningful relationships rather than follower counts and algorithm-driven feeds.",
  },
  {
    patterns: [/is tirbeo social media\b/i, /is tirbeo a social network\b/i, /is tirbeo a platform\b/i, /what kind of platform\b/i],
    reply: "Tirbeo is a modern social platform focused on communities, conversations, collaboration, and meaningful connections.",
  },

  // ── Mission & Vision ──
  {
    patterns: [/mission\b/i, /what is the mission\b/i, /company mission\b/i],
    reply: "Tirbeo's mission is to help people connect, collaborate, build, learn, and discover meaningful opportunities through privacy-first technology.",
  },
  {
    patterns: [/vision\b/i, /future vision\b/i, /where is tirbeo going\b/i],
    reply: "Tirbeo aims to create a privacy-first ecosystem where meaningful conversations and collaboration come before algorithms.",
  },
  {
    patterns: [/values\b/i, /core values\b/i, /what does tirbeo stand for\b/i],
    reply: "Tirbeo stands for privacy, community ownership, meaningful conversations, and builder-focused collaboration.",
  },

  // ── Company ──
  {
    patterns: [/company\b/i, /business\b/i, /what does the company do\b/i],
    reply: "Tirbeo is building products focused on privacy, collaboration, communities, startups, careers, and professional networking.",
  },
  {
    patterns: [/founder\b/i, /who founded\b/i, /creator\b/i, /who started\b/i, /ceo\b/i],
    reply: "Information about Tirbeo's founders is shared through official company announcements.",
  },
  {
    patterns: [/team\b/i, /employees\b/i, /staff\b/i, /how many people\b/i, /team size\b/i],
    reply: "Tirbeo is being built by a team focused on creating a modern, privacy-first platform for collaboration and meaningful communities.",
  },
  {
    patterns: [/where is tirbeo located\b/i, /headquarters\b/i, /based in\b/i, /office\b/i, /location\b/i, /country\b/i],
    reply: "Tirbeo's location details are shared through official company channels.",
  },
  {
    patterns: [/funding\b/i, /raised\b/i, /investment\b/i, /investors\b/i, /series\b/i, /valuation\b/i],
    reply: "I don't have confirmed information about Tirbeo's funding. Any financial updates will be shared officially.",
  },
  {
    patterns: [/revenue\b/i, /how much money\b/i, /profit\b/i, /making money\b/i, /monetiz/i],
    reply: "I don't have confirmed details about Tirbeo's revenue or monetization plans yet.",
  },

  // ── Products & Features ──
  {
    patterns: [/feature/i, /what features\b/i, /what can tirbeo do\b/i, /capabilities\b/i],
    reply: "Tirbeo offers threaded conversations, shared libraries, live audio/video rooms, communities, direct messaging, and privacy-first communication tools.",
  },
  {
    patterns: [/community/i, /communities\b/i],
    reply: "Communities are where people share ideas, ask questions, collaborate on projects, and build meaningful relationships around common interests.",
  },
  {
    patterns: [/join community\b/i, /create community\b/i, /start a community\b/i, /community creation\b/i],
    reply: "You can join communities that match your interests and participate in discussions, projects, and collaboration.",
  },
  {
    patterns: [/public community\b/i, /private community\b/i, /community types\b/i],
    reply: "Communities may offer different privacy settings depending on how they're managed.",
  },
  {
    patterns: [/thread/i, /threaded/i, /threaded conversation/i, /threads?\b/i],
    reply: "Threaded conversations keep discussions organized by grouping replies under the original topic instead of mixing everything together.",
  },
  {
    patterns: [/reply/i, /replies/i, /replying\b/i],
    reply: "Replies stay connected to the original discussion, making conversations easier to follow.",
  },
  {
    patterns: [/library\b/i, /libraries\b/i, /shared library\b/i, /save\b/i, /bookmark/i],
    reply: "Shared libraries let you save, organize, and carry your context into any community — content you actually own.",
  },
  {
    patterns: [/live\b/i, /audio\b/i, /video\b/i, /live room\b/i, /live session\b/i, /live chat\b/i],
    reply: "Live audio & video rooms are capped for real connection, not crowds — usually around 40 seats.",
  },
  {
    patterns: [/notification/i, /alerts?\b/i, /push notification/i],
    reply: "Notifications on Tirbeo are designed to keep you informed without overwhelming you. You can manage them in your settings.",
  },
  {
    patterns: [/dark mode\b/i, /theme\b/i, /light mode\b/i, /appearance\b/i],
    reply: "Tirbeo is designed with a clean, modern interface. Theme options will be available as the platform develops.",
  },

  // ── Messaging ──
  {
    patterns: [/message/i, /messages/i, /chat\b/i, /\bdm\b/i, /direct message/i],
    reply: "Messaging on Tirbeo is designed to support meaningful conversations while respecting user privacy.",
  },
  {
    patterns: [/private chat\b/i, /private message\b/i, /dm\b/i],
    reply: "Private conversations help people communicate directly while maintaining privacy.",
  },

  // ── Networking ──
  {
    patterns: [/meet people\b/i, /connect\b/i, /network\b/i, /friends?\b/i],
    reply: "You connect through shared communities, not follower graphs. Join a community, post into a thread, and the people replying are real members.",
  },
  {
    patterns: [/find people\b/i, /discover people\b/i, /search people\b/i, /people directory\b/i],
    reply: "You can discover people through communities, discussions, projects, and collaboration opportunities.",
  },

  // ── Collaboration ──
  {
    patterns: [/collaborate\b/i, /collaboration\b/i, /work together\b/i],
    reply: "Collaboration is at the core of Tirbeo. People can connect, build projects, share knowledge, and grow together.",
  },
  {
    patterns: [/teamwork\b/i, /build together\b/i, /team up\b/i],
    reply: "Tirbeo encourages collaborative communities where people can contribute ideas and build meaningful projects.",
  },

  // ── Waitlist & Launch ──
  {
    patterns: [/waitlist\b/i, /sign up\b/i, /register\b/i, /join\b/i, /how to join\b/i, /get access\b/i, /early access\b/i],
    reply: "You can join the Tirbeo waitlist to receive updates and early access when invitations become available.",
  },
  {
    patterns: [/launch\b/i, /release\b/i, /when available\b/i, /when launch\b/i, /when can i use\b/i, /coming out\b/i, /going live\b/i],
    reply: "Official launch information will be shared through Tirbeo's official announcements.",
  },
  {
    patterns: [/when will tirbeo launch\b/i, /tirbeo release date\b/i, /when is tirbeo available\b/i, /release date\b/i],
    reply: "Official launch information will be shared through Tirbeo's official announcements.",
  },

  // ── Pricing ──
  {
    patterns: [/free\b/i, /cost\b/i, /price\b/i, /pricing\b/i, /how much\b/i, /subscription\b/i, /plan\b/i, /plans?\b/i],
    reply: "Joining Tirbeo is free. Future pricing details for additional services will be announced officially.",
  },
  {
    patterns: [/premium\b/i, /paid\b/i, /pro\b/i, /enterprise\b/i],
    reply: "I don't have confirmed details about premium tiers yet. Any pricing information will be announced officially.",
  },

  // ── Apps ──
  {
    patterns: [/does tirbeo have an app\b/i, /mobile app\b/i, /android app\b/i, /ios app\b/i, /app store\b/i, /play store\b/i],
    reply: "Information about Tirbeo apps and platforms will be announced through official channels.",
  },
  {
    patterns: [/web app\b/i, /browser\b/i, /desktop app\b/i, /windows app\b/i, /mac app\b/i, /linux\b/i],
    reply: "Tirbeo is available as a web platform. Information about desktop and mobile apps will be announced officially.",
  },
  {
    patterns: [/api\b/i, /developer api\b/i, /rest api\b/i, /graphql\b/i, /webhook\b/i, /sdk\b/i],
    reply: "I don't have confirmed information about a public API yet. Any future developer tools will be announced officially.",
  },

  // ── Availability ──
  {
    patterns: [/where is tirbeo available\b/i, /which countries\b/i, /availability\b/i, /region\b/i, /global\b/i, /worldwide\b/i],
    reply: "Tirbeo availability information will be shared officially as the platform expands.",
  },
  {
    patterns: [/language\b/i, /languages\b/i, /multi.?language\b/i, /nepali\b/i, /english\b/i, /translation\b/i],
    reply: "Tirbeo aims to support multiple languages. Language details will be shared as the platform develops.",
  },

  // ── Algorithm & Feed ──
  {
    patterns: [/algorithm\b/i, /feed\b/i, /timeline\b/i, /how does the feed work\b/i, /no algorithm\b/i],
    reply: "No algorithm sorting your friends. You see the people you want to hear from, in order.",
  },
  {
    patterns: [/content moderation\b/i, /moderation\b/i, /moderator\b/i, /mod\b/i, /community guidelines\b/i],
    reply: "Tirbeo maintains community guidelines to ensure respectful, meaningful interactions across all communities.",
  },

  // ── Roadmap ──
  {
    patterns: [/roadmap\b/i, /what'?s next\b/i, /plans?\b/i, /upcoming\b/i, /future features\b/i, /what are you building\b/i],
    reply: "Tirbeo's roadmap focuses on building privacy-first communities, collaboration tools, and meaningful conversations. Official updates will be shared through our channels.",
  },

  // ── Misc ──
  {
    patterns: [/competitor/i, /alternative\b/i, /similar to\b/i, /like discord\b/i, /like slack\b/i, /like reddit\b/i],
    reply: "Tirbeo is designed differently from existing platforms — it combines threaded communities, shared libraries, live rooms, and privacy-first communication in one ecosystem.",
  },
  {
    patterns: [/down\b/i, /outage\b/i, /not working\b/i, /broken\b/i, /server\b/i, /status\b/i],
    reply: "If you're experiencing issues, try refreshing the page or clearing your browser cache. If the problem persists, check our official channels for updates.",
  },
  {
    patterns: [/feedback\b/i, /suggestion\b/i, /feature request\b/i, /idea\b/i, /suggest\b/i],
    reply: "We love hearing feedback! Share your ideas through official Tirbeo channels or community forums.",
  },
  {
    patterns: [/bug\b/i, /error\b/i, /glitch\b/i, /crash\b/i],
    reply: "If you've found a bug, please report it through official Tirbeo support channels so the team can investigate.",
  },
  {
    patterns: [/update\b/i, /changelog\b/i, /what'?s new\b/i, /new features\b/i, /recent changes\b/i],
    reply: "Check Tirbeo's official announcements and changelog for the latest updates and features.",
  },
  {
    patterns: [/open source\b/i, /github\b/i, /source code\b/i, /repo\b/i],
    reply: "I don't have confirmed information about Tirbeo being open source. Any open-source plans will be announced officially.",
  },
  {
    patterns: [/partnership\b/i, /partner\b/i, /collab with\b/i, /integrate\b/i, /integration\b/i],
    reply: "I don't have confirmed information about specific partnerships yet. Partnership announcements will be made officially.",
  },
  {
    patterns: [/brand\b/i, /logo\b/i, /trademark\b/i, /press\b/i, /media kit\b/i],
    reply: "For brand, logo, or press inquiries, please reach out through official Tirbeo communication channels.",
  },
  {
    patterns: [/blog\b/i, /article\b/i, /news\b/i, /announcement\b/i],
    reply: "Check Tirbeo's official blog and announcements for the latest news and updates.",
  },
];
