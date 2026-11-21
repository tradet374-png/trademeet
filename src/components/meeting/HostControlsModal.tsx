// src/components/meeting/HostControlsModal.tsx
import React from 'react';
import { useSocket } from '../../context/SocketContext';
import {
  Crown,
  VolumeX,
  Lock,
  Unlock,
  Share2,
  PhoneOff,
  Users
} from 'lucide-react';

interface HostControlsModalProps {
  onClose: () => void;
}

export const HostControlsModal: React.FC<HostControlsModalProps> = ({ onClose }) => {
  const {
    currentRoom,
    updateRoomSettings,
    endMeeting,
    participants,
    muteParticipant,
    currentParticipant,
  } = useSocket();

  const handleMuteAll = () => {
    participants.forEach((p) => {
      if (p.id !== currentParticipant?.id && p.role !== 'host') {
        muteParticipant(p.id);
      }
    });
    alert('Mute request sent to all participants in this room.');
  };

  const handleToggleScreenShare = () => {
    updateRoomSettings({
      allowScreenShare: !currentRoom?.allowScreenShare,
    });
  };

  const handleToggleLock = () => {
    updateRoomSettings({
      isLocked: !currentRoom?.isLocked,
    });
  };

  const handleEndMeeting = () => {
    if (confirm('Are you sure you want to end this meeting for everyone in Server ' + currentRoom?.serverNumber + '?')) {
      endMeeting();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#151B2B] border border-[#232D42] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#232D42] bg-[#1A2234] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-sm uppercase tracking-wide">
              Host Room Controls • Server #{currentRoom?.serverNumber}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#929BAD] hover:text-white p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Mute All Action */}
          <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-[#232D42] flex items-center justify-between">
            <div>
              <p className="font-semibold text-white text-xs">Mute All Participants</p>
              <p className="text-[11px] text-[#5F6B84]">Immediately silence everyone except host</p>
            </div>
            <button
              onClick={handleMuteAll}
              className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-bold text-xs flex items-center gap-1.5"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>Mute All</span>
            </button>
          </div>

          {/* Toggle Screen Share Rights (Simultaneous Screen Sharing) */}
          <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-[#232D42] flex items-center justify-between">
            <div>
              <p className="font-semibold text-white text-xs">Simultaneous Screen Sharing</p>
              <p className="text-[11px] text-[#5F6B84]">
                {currentRoom?.allowScreenShare
                  ? 'All participants can share their screen at the same time'
                  : 'Screen sharing restricted to Host only'}
              </p>
            </div>
            <button
              onClick={handleToggleScreenShare}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs border transition-all ${
                currentRoom?.allowScreenShare
                  ? 'bg-[#00C896]/20 text-[#00C896] border-[#00C896]/40'
                  : 'bg-[#151B2B] text-[#929BAD] border-[#232D42]'
              }`}
            >
              {currentRoom?.allowScreenShare ? 'All Allowed' : 'Host Only'}
            </button>
          </div>

          {/* Lock Room */}
          <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-[#232D42] flex items-center justify-between">
            <div>
              <p className="font-semibold text-white text-xs">Lock Meeting Room</p>
              <p className="text-[11px] text-[#5F6B84]">
                {currentRoom?.isLocked ? 'Room is locked (No new entries)' : 'Room is open to any trader'}
              </p>
            </div>
            <button
              onClick={handleToggleLock}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs border transition-all ${
                currentRoom?.isLocked
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-[#151B2B] text-[#929BAD] border-[#232D42]'
              }`}
            >
              {currentRoom?.isLocked ? 'Locked' : 'Unlocked'}
            </button>
          </div>

          {/* End Meeting for All */}
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center justify-between mt-2">
            <div>
              <p className="font-semibold text-red-400 text-xs">End Meeting for All</p>
              <p className="text-[11px] text-red-400/70">Disconnect all participants and close server</p>
            </div>
            <button
              onClick={handleEndMeeting}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/30 transition-all flex items-center gap-1.5"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>End All</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#232D42] bg-[#1A2234] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#1A2234] hover:bg-[#242F48] text-white font-bold text-xs border border-[#232D42]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
