export interface Intent {
  patterns: RegExp[];
  reply: string;
}

export interface IntentCategory {
  name: string;
  intents: Intent[];
}
