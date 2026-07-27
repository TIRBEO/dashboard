import type { Intent } from './types';

export const MESSAGING_INTENTS: Intent[] = [
  // ── Direct Messages ──
  {
    patterns: [/\bdm\b/i, /direct message\b/i, /private message\b/i, /message someone\b/i, /send message\b/i],
    reply: "Messaging on Tirbeo is designed to support meaningful conversations while respecting user privacy.",
  },
  {
    patterns: [/private chat\b/i, /private conversation\b/i, /secret chat\b/i],
    reply: "Private conversations help people communicate directly while maintaining privacy.",
  },
  {
    patterns: [/how to message\b/i, /how do i message\b/i, /send a message\b/i],
    reply: "You can send messages through community discussions or private conversations depending on your connection.",
  },

  // ── Threaded Conversations ──
  {
    patterns: [/thread\b/i, /threaded\b/i, /threaded conversation\b/i, /threads\b/i, /thread system\b/i],
    reply: "Threaded conversations keep discussions organized by grouping replies under the original topic instead of mixing everything together.",
  },
  {
    patterns: [/reply to thread\b/i, /respond to thread\b/i, /continue thread\b/i, /thread reply\b/i],
    reply: "Replies stay connected to the original discussion, making conversations easier to follow.",
  },
  {
    patterns: [/start thread\b/i, /create thread\b/i, /new thread\b/i, /begin thread\b/i],
    reply: "You can start a new thread on any topic within a community to keep the discussion focused.",
  },
  {
    patterns: [/thread organization\b/i, /organized conversation\b/i, /keep conversations organized\b/i, /no noise\b/i],
    reply: "Threads keep conversations organized — each discussion stays focused and easy to follow.",
  },

  // ── Group Chat ──
  {
    patterns: [/group chat\b/i, /group message\b/i, /group conversation\b/i, /multiple people\b/i],
    reply: "Group conversations in Tirbeo are threaded to keep discussions organized even with multiple participants.",
  },

  // ── Media ──
  {
    patterns: [/send image\b/i, /share image\b/i, /photo\b/i, /pictures?\b/i, /media\b/i, /attachment\b/i, /file\b/i, /share file\b/i],
    reply: "You can share images, files, and media within conversations and communities.",
  },
  {
    patterns: [/send gif\b/i, /giphy\b/i, /sticker\b/i, /emoji\b/i, /emoticon\b/i, /reaction\b/i],
    reply: "Express yourself with emojis, reactions, and media sharing in your conversations.",
  },

  // ── Features ──
  {
    patterns: [/edit message\b/i, /delete message\b/i, /undo message\b/i, /recall message\b/i],
    reply: "Message management features like editing and deleting will be available on Tirbeo.",
  },
  {
    patterns: [/message history\b/i, /old messages\b/i, /past messages\b/i, /search messages\b/i, /search chat\b/i],
    reply: "Your message history is preserved in your conversations and searchable within communities.",
  },
  {
    patterns: [/notification\b/i, /alert\b/i, /push notification\b/i, /message notification\b/i],
    reply: "Notifications on Tirbeo are designed to keep you informed without overwhelming you. You can manage them in your settings.",
  },

  // ── Live Chat ──
  {
    patterns: [/live chat\b/i, /live room\b/i, /live conversation\b/i, /real.?time\b/i, /real time chat\b/i],
    reply: "Live audio & video rooms are capped for real connection, not crowds — usually around 40 seats.",
  },
  {
    patterns: [/audio call\b/i, /voice chat\b/i, /voice call\b/i, /audio room\b/i],
    reply: "Live audio rooms let you have real-time conversations with other community members.",
  },
  {
    patterns: [/video call\b/i, /video chat\b/i, /video room\b/i, /face to face\b/i],
    reply: "Live video rooms let you have face-to-face conversations in smaller, focused groups.",
  },

  // ── Context ──
  {
    patterns: [/quote message\b/i, /reference message\b/i, /context\b/i, /lost context\b/i, /lost conversation\b/i],
    reply: "Threaded conversations help you never lose context — replies stay connected to the original topic.",
  },
  {
    patterns: [/reply all\b/i, /reply to everyone\b/i, /broadcast\b/i, /announce\b/i],
    reply: "You can post announcements and replies within community threads for everyone to see.",
  },

  // ── Typing ──
  {
    patterns: [/typing indicator\b/i, /is someone typing\b/i, /typing status\b/i],
    reply: "Tirbeo includes real-time features to enhance your conversation experience.",
  },

  // ── Read Status ──
  {
    patterns: [/read receipt\b/i, /seen\b/i, /read status\b/i, /online status\b/i, /last seen\b/i],
    reply: "Online and read status features help you know when people are available to chat.",
  },

  // ── Encryption ──
  {
    patterns: [/encrypted message\b/i, /message encryption\b/i, /secure message\b/i, /e2ee\b/i, /end.to.end\b/i],
    reply: "Every message is end-to-end encrypted by default — only you and who you choose can read it.",
  },
];
