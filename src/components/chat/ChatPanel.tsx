// src/components/chat/ChatPanel.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { ChatMessage } from '../../types';
import { GifPicker } from './GifPicker';
import { EmojiPicker } from './EmojiPicker';
import {
  Send,
  Smile,
  Image as ImageIcon,
  Radio,
  Crown,
  Shield,
  Sparkles,
  Paperclip
} from 'lucide-react';

export const ChatPanel: React.FC = () => {
  const { messages, sendMessage, currentParticipant, currentRoom } = useSocket();

  const [inputVal, setInputVal] = useState('');
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    sendMessage(inputVal.trim(), 'text');
    setInputVal('');
  };

  const handleSelectGif = (gifUrl: string) => {
    sendMessage('Sent a GIF', 'gif', gifUrl);
  };

  const handleEmojiSelect = (emoji: string) => {
    setInputVal((prev) => prev + emoji);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      sendMessage('Shared an image', 'image', base64);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#151B2B] border-l border-[#232D42] relative select-none">
      {/* Top Header */}
      <div className="p-3 border-b border-[#232D42] bg-[#1A2234] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00C896] animate-pulse"></div>
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Live Chat • Server {currentRoom?.serverNumber}
          </span>
        </div>
        <span className="text-[11px] text-[#929BAD] font-mono">
          {messages.length} msgs
        </span>
      </div>

      {/* Message List Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m) => {
          const isMe = m.senderId === currentParticipant?.id;
          const isSystem = m.type === 'system';

          if (isSystem) {
            return (
              <div key={m.id} className="text-center my-2">
                <span className="inline-block px-2.5 py-1 rounded-full bg-[#0B0F19]/80 border border-[#232D42] text-[11px] text-[#929BAD] font-medium">
                  {m.content}
                </span>
              </div>
            );
          }

          return (
            <div
              key={m.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              {/* Sender Name & Role */}
              <div className="flex items-center gap-1.5 mb-1 px-1">
                <span
                  style={{ color: m.avatarColor }}
                  className="text-[11px] font-bold"
                >
                  {m.senderName} {isMe && '(You)'}
                </span>

                {m.senderRole === 'host' && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[9px] font-bold flex items-center gap-0.5">
                    <Crown className="w-2.5 h-2.5" />
                    <span>HOST</span>
                  </span>
                )}
                {m.senderRole === 'moderator' && (
                  <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 text-[9px] font-bold flex items-center gap-0.5">
                    <Shield className="w-2.5 h-2.5" />
                    <span>MOD</span>
                  </span>
                )}

                <span className="text-[10px] text-[#5F6B84] font-mono">
                  {formatTime(m.timestamp)}
                </span>
              </div>

              {/* Message Content / Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl p-2.5 text-xs select-text shadow-sm ${
                  isMe
                    ? 'bg-[#00C896] text-[#0B0F19] font-medium rounded-tr-none'
                    : 'bg-[#1A2234] text-white border border-[#232D42] rounded-tl-none'
                }`}
              >
                {/* Media Image or GIF */}
                {(m.type === 'gif' || m.type === 'image') && m.mediaUrl && (
                  <div className="rounded-xl overflow-hidden mb-1.5 max-w-[260px] bg-[#0B0F19]">
                    <img
                      src={m.mediaUrl}
                      alt="shared media"
                      className="w-full h-auto object-cover max-h-56 rounded-xl"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Text Content */}
                {m.content && m.content !== 'Sent a GIF' && m.content !== 'Shared an image' && (
                  <p className="break-words leading-relaxed">{m.content}</p>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* GIF Picker Overlay */}
      {showGifPicker && (
        <GifPicker
          onSelectGif={handleSelectGif}
          onClose={() => setShowGifPicker(false)}
        />
      )}

      {/* Emoji Picker Overlay */}
      {showEmojiPicker && (
        <EmojiPicker
          onSelect={handleEmojiSelect}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}

      {/* Chat Input Bar */}
      <div className="p-2.5 border-t border-[#232D42] bg-[#1A2234] shrink-0">
        <form onSubmit={handleSendText} className="flex flex-col gap-2">
          <div className="relative">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Send message to room..."
              className="w-full bg-[#0B0F19] border border-[#232D42] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#5F6B84] focus:outline-none focus:border-[#00C896] transition-colors"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-[#929BAD]">
              {/* GIF Button */}
              <button
                type="button"
                onClick={() => {
                  setShowGifPicker((prev) => !prev);
                  setShowEmojiPicker(false);
                }}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                  showGifPicker
                    ? 'bg-[#00C896] text-[#0B0F19] border-[#00C896]'
                    : 'bg-[#0B0F19] text-[#929BAD] hover:text-white border-[#232D42]'
                }`}
              >
                GIF
              </button>

              {/* Emoji Button */}
              <button
                type="button"
                onClick={() => {
                  setShowEmojiPicker((prev) => !prev);
                  setShowGifPicker(false);
                }}
                className={`p-1.5 rounded-lg border transition-all ${
                  showEmojiPicker
                    ? 'bg-[#00C896] text-[#0B0F19] border-[#00C896]'
                    : 'bg-[#0B0F19] text-[#929BAD] hover:text-white border-[#232D42]'
                }`}
              >
                <Smile className="w-4 h-4" />
              </button>

              {/* Image Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Share Image"
                className="p-1.5 rounded-lg bg-[#0B0F19] text-[#929BAD] hover:text-white border border-[#232D42] transition-colors"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Send Message Button */}
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="p-2 rounded-xl bg-[#00C896] hover:bg-[#00B083] disabled:opacity-40 text-[#0B0F19] font-bold transition-all shadow-md flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
