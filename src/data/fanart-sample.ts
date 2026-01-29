export interface FanartItem {
  imageUrl: string;
  tweetUrl: string;
  author: string;
}

export const FANART_SAMPLE: FanartItem[] = [
  {
    imageUrl:
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=60',
    tweetUrl: 'https://x.com/example/status/1234567890',
    author: '@mcsr_artist',
  },
  {
    imageUrl:
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=60',
    tweetUrl: 'https://x.com/example/status/2345678901',
    author: '@speedrun_art',
  },
  {
    imageUrl:
      'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=900&q=60',
    tweetUrl: 'https://x.com/example/status/3456789012',
    author: '@blockbrush',
  },
  {
    imageUrl:
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=60',
    tweetUrl: 'https://x.com/example/status/4567890123',
    author: '@netherframe',
  },
];
