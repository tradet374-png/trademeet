// src/components/meeting/TopBar.tsx
import React from 'react';
import { useSocket } from '../../context/SocketContext';
import { ViewLayoutMode } from '../../types';
import {
  TrendingUp,
  Users,
  Radio,
  Columns,
  Video,
  Monitor,
  Settings,
  Shield,
  MessageSquare,
  Share2
} from 'lucide-react';

interface TopBarProps {
  layoutMode: ViewLayoutMode;
  onLayoutChange: (mode: ViewLayoutMode) => void;
  activeSidebarTab: 'chat' | 'participants' | 'none';
  onSidebarTabChange: (tab: 'chat' | 'participants' | 'none') => void;
  onOpenSettings: () => void;
  onOpenHostControls: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  layoutMode,
  onLayoutChange,
  activeSidebarTab,
  onSidebarTabChange,
  onOpenSettings,
  onOpenHostControls,
}) => {
  const { currentRoom, participants, isConnected, isHost, activeScreens, messages } = useSocket();

  return (
    <div className="h-14 bg-[#151B2B] border-b border-[#232D42] px-3 md:px-4 flex items-center justify-between z-20 shrink-0 select-none">
      {/* Left: Brand, Server Badge & Room Info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00C896] to-[#008F6B] flex items-center justify-center shadow-md shadow-[#00C896]/20">
            <TrendingUp className="w-4 h-4 text-[#0B0F19] stroke-[2.5]" />
          </div>
          <span className="font-extrabold text-white text-base tracking-tight font-sans hidden sm:inline">
            Trade<span className="text-[#00C896]">Meet</span>
          </span>
        </div>

        {/* Server Number Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0B0F19] border border-[#232D42] font-mono">
          <span className="text-[11px] text-[#929BAD]">SERVER:</span>
          <span className="text-xs font-bold text-[#00C896]">#{currentRoom?.serverNumber}</span>
        </div>

        {/* Active Shared Screens Counter Badge */}
        {activeScreens.length > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-medium">
            <Monitor className="w-3.5 h-3.5" />
            <span>{activeScreens.length} {activeScreens.length === 1 ? 'Screen Live' : 'Screens Live'}</span>
          </div>
        )}

        {/* Connection Status Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#929BAD] pl-1">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-[#00C896] animate-pulse' : 'bg-red-400'
            }`}
          ></span>
          <span className="text-[11px] font-medium">
            {isConnected ? 'Live Connected' : 'Reconnecting...'}
          </span>
        </div>
      </div>

      {/* Center: View Layout Switcher (Split View, Screens Only, Videos Only) */}
      <div className="flex items-center bg-[#0B0F19] p-1 rounded-xl border border-[#232D42] gap-1">
        <button
          onClick={() => onLayoutChange('split')}
          title="Split View: Shared Screens & Videos Side-by-Side"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
            layoutMode === 'split'
              ? 'bg-[#1A2234] text-[#00C896] font-bold shadow-sm'
              : 'text-[#929BAD] hover:text-white'
          }`}
        >
          <Columns className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Split View</span>
        </button>

        <button
          onClick={() => onLayoutChange('screens')}
          title="Screens Only Focus"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
            layoutMode === 'screens'
              ? 'bg-[#1A2234] text-[#00C896] font-bold shadow-sm'
              : 'text-[#929BAD] hover:text-white'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Screens Only</span>
        </button>

        <button
          onClick={() => onLayoutChange('videos')}
          title="Video Grid Focus View"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
            layoutMode === 'videos'
              ? 'bg-[#1A2234] text-[#00C896] font-bold shadow-sm'
              : 'text-[#929BAD] hover:text-white'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Video Grid</span>
        </button>
      </div>

      {/* Right: Sidebar Toggles & Settings */}
      <div className="flex items-center gap-2">
        {/* Host Controls button */}
        {isHost && (
          <button
            onClick={onOpenHostControls}
            title="Host Room Settings"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold transition-all"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Host Tools</span>
          </button>
        )}

        {/* Participants Sidebar Toggle */}
        <button
          onClick={() =>
            onSidebarTabChange(activeSidebarTab === 'participants' ? 'none' : 'participants')
          }
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
            activeSidebarTab === 'participants'
              ? 'bg-[#00C896]/15 text-[#00C896] border-[#00C896]/40'
              : 'bg-[#0B0F19] text-[#929BAD] hover:text-white border-[#232D42]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span className="font-mono font-bold">{participants.length}</span>
        </button>

        {/* Chat Sidebar Toggle */}
        <button
          onClick={() =>
            onSidebarTabChange(activeSidebarTab === 'chat' ? 'none' : 'chat')
          }
          className={`relative p-1.5 rounded-lg border transition-all ${
            activeSidebarTab === 'chat'
              ? 'bg-[#00C896]/15 text-[#00C896] border-[#00C896]/40'
              : 'bg-[#0B0F19] text-[#929BAD] hover:text-white border-[#232D42]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          {messages.length > 0 && activeSidebarTab !== 'chat' && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#00C896] ring-2 ring-[#151B2B]"></span>
          )}
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          title="Audio & Video Settings"
          className="p-1.5 rounded-lg bg-[#0B0F19] hover:bg-[#1A2234] text-[#929BAD] hover:text-white border border-[#232D42] transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
