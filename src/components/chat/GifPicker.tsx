// src/components/chat/GifPicker.tsx
import React, { useState, useEffect } from 'react';
import { searchGifs } from '../../services/api';
import { Search, Flame, TrendingUp, TrendingDown, DollarSign, Rocket, Link2, Loader2, X, Sparkles, Smile, Wine, Gem } from 'lucide-react';

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
  const [showUrlInput, setShowUrlInput] = useState(false);

  const categories = [
    { id: 'trending', label: 'Trending', icon: Flame },
    { id: 'bull', label: 'Bullish 🐂', icon: TrendingUp },
    { id: 'bear', label: 'Bearish 🐻', icon: TrendingDown },
    { id: 'profit', label: 'Profit 💰', icon: DollarSign },
    { id: 'moon', label: 'To The Moon 🚀', icon: Rocket },
    { id: 'haha', label: 'Haha 😂', icon: Smile },
    { id: 'cheers', label: 'Cheers 🥂', icon: Wine },
    { id: 'hodl', label: 'Diamond Hands 💎', icon: Gem },
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
    }, 250);

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
    <div className="absolute bottom-16 right-0 left-0 sm:left-auto sm:right-2 sm:w-88 md:w-[400px] bg-[#151B2B] border border-[#232D42] rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col h-[500px] max-h-[80vh] animate-in fade-in slide-in-from-bottom-2 duration-150">
      {/* WhatsApp Style Top Header */}
      <div className="px-3.5 py-2.5 border-b border-[#232D42] flex items-center justify-between bg-[#1A2234]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#00C896]/10 flex items-center justify-center text-[#00C896]">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-white tracking-wide">GIFs & Reactions</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowUrlInput((prev) => !prev)}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              showUrlInput ? 'bg-[#00C896]/20 text-[#00C896]' : 'text-[#929BAD] hover:text-white hover:bg-[#232D42]'
            }`}
            title="Paste custom GIF or Image link"
          >
            <Link2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#929BAD] hover:text-white hover:bg-[#232D42] text-xs transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="p-3 border-b border-[#232D42] bg-[#0B0F19]/90 space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-[#5F6B84] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveCategory('');
            }}
            placeholder="Search GIPHY for any meme or reaction..."
            className="w-full bg-[#151B2B] border border-[#232D42] rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder:text-[#5F6B84] focus:outline-none focus:border-[#00C896] transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5F6B84] hover:text-white p-0.5 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* WhatsApp Style Horizontal Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
          {categories.map((c) => {
            const Icon = c.icon;
            const isSelected = activeCategory === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setActiveCategory(c.id);
                  setQuery('');
                }}
                className={`px-3 py-1 rounded-full text-[11px] font-medium flex items-center gap-1.5 shrink-0 transition-all ${
                  isSelected
                    ? 'bg-[#00C896] text-[#0B0F19] font-bold shadow-sm'
                    : 'bg-[#151B2B] text-[#929BAD] hover:text-white border border-[#232D42] hover:border-[#00C896]/40'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional Custom URL Input Drawer */}
      {showUrlInput && (
        <form onSubmit={handleCustomUrlSubmit} className="px-3 py-2 border-b border-[#232D42] bg-[#1A2234] flex gap-2 animate-in slide-in-from-top-1">
          <div className="relative flex-1">
            <Link2 className="w-3.5 h-3.5 text-[#5F6B84] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="Paste direct GIF URL (.gif, .webp)..."
              className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg pl-7 pr-2 py-1 text-xs text-white placeholder:text-[#5F6B84] focus:outline-none focus:border-[#00C896]"
            />
          </div>
          <button
            type="submit"
            disabled={!customUrl.trim()}
            className="px-3 py-1 rounded-lg bg-[#00C896] disabled:opacity-50 text-[#0B0F19] font-bold text-xs hover:bg-[#00b084] transition-colors"
          >
            Send
          </button>
        </form>
      )}

      {/* Clean WhatsApp Style GIF Grid: 2 Columns, Fixed 120px Row Height */}
      <div className="flex-1 p-3 overflow-y-auto grid grid-cols-2 gap-2.5 auto-rows-[120px] bg-[#0E131F]">
        {isLoading ? (
          <div className="col-span-2 flex flex-col items-center justify-center py-16 text-[#929BAD] text-xs gap-2.5">
            <Loader2 className="w-6 h-6 text-[#00C896] animate-spin" />
            <span className="font-medium">Loading GIFs from GIPHY...</span>
          </div>
        ) : gifs.length === 0 ? (
          <div className="col-span-2 flex flex-col items-center justify-center py-16 text-[#5F6B84] text-xs text-center px-4">
            <span className="text-2xl mb-2">🔍</span>
            <span>No GIFs found for "{query}". Try "bull", "stonks", or "moon"!</span>
          </div>
        ) : (
          gifs.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => {
                onSelectGif(g.url);
                onClose();
              }}
              className="relative w-full h-[120px] rounded-xl overflow-hidden border border-[#232D42] hover:border-[#00C896] bg-[#151B2B] transition-all hover:scale-[1.02] active:scale-95 group focus:outline-none focus:ring-2 focus:ring-[#00C896] shadow-sm flex items-center justify-center"
            >
              <img
                src={g.previewUrl || g.url}
                alt={g.title}
                loading="lazy"
                className="w-full h-full object-cover block"
              />
              {/* Subtle title banner on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 pointer-events-none">
                <span className="text-[11px] text-white font-medium truncate drop-shadow">{g.title}</span>
              </div>
              {/* WhatsApp style GIF badge */}
              <span className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-md text-white/90 text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider pointer-events-none group-hover:hidden">
                GIF
              </span>
            </button>
          ))
        )}
      </div>

      {/* WhatsApp Style Footer Indicator */}
      <div className="px-3 py-1.5 bg-[#151B2B] border-t border-[#232D42] flex items-center justify-between text-[10px] text-[#5F6B84]">
        <span>Powered by GIPHY</span>
        <span>Tap any GIF to send</span>
      </div>
    </div>
  );
};
