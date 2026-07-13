import { NextResponse } from 'next/server';
import { getContent } from '@src/db/queries';

// Read-only: all writes happen through the private ResourceQ app.
export const GET = async () => {
  try {
    const store = await getContent();
    return NextResponse.json(store, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to load content.' },
      { status: 500 },
    );
  }
};
