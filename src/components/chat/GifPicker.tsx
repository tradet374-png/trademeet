// src/components/chat/GifPicker.tsx
import React, { useState, useEffect } from 'react';
import { searchGifs } from '../../services/api';
import { Search, Flame, TrendingUp, TrendingDown, DollarSign, Rocket, Link2, Loader2 } from 'lucide-react';

interface GifPickerProps {
  onSelectGif: (gifUrl: string) => void;
  onClose: () => void;
}

export const GifPicker: React.FC<GifPickerProps> = ({ onSelectGif, onClose }) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('trending');
  const [gifs, setGifs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  const categories = [
    { id: 'trending', label: 'Trending', icon: Flame },
    { id: 'bull', label: 'Bullish', icon: TrendingUp },
    { id: 'bear', label: 'Bearish', icon: TrendingDown },
    { id: 'profit', label: 'Profit', icon: DollarSign },
  ];

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const results = await searchGifs(query, activeCategory);
        if (isMounted) {
          setGifs(results);
          setIsLoading(false);
        }
      } catch {
        if (isMounted) setIsLoading(false);
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [query, activeCategory]);

  const handleCustomUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      onSelectGif(customUrl.trim());
      onClose();
    }
  };

  return (
    <div className="absolute bottom-16 right-0 left-0 sm:left-auto sm:right-2 sm:w-84 md:w-96 bg-[#151B2B] border border-[#232D42] rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[460px]">
      {/* Header */}
      <div className="p-3 border-b border-[#232D42] flex items-center justify-between bg-[#1A2234]">
        <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Rocket className="w-3.5 h-3.5 text-[#00C896]" />
          <span>Trading GIFs & Reactions</span>
        </span>
        <button
          onClick={onClose}
          className="text-[#929BAD] hover:text-white text-xs px-2 py-0.5 rounded"
        >
          ✕
        </button>
      </div>

      {/* Search Input */}
      <div className="p-2.5 border-b border-[#232D42] bg-[#0B0F19]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#5F6B84] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveCategory('');
            }}
            placeholder="Search GIPHY / Tenor trading memes..."
            className="w-full bg-[#151B2B] border border-[#232D42] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-[#5F6B84] focus:outline-none focus:border-[#00C896]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 mt-2 overflow-x-auto scrollbar-none">
          {categories.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setActiveCategory(c.id);
                  setQuery('');
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 shrink-0 transition-all ${
                  activeCategory === c.id
                    ? 'bg-[#00C896] text-[#0B0F19] font-bold'
                    : 'bg-[#151B2B] text-[#929BAD] hover:text-white border border-[#232D42]'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Direct URL input */}
      <form onSubmit={handleCustomUrlSubmit} className="px-3 py-2 border-b border-[#232D42] bg-[#151B2B] flex gap-2">
        <div className="relative flex-1">
          <Link2 className="w-3.5 h-3.5 text-[#5F6B84] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="url"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="Or paste direct GIF/Image URL..."
            className="w-full bg-[#0B0F19] border border-[#232D42] rounded-md pl-7 pr-2 py-1 text-xs text-white placeholder:text-[#5F6B84] focus:outline-none focus:border-[#00C896]"
          />
        </div>
        <button
          type="submit"
          disabled={!customUrl.trim()}
          className="px-2.5 py-1 rounded-md bg-[#00C896] disabled:opacity-50 text-[#0B0F19] font-bold text-xs"
        >
          Send
        </button>
      </form>

      {/* GIF Grid Stream */}
      <div className="flex-1 p-2.5 overflow-y-auto grid grid-cols-2 gap-2 min-h-[220px]">
        {isLoading ? (
          <div className="col-span-2 flex flex-col items-center justify-center py-10 text-[#929BAD] text-xs gap-2">
            <Loader2 className="w-5 h-5 text-[#00C896] animate-spin" />
            <span>Finding top trading GIFs...</span>
          </div>
        ) : gifs.length === 0 ? (
          <div className="col-span-2 text-center py-10 text-[#5F6B84] text-xs">
            No GIFs found. Try searching for "bull", "moon", or "stonks"!
          </div>
        ) : (
          gifs.map((g) => (
            <button
              key={g.id}
              onClick={() => {
                onSelectGif(g.url);
                onClose();
              }}
              className="relative rounded-lg overflow-hidden border border-[#232D42] hover:border-[#00C896] group aspect-video bg-[#0B0F19] transition-all hover:scale-[1.02]"
            >
              <img
                src={g.previewUrl || g.url}
                alt={g.title}
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                <span className="text-[10px] text-white font-medium truncate">{g.title}</span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
