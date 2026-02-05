export type CategorySlug =
  | 'tutorials'
  | 'tech'
  | 'documents'
  | 'downloads'
  | 'apps-tools'
  | 'discords'
  | 'youtube'
  | 'fanart';

export interface Playlist {
  id: string;
  category: CategorySlug;
  title: string;
  image: string;
  description?: string;
}

export interface CardItem {
  id: string;
  category: CategorySlug;
  playlistId?: string;
  title: string;
  description?: string;
  image?: string;
  date?: string;
  recommended?: boolean;
  searchable?: boolean;
  url: string;
}

export const CATEGORIES: { slug: CategorySlug; label: string }[] = [
  { slug: 'tutorials', label: 'Tutorials' },
  { slug: 'tech', label: 'Tech' },
  { slug: 'documents', label: 'Documents' },
  { slug: 'downloads', label: 'Downloads' },
  { slug: 'apps-tools', label: 'Apps/Tools' },
  { slug: 'discords', label: 'Discords' },
  { slug: 'youtube', label: 'YT Channels' },
  { slug: 'fanart', label: 'Fanart' },
];
