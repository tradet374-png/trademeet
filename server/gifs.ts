// server/gifs.ts

export interface GifItem {
  id: string;
  title: string;
  previewUrl: string;
  url: string;
  width?: number;
  height?: number;
}

const GIPHY_API_KEY = process.env.GIPHY_API_KEY || 'sXpGFDGZs0Dv1mmNFvYaGUvYwKX0PWIh';

export async function searchGifs(query = '', category = ''): Promise<GifItem[]> {
  const q = (query || category || '').trim();

  try {
    const endpoint = q
      ? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(q)}&limit=40&rating=g`
      : `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=40&rating=g`;

    const res = await fetch(endpoint, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (res.ok) {
      const json = (await res.json()) as any;
      const data = json.data || [];
      if (data.length > 0) {
        return data.map((item: any) => ({
          id: item.id,
          title: item.title || q || 'Trending GIF',
          previewUrl:
            item.images?.fixed_height_small?.url ||
            item.images?.fixed_height?.url ||
            item.images?.downsized?.url ||
            item.images?.original?.url,
          url:
            item.images?.downsized_medium?.url ||
            item.images?.fixed_height?.url ||
            item.images?.original?.url ||
            item.images?.downsized?.url,
          width: Number(item.images?.fixed_height?.width) || 200,
          height: Number(item.images?.fixed_height?.height) || 200,
        }));
      }
    }
  } catch (err) {
    console.warn('GIPHY live search note:', err);
  }

  // High quality fallback GIFs if network is unavailable
  return [
    {
      id: 'g1',
      title: 'To The Moon Rocket',
      previewUrl: 'https://media.giphy.com/media/tXLpxypfSXvUc/giphy.gif',
      url: 'https://media.giphy.com/media/tXLpxypfSXvUc/giphy.gif',
    },
    {
      id: 'g2',
      title: 'Stonks Rising',
      previewUrl: 'https://media.giphy.com/media/YnkMcHgNIMW4Yfmjxr/giphy.gif',
      url: 'https://media.giphy.com/media/YnkMcHgNIMW4Yfmjxr/giphy.gif',
    },
    {
      id: 'g3',
      title: 'Leo Cheers Champagne',
      previewUrl: 'https://media.giphy.com/media/GCLlQnV7dXZ2E/giphy.gif',
      url: 'https://media.giphy.com/media/GCLlQnV7dXZ2E/giphy.gif',
    },
    {
      id: 'g4',
      title: 'Money Rain Profit',
      previewUrl: 'https://media.giphy.com/media/3o6gDWzmAzrpi5DQU8/giphy.gif',
      url: 'https://media.giphy.com/media/3o6gDWzmAzrpi5DQU8/giphy.gif',
    },
    {
      id: 'g5',
      title: 'Bull Market Charge',
      previewUrl: 'https://media.giphy.com/media/67ThRZlYBvibtdF9JH/giphy.gif',
      url: 'https://media.giphy.com/media/67ThRZlYBvibtdF9JH/giphy.gif',
    },
    {
      id: 'g6',
      title: 'HODL Diamond Hands',
      previewUrl: 'https://media.giphy.com/media/d0DdMCREQChi3jGymW/giphy.gif',
      url: 'https://media.giphy.com/media/d0DdMCREQChi3jGymW/giphy.gif',
    },
    {
      id: 'g7',
      title: 'Panic Sell Bear Market',
      previewUrl: 'https://media.giphy.com/media/1FMaabePDEUgiQ08n7/giphy.gif',
      url: 'https://media.giphy.com/media/1FMaabePDEUgiQ08n7/giphy.gif',
    },
    {
      id: 'g8',
      title: 'Trading Terminal Intense',
      previewUrl: 'https://media.giphy.com/media/bPCwGUF2sKjyE/giphy.gif',
      url: 'https://media.giphy.com/media/bPCwGUF2sKjyE/giphy.gif',
    },
  ];
}
