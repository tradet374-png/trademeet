// src/components/participants/ParticipantList.tsx
import React, { useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { Participant, UserRole } from '../../types';
import {
  Users,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Hand,
  Crown,
  Shield,
  Search,
  VolumeX,
  UserX,
  ChevronDown
} from 'lucide-react';

export const ParticipantList: React.FC = () => {
  const {
    participants,
    currentParticipant,
    isHost,
    muteParticipant,
    kickParticipant,
    updateParticipantRole,
    currentRoom,
  } = useSocket();

  const [searchQuery, setSearchQuery] = useState('');

  const filtered = participants.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canModerate = isHost || currentParticipant?.role === 'moderator';

  return (
    <div className="flex flex-col h-full w-full bg-[#151B2B] border-l border-[#232D42] select-none">
      {/* Header */}
      <div className="p-3 border-b border-[#232D42] bg-[#1A2234] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#00C896]" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Connected Traders
          </span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-[#0B0F19] border border-[#232D42] text-[11px] font-mono text-[#00C896] font-bold">
          {participants.length}
        </span>
      </div>

      {/* Search Bar */}
      <div className="p-2.5 border-b border-[#232D42] bg-[#0B0F19] shrink-0">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#5F6B84] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search traders in server..."
            className="w-full bg-[#151B2B] border border-[#232D42] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-[#5F6B84] focus:outline-none focus:border-[#00C896]"
          />
        </div>
      </div>

      {/* Trader Rows */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.map((p) => {
          const isMe = p.id === currentParticipant?.id;
          const isTargetHost = p.role === 'host';

          return (
            <div
              key={p.id}
              className="flex items-center justify-between p-2 rounded-xl bg-[#1A2234]/60 hover:bg-[#1A2234] border border-transparent hover:border-[#232D42] transition-colors group"
            >
              {/* Left: Avatar & Name */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  style={{ backgroundColor: p.avatarColor }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 relative"
                >
                  {p.name.slice(0, 2).toUpperCase()}

                  {/* Active speaking indicator badge */}
                  {p.isSpeaking && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#00C896] ring-2 ring-[#151B2B] animate-pulse"></span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-white truncate max-w-[110px]">
                      {p.name}
                    </span>
                    {isMe && (
                      <span className="text-[10px] text-[#00C896] font-mono">(You)</span>
                    )}
                  </div>

                  {/* Role badge */}
                  <div className="flex items-center gap-1 mt-0.5">
                    {p.role === 'host' ? (
                      <span className="text-[10px] font-bold text-amber-400 flex items-center gap-0.5">
                        <Crown className="w-2.5 h-2.5" />
                        Host
                      </span>
                    ) : p.role === 'moderator' ? (
                      <span className="text-[10px] font-bold text-blue-400 flex items-center gap-0.5">
                        <Shield className="w-2.5 h-2.5" />
                        Moderator
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#5F6B84]">Trader</span>
                    )}

                    {p.isHandRaised && (
                      <span className="px-1 py-0.2 rounded bg-yellow-400/20 text-yellow-400 text-[9px] font-bold flex items-center gap-0.5">
                        <Hand className="w-2.5 h-2.5" />
                        Raised
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Media Status & Host Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Mic & Video icons */}
                {p.isAudioMuted ? (
                  <MicOff className="w-3.5 h-3.5 text-red-400" />
                ) : (
                  <Mic className="w-3.5 h-3.5 text-[#00C896]" />
                )}

                {p.isVideoOff ? (
                  <VideoOff className="w-3.5 h-3.5 text-[#5F6B84]" />
                ) : (
                  <Video className="w-3.5 h-3.5 text-[#00C896]" />
                )}

                {/* Host actions menu */}
                {canModerate && !isMe && !isTargetHost && (
                  <div className="flex items-center gap-1 pl-1 ml-1 border-l border-[#232D42]">
                    <button
                      onClick={() => muteParticipant(p.id)}
                      title="Mute Participant"
                      className="p-1 rounded hover:bg-[#232D42] text-[#929BAD] hover:text-red-400 transition-colors"
                    >
                      <VolumeX className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => kickParticipant(p.id, 'Removed by room host')}
                      title="Remove Participant"
                      className="p-1 rounded hover:bg-[#232D42] text-[#929BAD] hover:text-red-500 transition-colors"
                    >
                      <UserX className="w-3.5 h-3.5" />
                    </button>

                    {isHost && (
                      <button
                        onClick={() =>
                          updateParticipantRole(
                            p.id,
                            p.role === 'moderator' ? 'participant' : 'moderator'
                          )
                        }
                        title={p.role === 'moderator' ? 'Demote to Participant' : 'Promote to Moderator'}
                        className={`p-1 rounded hover:bg-[#232D42] transition-colors ${
                          p.role === 'moderator' ? 'text-blue-400' : 'text-[#929BAD] hover:text-blue-400'
                        }`}
                      >
                        <Shield className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
