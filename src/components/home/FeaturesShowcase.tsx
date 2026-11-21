// src/components/home/FeaturesShowcase.tsx
import React from 'react';
import { Video, Mic, Monitor, MessageSquare, ShieldCheck, Zap, Image, Sparkles } from 'lucide-react';

export const FeaturesShowcase: React.FC = () => {
  const features = [
    {
      icon: Monitor,
      title: 'Simultaneous Multi-Screen Sharing',
      desc: 'All participants can share their screens at the exact same time. View multiple trader terminals side-by-side with full-screen focus.',
    },
    {
      icon: MessageSquare,
      title: 'Real-Time Text Message Chat',
      desc: 'Instant WebSocket chat stream with sender tags, role badges (Host, Mod, Trader), message timestamps, and auto-scroll.',
    },
    {
      icon: Video,
      title: 'Scalable Live Video & Voice',
      desc: 'Built on LiveKit SFU & WebRTC for crystal-clear audio and dynamic grid adjusting for 25+ active traders with active speaker detection.',
    },
    {
      icon: Sparkles,
      title: 'Trading GIFs & Reactions',
      desc: 'Express market momentum with built-in Tenor/GIPHY search, custom URL pastes, and curated trading memes (Bull, Bear, Moon, Profit).',
    },
    {
      icon: Image,
      title: 'Image File Sharing & Emojis',
      desc: 'Upload screenshots, broker statements, and trade executions directly into the chat stream with instant full-fidelity preview.',
    },
    {
      icon: ShieldCheck,
      title: 'Host & Moderator Controls',
      desc: 'Mute participants, control multi-screen sharing permissions, lock rooms against new entrants, and manage live meetings smoothly.',
    },
  ];

  return (
    <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 mb-12">
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-white mb-2">Engineered for Trading Teams & Communities</h3>
        <p className="text-sm text-[#929BAD]">Collaborate in real time with high-capacity audio/video, simultaneous screen sharing, and rich text chat.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={i}
              className="bg-[#151B2B]/60 border border-[#232D42] rounded-xl p-5 hover:border-[#00C896]/30 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-[#00C896]/10 border border-[#00C896]/20 flex items-center justify-center text-[#00C896] mb-3.5">
                <Icon className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-white text-sm mb-1.5">{f.title}</h4>
              <p className="text-xs text-[#929BAD] leading-relaxed">{f.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
