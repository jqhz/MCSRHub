import type { CardItem } from '@src/data/content';

/** Public site never surfaces archived cards. */
export const isPublicCard = (card: CardItem) => !card.archived;

export const filterPublicCards = (cards: CardItem[]) =>
  cards.filter(isPublicCard);
