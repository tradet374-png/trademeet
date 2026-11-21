// src/components/meeting/BottomBar.tsx
import React from 'react';
import { useMedia } from '../../context/MediaContext';
import { useSocket } from '../../context/SocketContext';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  StopCircle,
  MessageSquare,
  Hand,
  Settings,
  PhoneOff,
  Share2
} from 'lucide-react';

interface BottomBarProps {
  onToggleChat: () => void;
  onOpenSettings: () => void;
  isChatOpen: boolean;
  onLeave: () => void;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  onToggleChat,
  onOpenSettings,
  isChatOpen,
  onLeave,
}) => {
  const {
    isAudioMuted,
    isVideoOff,
    isScreenSharing,
    currentAudioLevel,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
  } = useMedia();

  const { currentParticipant, toggleHandRaise } = useSocket();

  const isHandRaised = currentParticipant?.isHandRaised || false;

  return (
    <div className="h-16 md:h-18 bg-[#151B2B] border-t border-[#232D42] px-2 sm:px-4 md:px-6 py-2 flex items-center justify-between z-20 shrink-0 select-none">
      {/* Left trader tag */}
      <div className="hidden sm:flex items-center gap-2 text-xs text-[#929BAD] sm:min-w-[120px]">
        <div
          style={{ backgroundColor: currentParticipant?.avatarColor || '#00C896' }}
          className="w-2.5 h-2.5 rounded-full"
        />
        <span className="truncate font-medium">{currentParticipant?.name}</span>
      </div>

      {/* Center Controls (Mic, Video, Screen Share, Chat, Hand) */}
      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 mx-auto">
        {/* Microphone Button */}
        <button
          onClick={toggleAudio}
          title={isAudioMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          className={`relative p-2.5 sm:p-3 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all ${
            isAudioMuted
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
              : 'bg-[#00C896] text-[#0B0F19] hover:bg-[#00B083] shadow-lg shadow-[#00C896]/20 font-bold'
          }`}
        >
          {isAudioMuted ? <MicOff className="w-4.5 h-4.5 sm:w-5 sm:h-5" /> : <Mic className="w-4.5 h-4.5 sm:w-5 sm:h-5" />}

          {/* Volume wave meter badge on active mic */}
          {!isAudioMuted && currentAudioLevel > 15 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
          )}
        </button>

        {/* Video Camera Button */}
        <button
          onClick={toggleVideo}
          title={isVideoOff ? 'Turn Camera ON' : 'Turn Camera OFF'}
          className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all ${
            isVideoOff
              ? 'bg-[#1A2234] text-[#929BAD] hover:text-white hover:bg-[#242F48] border border-[#232D42]'
              : 'bg-[#00C896] text-[#0B0F19] hover:bg-[#00B083] shadow-lg shadow-[#00C896]/20'
          }`}
        >
          {isVideoOff ? <VideoOff className="w-4.5 h-4.5 sm:w-5 sm:h-5" /> : <Video className="w-4.5 h-4.5 sm:w-5 sm:h-5" />}
        </button>

        {/* Simultaneous Screen Share Button - All can share at a time! */}
        <button
          onClick={isScreenSharing ? stopScreenShare : startScreenShare}
          title={isScreenSharing ? 'Stop Sharing Your Screen' : 'Share Your Screen (Simultaneous sharing enabled)'}
          className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all gap-1.5 ${
            isScreenSharing
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 animate-pulse px-3 sm:px-4'
              : 'bg-[#1A2234] text-[#929BAD] hover:text-white hover:bg-[#242F48] border border-[#232D42]'
          }`}
        >
          {isScreenSharing ? <StopCircle className="w-4.5 h-4.5 sm:w-5 sm:h-5" /> : <Monitor className="w-4.5 h-4.5 sm:w-5 sm:h-5" />}
          {isScreenSharing && <span className="text-xs font-bold hidden md:inline">Stop Screen</span>}
        </button>

        <div className="h-5 sm:h-6 w-px bg-[#232D42] mx-0.5 sm:mx-1"></div>

        {/* Chat Toggle Button */}
        <button
          onClick={onToggleChat}
          title="Toggle Text Chat & GIFs"
          className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all ${
            isChatOpen
              ? 'bg-[#00C896]/20 text-[#00C896] border border-[#00C896]/40'
              : 'bg-[#1A2234] text-[#929BAD] hover:text-white hover:bg-[#242F48] border border-[#232D42]'
          }`}
        >
          <MessageSquare className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
        </button>

        {/* Hand Raise Button */}
        <button
          onClick={toggleHandRaise}
          title={isHandRaised ? 'Lower Hand' : 'Raise Hand'}
          className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all ${
            isHandRaised
              ? 'bg-yellow-500 text-[#0B0F19] font-bold shadow-lg shadow-yellow-500/30 animate-bounce'
              : 'bg-[#1A2234] text-[#929BAD] hover:text-white hover:bg-[#242F48] border border-[#232D42]'
          }`}
        >
          <Hand className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          title="Device Settings"
          className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#1A2234] text-[#929BAD] hover:text-white hover:bg-[#242F48] border border-[#232D42] transition-all"
        >
          <Settings className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Right: Leave Meeting Button */}
      <div className="flex items-center justify-end sm:min-w-[120px]">
        <button
          onClick={onLeave}
          title="Leave Live Meeting"
          className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-red-500/25 transition-all active:scale-95"
        >
          <PhoneOff className="w-4 h-4" />
          <span className="hidden sm:inline">Leave</span>
        </button>
      </div>
    </div>
  );
};
