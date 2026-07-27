import { ALL_INTENTS } from './intents';

const OFFTOPIC = [
  "I'm mostly here to answer Tirbeo questions, but I can try! What's on your mind?",
  "That's a bit outside my lane, but ask away — I'll do my best.",
  "Good question. I'm built for Tirbeo, but let's see what I can do.",
  "I'll give it a shot — though Tirbeo questions are my strong suit.",
];

export function localReply(q: string, lastBot?: string): string {
  const s = q.toLowerCase().trim();

  for (const intent of ALL_INTENTS) {
    if (intent.patterns.some((p) => p.test(s))) {
      return intent.reply;
    }
  }

  let reply = OFFTOPIC[Math.floor(Math.random() * OFFTOPIC.length)];

  if (reply === lastBot) {
    reply = OFFTOPIC[(OFFTOPIC.indexOf(reply) + 1) % OFFTOPIC.length];
  }

  return reply;
}
