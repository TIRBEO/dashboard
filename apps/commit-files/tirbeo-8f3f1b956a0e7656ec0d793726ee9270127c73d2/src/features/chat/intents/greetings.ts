import type { Intent } from './types';

export const GREETING_INTENTS: Intent[] = [
  {
    patterns: [/\b(hi|hello|hey|yo|sup|hii|heyy|hola|howdy)\b/i],
    reply: "Hey! I'm Tirbeo Assistant. How can I help today?",
  },
  {
    patterns: [/\bgood morning\b/i],
    reply: "Good morning! What would you like to know about Tirbeo?",
  },
  {
    patterns: [/\bgood afternoon\b/i],
    reply: "Good afternoon! How can I help you with Tirbeo?",
  },
  {
    patterns: [/\bgood evening\b/i],
    reply: "Good evening! What can I help you with?",
  },
  {
    patterns: [/\bgood night\b/i],
    reply: "Good night! Feel free to come back anytime with your Tirbeo questions.",
  },
  {
    patterns: [/\bhow are you\b/i, /\bhow'?s it going\b/i, /\bhow r u\b/i],
    reply: "I'm doing well, thanks! How can I help you with Tirbeo today?",
  },
  {
    patterns: [/\bthank(s| you)\b/i, /\bthx\b/i, /\bty\b/i, /\bappreciate\b/i],
    reply: "You're welcome! Let me know if there's anything else.",
  },
  {
    patterns: [/\bbye\b/i, /\bgoodbye\b/i, /\bsee you\b/i, /\bsee ya\b/i, /\bcya\b/i],
    reply: "Take care! Feel free to come back anytime.",
  },
  {
    patterns: [/\bhowdy\b/i],
    reply: "Howdy! What can I help you with today?",
  },
  {
    patterns: [/\bwhat'?s up\b/i, /\bwhat's good\b/i, /\bwhats up\b/i],
    reply: "Not much! Ready to help with any Tirbeo questions you have.",
  },
  {
    patterns: [/\bok\b/i, /\bokay\b/i, /\balright\b/i, /\bsounds good\b/i, /\bnice\b/i, /\bcool\b/i, /\bgreat\b/i],
    reply: "Glad to hear it! Let me know if you need anything else.",
  },
  {
    patterns: [/\bhelp\b/i, /\bcan you help\b/i, /\bneed help\b/i, /\bi need help\b/i],
    reply: "Of course! I can help with Tirbeo, communities, privacy, collaboration, startups, careers, and more. What's on your mind?",
  },
  {
    patterns: [/\bwhat can you do\b/i, /\bwhat do you know\b/i, /\bwhat are you\b/i, /\bwho are you\b/i, /\bare you a bot\b/i],
    reply: "I'm Tirbeo Assistant, here to answer questions about Tirbeo, Tirbeo Collab, communities, startups, collaboration, privacy, and technology.",
  },
  {
    patterns: [/\bwho made you\b/i, /\bwho created you\b/i, /\bwho built you\b/i],
    reply: "I was built by the Tirbeo team to help answer your questions about the platform.",
  },
  {
    patterns: [/\bplease\b/i],
    reply: "Sure! What would you like to know?",
  },
  {
    patterns: [/\byes\b/i],
    reply: "Got it! Let me know how I can help.",
  },
  {
    patterns: [/\bno\b/i, /\bnope\b/i],
    reply: "Alright! Let me know if anything changes.",
  },
  {
    patterns: [/\baha\b/i, /\blol\b/i, /\blmao\b/i, /\bhehe\b/i, /\bhaha\b/i],
    reply: "😄 Glad you're enjoying the chat! Any Tirbeo questions?",
  },
  {
    patterns: [/\bsup\b/i, /\byo\b/i],
    reply: "Hey! What's up? Got any Tirbeo questions?",
  },
  {
    patterns: [/\bhi there\b/i, /\bhello there\b/i, /\bhey there\b/i],
    reply: "Hey there! What can I help you with?",
  },
];
