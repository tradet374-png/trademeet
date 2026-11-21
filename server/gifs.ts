// server/gifs.ts

export interface GifItem {
  id: string;
  title: string;
  previewUrl: string;
  url: string;
  width?: number;
  height?: number;
}

const CURATED_TRADING_GIFS: Record<string, GifItem[]> = {
  trending: [
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
  ],
  bull: [
    {
      id: 'b1',
      title: 'Bullish Run',
      previewUrl: 'https://media.giphy.com/media/67ThRZlYBvibtdF9JH/giphy.gif',
      url: 'https://media.giphy.com/media/67ThRZlYBvibtdF9JH/giphy.gif',
    },
    {
      id: 'b2',
      title: 'Green Candles Only',
      previewUrl: 'https://media.giphy.com/media/YnkMcHgNIMW4Yfmjxr/giphy.gif',
      url: 'https://media.giphy.com/media/YnkMcHgNIMW4Yfmjxr/giphy.gif',
    },
    {
      id: 'b3',
      title: 'Rocket Launch High',
      previewUrl: 'https://media.giphy.com/media/tXLpxypfSXvUc/giphy.gif',
      url: 'https://media.giphy.com/media/tXLpxypfSXvUc/giphy.gif',
    },
  ],
  bear: [
    {
      id: 'r1',
      title: 'Bear Trap',
      previewUrl: 'https://media.giphy.com/media/1FMaabePDEUgiQ08n7/giphy.gif',
      url: 'https://media.giphy.com/media/1FMaabePDEUgiQ08n7/giphy.gif',
    },
    {
      id: 'r2',
      title: 'Red Candle Ouch',
      previewUrl: 'https://media.giphy.com/media/QMHoU66sBXCAHonWVg/giphy.gif',
      url: 'https://media.giphy.com/media/QMHoU66sBXCAHonWVg/giphy.gif',
    },
    {
      id: 'r3',
      title: 'Stop Loss Hit',
      previewUrl: 'https://media.giphy.com/media/9Y5BbDSkSTiY8/giphy.gif',
      url: 'https://media.giphy.com/media/9Y5BbDSkSTiY8/giphy.gif',
    },
  ],
  profit: [
    {
      id: 'p1',
      title: 'Counting Cash',
      previewUrl: 'https://media.giphy.com/media/3o6gDWzmAzrpi5DQU8/giphy.gif',
      url: 'https://media.giphy.com/media/3o6gDWzmAzrpi5DQU8/giphy.gif',
    },
    {
      id: 'p2',
      title: 'Great Success',
      previewUrl: 'https://media.giphy.com/media/a0h7sAqON67nO/giphy.gif',
      url: 'https://media.giphy.com/media/a0h7sAqON67nO/giphy.gif',
    },
  ],
};

export async function searchGifs(query = '', category = ''): Promise<GifItem[]> {
  const giphyKey = process.env.GIPHY_API_KEY;
  const tenorKey = process.env.TENOR_API_KEY;

  const q = query.trim().toLowerCase();

  // Try GIPHY API if user provided an API key
  if (giphyKey) {
    try {
      const endpoint = q
        ? `https://api.giphy.com/v1/gifs/search?api_key=${giphyKey}&q=${encodeURIComponent(q)}&limit=24&rating=g`
        : `https://api.giphy.com/v1/gifs/trending?api_key=${giphyKey}&limit=24&rating=g`;
      const res = await fetch(endpoint);
      if (res.ok) {
        const json = (await res.json()) as any;
        return (json.data || []).map((item: any) => ({
          id: item.id,
          title: item.title,
          previewUrl: item.images?.fixed_height_small?.url || item.images?.downsized?.url,
          url: item.images?.original?.url || item.images?.downsized?.url,
        }));
      }
    } catch {
      // Fallback below
    }
  }

  // Try Tenor API if key provided
  if (tenorKey) {
    try {
      const endpoint = q
        ? `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(q)}&key=${tenorKey}&limit=24`
        : `https://tenor.googleapis.com/v2/featured?key=${tenorKey}&limit=24`;
      const res = await fetch(endpoint);
      if (res.ok) {
        const json = (await res.json()) as any;
        return (json.results || []).map((item: any) => ({
          id: item.id,
          title: item.content_description || 'Trading GIF',
          previewUrl: item.media_formats?.nanogif?.url || item.media_formats?.tinygif?.url,
          url: item.media_formats?.gif?.url,
        }));
      }
    } catch {
      // Fallback below
    }
  }

  // Fallback to high quality curated trading GIFs with search filtering
  const allCurated: GifItem[] = [];
  Object.values(CURATED_TRADING_GIFS).forEach((list) => {
    allCurated.push(...list);
  });

  if (!q) {
    if (category && CURATED_TRADING_GIFS[category]) {
      return CURATED_TRADING_GIFS[category];
    }
    return CURATED_TRADING_GIFS.trending;
  }

  // Filter curated
  const filtered = allCurated.filter(
    (g) => g.title.toLowerCase().includes(q) || q.includes('bull') || q.includes('bear') || q.includes('trade')
  );

  return filtered.length > 0 ? filtered : CURATED_TRADING_GIFS.trending;
}
