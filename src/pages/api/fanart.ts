import type { NextApiRequest, NextApiResponse } from 'next';
import { FANART_SAMPLE } from '@src/data/fanart-sample';

interface FanartItem {
  imageUrl: string;
  tweetUrl: string;
  author: string;
}

interface TwitterMedia {
  media_key: string;
  url?: string;
  preview_image_url?: string;
}

interface TwitterUser {
  id: string;
  username: string;
}

interface TwitterTweet {
  id: string;
  text: string;
  author_id: string;
  attachments?: {
    media_keys?: string[];
  };
}

interface TwitterResponse {
  data?: TwitterTweet[];
  includes?: {
    media?: TwitterMedia[];
    users?: TwitterUser[];
  };
}

const TWITTER_URL =
  'https://api.twitter.com/2/tweets/search/recent?query=%23mcsrfanart&expansions=attachments.media_keys,author_id&media.fields=preview_image_url,url&tweet.fields=created_at';

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<{ items: FanartItem[] }>,
) {
  const token = process.env.TWITTER_BEARER_TOKEN;
  if (!token) {
    res.status(200).json({ items: FANART_SAMPLE });
    return;
  }

  try {
    const response = await fetch(TWITTER_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      res.status(200).json({ items: FANART_SAMPLE });
      return;
    }
    const payload = (await response.json()) as TwitterResponse;
    const mediaMap = new Map(
      (payload.includes?.media ?? []).map((media) => [
        media.media_key,
        media.url ?? media.preview_image_url ?? '',
      ]),
    );
    const userMap = new Map(
      (payload.includes?.users ?? []).map((user) => [
        user.id,
        `@${user.username}`,
      ]),
    );

    const items: FanartItem[] = (payload.data ?? [])
      .map((tweet) => {
        const mediaKey = tweet.attachments?.media_keys?.[0];
        const imageUrl = mediaKey ? mediaMap.get(mediaKey) : '';
        if (!imageUrl) return null;
        return {
          imageUrl,
          tweetUrl: `https://x.com/i/web/status/${tweet.id}`,
          author: userMap.get(tweet.author_id) ?? '@mcsr',
        };
      })
      .filter((item): item is FanartItem => Boolean(item));

    res.status(200).json({ items: items.length ? items : FANART_SAMPLE });
  } catch {
    res.status(200).json({ items: FANART_SAMPLE });
  }
}
