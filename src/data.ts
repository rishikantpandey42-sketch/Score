import { Question, CategoryData, CompetitionConfig } from './types';

export const DEFAULT_ROUNDS = [
  'Science',
  'Social Science',
  'Current Affairs',
  'Sports',
  'Rapid Fire'
];

export const INITIAL_CONFIG: CompetitionConfig = {
  schoolName: 'TMPS International School & College',
  competitionName: 'Inter-House Quiz Competition 2026',
  schoolLogo: '',
  houseNames: {
    red: 'Red House Team',
    blue: 'Blue House Team',
    green: 'Green House Team',
    yellow: 'Yellow House Team'
  },
  houseColors: {
    red: '#ef4444', // red-500
    blue: '#3b82f6', // blue-500
    green: '#22c55e', // green-500
    yellow: '#eab308' // yellow-500
  },
  theme: 'light',
  category1Name: 'Category 1',
  category1Classes: 'Classes 1–6',
  category2Name: 'Category 2',
  category2Classes: 'Classes 9–12'
};

// Generates numeric question slots (e.g. Question 1 to 10) for each round
export const generateQuestionsForCategory = (catId: 'category_1' | 'category_2'): Question[] => {
  const list: Question[] = [];
  DEFAULT_ROUNDS.forEach(round => {
    // 10 questions per round, 12 for rapid fire
    const count = round === 'Rapid Fire' ? 12 : 10;
    for (let i = 1; i <= count; i++) {
      list.push({
        id: `${catId}-${round.toLowerCase().replace(/\s+/g, '-')}-${i}`,
        category: catId,
        round,
        number: i,
        status: 'unanswered'
      });
    }
  });
  return list;
};

export const INITIAL_CATEGORY_DATA = (catId: 'category_1' | 'category_2'): CategoryData => ({
  id: catId,
  name: catId === 'category_1' ? INITIAL_CONFIG.category1Name : INITIAL_CONFIG.category2Name,
  classes: catId === 'category_1' ? INITIAL_CONFIG.category1Classes : INITIAL_CONFIG.category2Classes,
  scores: {
    red: 0,
    blue: 0,
    green: 0,
    yellow: 0
  },
  currentRoundIndex: 0,
  rounds: DEFAULT_ROUNDS,
  questions: generateQuestionsForCategory(catId),
  currentQuestionIndex: 0,
  history: [
    {
      id: `${catId}-init`,
      timestamp: new Date().toLocaleTimeString(),
      category: catId,
      round: DEFAULT_ROUNDS[0],
      teamId: 'system',
      action: 'setup',
      points: 0,
      description: `Competition setup initialized for ${catId === 'category_1' ? 'Category 1' : 'Category 2'}`
    }
  ]
});
