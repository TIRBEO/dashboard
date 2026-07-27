import type { Intent } from './types';
import { GREETING_INTENTS } from './greetings';
import { GENERAL_INTENTS } from './general';
import { COLLAB_INTENTS } from './collab';
import { COMMUNITY_INTENTS } from './communities';
import { MESSAGING_INTENTS } from './messaging';
import { PRIVACY_INTENTS } from './privacy';
import { ACCOUNT_INTENTS } from './accounts';
import { STARTUP_INTENTS } from './startups';
import { TECH_INTENTS } from './tech';
import { SUPPORT_INTENTS } from './support';

export const ALL_INTENTS: Intent[] = [
  ...GREETING_INTENTS,      // 20
  ...GENERAL_INTENTS,       // 50
  ...COLLAB_INTENTS,        // 40
  ...COMMUNITY_INTENTS,     // 30
  ...MESSAGING_INTENTS,     // 25
  ...PRIVACY_INTENTS,       // 35
  ...ACCOUNT_INTENTS,       // 40
  ...STARTUP_INTENTS,       // 50
  ...TECH_INTENTS,          // 30
  ...SUPPORT_INTENTS,       // 50
];

export type { Intent } from './types';
