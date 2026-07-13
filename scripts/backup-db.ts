/**
 * Dumps all content tables from NeonDB to a timestamped JSON file in
 * backups/. Run periodically with: npm run backup
 */
import 'dotenv/config';
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

const main = async () => {
  const [categories, playlists, cards, cardCategories, playlistCards] =
    await Promise.all([
      sql`SELECT * FROM categories ORDER BY slug`,
      sql`SELECT * FROM playlists ORDER BY id`,
      sql`SELECT * FROM cards ORDER BY id`,
      sql`SELECT * FROM card_categories ORDER BY card_id, category_slug`,
      sql`SELECT * FROM playlist_cards ORDER BY playlist_id, card_id`,
    ]);

  const backup = {
    exportedAt: new Date().toISOString(),
    categories,
    playlists,
    cards,
    cardCategories,
    playlistCards,
  };

  const dir = path.join(process.cwd(), 'backups');
  mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filePath = path.join(dir, `content-backup-${stamp}.json`);
  writeFileSync(filePath, JSON.stringify(backup, null, 2), 'utf-8');

  console.log(`Backed up to ${filePath}`);
  console.log(
    `  categories: ${categories.length}, playlists: ${playlists.length}, cards: ${cards.length}`,
  );
  console.log(
    `  card_categories: ${cardCategories.length}, playlist_cards: ${playlistCards.length}`,
  );
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
