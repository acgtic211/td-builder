export type Role = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  tdJson?: unknown;
  mode: 'faq' | 'td';
  createdAt: number;
}
