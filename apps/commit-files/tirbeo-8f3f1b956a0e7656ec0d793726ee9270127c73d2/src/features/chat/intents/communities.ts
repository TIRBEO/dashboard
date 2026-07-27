import type { Intent } from './types';

export const COMMUNITY_INTENTS: Intent[] = [
  // ── What are Communities ──
  {
    patterns: [/what are communities\b/i, /what is a community\b/i, /explain communities\b/i, /tell me about communities\b/i],
    reply: "Communities on Tirbeo are spaces where people share ideas, ask questions, collaborate on projects, and build meaningful relationships around common interests.",
  },
  {
    patterns: [/community\b/i, /communities\b/i, /a community\b/i],
    reply: "Communities are where people share ideas, ask questions, collaborate on projects, and build meaningful relationships around common interests.",
  },

  // ── Joining ──
  {
    patterns: [/join community\b/i, /how to join\b/i, /join a community\b/i, /become a member\b/i],
    reply: "You can join communities that match your interests and participate in discussions, projects, and collaboration.",
  },
  {
    patterns: [/find communities\b/i, /discover communities\b/i, /search communities\b/i, /browse communities\b/i, /community directory\b/i],
    reply: "You can browse and discover communities based on your interests, goals, and the topics you care about.",
  },
  {
    patterns: [/recommend communities\b/i, /suggest communities\b/i, /best communities\b/i, /popular communities\b/i],
    reply: "Community recommendations depend on your interests. Explore the community directory to find ones that match what you're looking for.",
  },

  // ── Creating ──
  {
    patterns: [/create community\b/i, /start a community\b/i, /make a community\b/i, /community creation\b/i, /build a community\b/i],
    reply: "You can create your own community on Tirbeo to bring people together around a shared topic or goal.",
  },
  {
    patterns: [/manage community\b/i, /administrate\b/i, /community admin\b/i, /community owner\b/i, /community settings\b/i],
    reply: "Community administrators can manage settings, members, and content to keep their community healthy and active.",
  },

  // ── Privacy ──
  {
    patterns: [/public community\b/i, /private community\b/i, /community types\b/i, /open community\b/i, /closed community\b/i, /secret community\b/i],
    reply: "Communities may offer different privacy settings depending on how they're managed — from fully public to invite-only.",
  },
  {
    patterns: [/community rules\b/i, /community guidelines\b/i, /rules\b/i, /guidelines\b/i],
    reply: "Each community can set its own guidelines to maintain a respectful and productive environment.",
  },

  // ── Activity ──
  {
    patterns: [/community activity\b/i, /active community\b/i, /dead community\b/i, /inactive community\b/i, /dead\b/i],
    reply: "Community activity varies. You can check a community's recent posts and member count to gauge activity levels.",
  },
  {
    patterns: [/community members\b/i, /how many members\b/i, /member count\b/i, /population\b/i],
    reply: "Community sizes vary. You can see member counts when browsing communities on Tirbeo.",
  },

  // ── Content ──
  {
    patterns: [/post in community\b/i, /share in community\b/i, /start discussion\b/i, /create post\b/i, /new post\b/i],
    reply: "You can start discussions, share ideas, and contribute content in any community you've joined.",
  },
  {
    patterns: [/community content\b/i, /what to post\b/i, /content ideas\b/i, /share knowledge\b/i],
    reply: "Share knowledge, ask questions, start discussions, post projects, or collaborate with other community members.",
  },
  {
    patterns: [/question\b/i, /ask question\b/i, /ask\b/i, /help me\b/i, /need answer\b/i],
    reply: "You can ask questions in relevant communities and get answers from experienced members.",
  },

  // ── Moderation ──
  {
    patterns: [/community moderation\b/i, /moderate\b/i, /moderator\b/i, /mod\b/i, /remove post\b/i, /ban user\b/i],
    reply: "Community moderators help maintain a healthy environment by enforcing community guidelines and managing content.",
  },
  {
    patterns: [/report\b/i, /report user\b/i, /report post\b/i, /flag\b/i, /inappropriate\b/i, /harassment\b/i, /abuse\b/i, /spam\b/i],
    reply: "You can report inappropriate content or behavior. Tirbeo takes community safety seriously.",
  },
  {
    patterns: [/block\b/i, /block user\b/i, /blocked\b/i, /mute\b/i, /muted\b/i],
    reply: "You can block or mute users to control your experience and maintain your comfort in communities.",
  },

  // ── Interaction ──
  {
    patterns: [/reply in community\b/i, /respond to\b/i, /comment\b/i, /commenting\b/i],
    reply: "You can reply to posts and comments to participate in community discussions.",
  },
  {
    patterns: [/mention\b/i, /tag\b/i, /@mention\b/i, /ping\b/i],
    reply: "You can mention or tag other community members to draw their attention to specific discussions.",
  },
  {
    patterns: [/like\b/i, /upvote\b/i, /react\b/i, /reaction\b/i, /heart\b/i],
    reply: "You can react to posts and comments to show engagement and appreciation.",
  },

  // ── Community Types ──
  {
    patterns: [/interest-based\b/i, /topic community\b/i, /niche\b/i],
    reply: "Communities on Tirbeo are organized around shared interests, topics, and goals.",
  },
  {
    patterns: [/local community\b/i, /regional\b/i, /city\b/i, /area\b/i],
    reply: "You can find local or regional communities to connect with people in your area.",
  },
  {
    patterns: [/professional community\b/i, /industry community\b/i, /tech community\b/i],
    reply: "There are professional communities for various industries and topics on Tirbeo.",
  },

  // ── Ownership ──
  {
    patterns: [/community ownership\b/i, /own your community\b/i, /data ownership\b/i, /community data\b/i],
    reply: "Communities on Tirbeo are designed to give owners control over their spaces and data.",
  },
  {
    patterns: [/migrate\b/i, /import\b/i, /export community\b/i, /bring community\b/i],
    reply: "I don't have confirmed details about community migration tools yet.",
  },

  // ── Monetization ──
  {
    patterns: [/monetize community\b/i, /charge for community\b/i, /paid community\b/i, /community monetization\b/i],
    reply: "I don't have confirmed information about community monetization features yet. Any such features will be announced officially.",
  },
];
