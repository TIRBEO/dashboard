export interface Message {
  id: number;
  from: 'them' | 'me';
  text: string;
  time: string;
}