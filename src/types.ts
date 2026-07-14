export interface HistoryItem {
  id: string;
  timestamp: string;
  type: 'number' | 'dice' | 'coin' | 'list' | 'password';
  result: string;
  details?: string;
}

export type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';

export interface DiceRollResult {
  die: DiceType;
  value: number;
}
