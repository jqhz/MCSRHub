import type { CardItem } from '@src/data/content';
import { getCstDateString } from '@src/utils/time';

const pickDailyCard = (cards: CardItem[]) => {
  if (cards.length === 0) return null;
  const seed = Number(getCstDateString().replace(/-/g, ''));
  const index = seed % cards.length;
  return cards[index];
};

export const getDailyTip = (cards: CardItem[]) => {
  const eligibleCards = cards.filter(
    (card) => card.category === 'tech' && Boolean(card.url),
  );
  return pickDailyCard(eligibleCards);
};

export const getDailyChannel = (cards: CardItem[]) => {
  const channelCards = cards.filter(
    (card) => card.category === 'youtube' && Boolean(card.url),
  );
  return pickDailyCard(channelCards);
};
