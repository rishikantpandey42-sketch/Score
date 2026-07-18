export interface HouseTeam {
  id: 'red' | 'blue' | 'green' | 'yellow';
  name: string;
  color: string; // Hex or tailwind class name
  score: number;
  rank: number;
  prevRank: number;
  isLeader: boolean;
  leaderDifference: number; // Score difference from the leader
}

export interface Question {
  id: string;
  category: 'category_1' | 'category_2';
  round: string; // e.g. "Science", "Social Science", etc.
  number: number; // Question number, e.g. 1, 2, 3...
  status: 'unanswered' | 'correct' | 'wrong' | 'passed' | 'review';
  scoredTeam?: 'red' | 'blue' | 'green' | 'yellow' | null;
  pointsAwarded?: number;
}

export interface HistoryItem {
  id: string;
  timestamp: string; // HH:MM:SS format
  category: 'category_1' | 'category_2';
  round: string;
  teamId: 'red' | 'blue' | 'green' | 'yellow' | 'system';
  action: 'correct' | 'wrong' | 'pass' | 'review' | 'manual' | 'reset' | 'setup';
  points: number;
  description: string;
}

export interface CategoryData {
  id: 'category_1' | 'category_2';
  name: string; // e.g. "Category 1"
  classes: string; // e.g. "Classes 1–6" or "Classes 6–8"
  scores: Record<'red' | 'blue' | 'green' | 'yellow', number>;
  currentRoundIndex: number;
  rounds: string[];
  questions: Question[];
  currentQuestionIndex: number; // Pointer to the active question inside current round
  history: HistoryItem[];
}

export interface CompetitionConfig {
  schoolName: string;
  competitionName: string;
  schoolLogo: string; // SVG path or URL
  houseNames: Record<'red' | 'blue' | 'green' | 'yellow', string>;
  houseColors: Record<'red' | 'blue' | 'green' | 'yellow', string>;
  theme: 'light' | 'dark';
  category1Name: string;
  category1Classes: string;
  category2Name: string;
  category2Classes: string;
}

export interface SyncState {
  isOnline: boolean;
  lastSynced: string;
}
