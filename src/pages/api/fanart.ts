import type { NextApiRequest, NextApiResponse } from 'next';
import { FANART_SAMPLE } from '@src/data/fanart-sample';

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<{ items: typeof FANART_SAMPLE }>,
) {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=3600, stale-while-revalidate=86400',
  );
  res.status(200).json({ items: FANART_SAMPLE });
}
