// src/components/chat/EmojiPicker.tsx
import React from 'react';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const TRADING_EMOJIS = [
  '🚀', '📈', '📉', '💎', '🔥', '🐂', '🐻', '💰', '🎯', '🤑',
  '🍿', '👏', '👀', '📊', '⚡', '💣', '💸', '🧠', '👑', '🤝',
  '😂', '😭', '🤯', '💀', '🙏', '💯', '🛑', '🟢', '🔴', '⭐'
];

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose }) => {
  return (
    <div className="absolute bottom-14 right-2 w-64 bg-[#151B2B] border border-[#232D42] rounded-xl shadow-2xl p-3 z-50">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#232D42]">
        <span className="text-xs font-bold text-white uppercase tracking-wider">Trading Emojis</span>
        <button
          onClick={onClose}
          className="text-[#929BAD] hover:text-white text-xs px-1"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-6 gap-2">
        {TRADING_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => {
              onSelect(emoji);
              onClose();
            }}
            className="w-8 h-8 rounded-lg hover:bg-[#232D42] text-lg flex items-center justify-center transition-transform hover:scale-125"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};
