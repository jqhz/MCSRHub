export const getYouTubeId = (url: string): string => {
  try {
    if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1]?.split(/[?&]/)[0] ?? '';
    }
    if (url.includes('youtube.com')) {
      const params = new URL(url).searchParams;
      return params.get('v') ?? '';
    }
  } catch {
    return '';
  }
  return '';
};
