export interface VoteQuestion {
  id: string;
  question: string;
  responses: string[];
  askedBefore: boolean;
}

export const VOTE_QUESTIONS: VoteQuestion[] = [
  {
    id: 'q1',
    question: 'Which structure should every new runner learn first?',
    responses: ['Village', 'Bastion', 'Fortress', 'Stronghold'],
    askedBefore: false,
  },
  {
    id: 'q2',
    question: 'Favorite early-game resource?',
    responses: ['Iron', 'Gold', 'Obsidian'],
    askedBefore: false,
  },
  {
    id: 'q3',
    question: 'Best practice category for new runners?',
    responses: ['Blind travel', 'Portal timing', 'Inventory routing'],
    askedBefore: false,
  },
  {
    id: 'q4',
    question: 'Which biome feels most consistent to route?',
    responses: ['Crimson Forest', 'Warped Forest', 'Basalt Delta'],
    askedBefore: false,
  },
];
