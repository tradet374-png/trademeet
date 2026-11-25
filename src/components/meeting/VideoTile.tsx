// src/components/meeting/VideoTile.tsx
import React, { useRef, useEffect } from 'react';
import { Participant } from '../../types';
import { useSocket } from '../../context/SocketContext';
import { useMedia } from '../../context/MediaContext';
import {
  Mic,
  MicOff,
  VideoOff,
  Hand,
  Shield,
  Crown,
  Pin,
  VolumeX,
  UserX
} from 'lucide-react';

interface VideoTileProps {
  participant: Participant;
  stream: MediaStream | null;
  isLocal: boolean;
  isSpotlight?: boolean;
  onPin?: () => void;
}

export const VideoTile: React.FC<VideoTileProps> = ({
  participant,
  stream,
  isLocal,
  isSpotlight,
  onPin,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { currentParticipant, isHost, muteParticipant, kickParticipant } = useSocket();
  const { isAudioMuted: localAudioMuted, isVideoOff: localVideoOff, currentAudioLevel } = useMedia();

  const isSpeaking = isLocal ? currentAudioLevel > 15 && !localAudioMuted : participant.isSpeaking;
  const isMuted = isLocal ? localAudioMuted : participant.isAudioMuted;

  const hasVideoTrack = Boolean(
    stream && stream.getVideoTracks().length > 0
  );

  const isVideoOff = isLocal
    ? localVideoOff
    : (participant.isVideoOff || !hasVideoTrack);

  useEffect(() => {
    if (videoRef.current && stream) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
      }
      videoRef.current.play().catch(() => {});
    }
    if (audioRef.current && stream && !isLocal) {
      if (audioRef.current.srcObject !== stream) {
        audioRef.current.srcObject = stream;
      }
      audioRef.current.play().catch(() => {});
    }
  }, [stream, isVideoOff, isLocal]);

  const canModerate =
    !isLocal &&
    (isHost || currentParticipant?.role === 'moderator') &&
    participant.role !== 'host';

  return (
    <div
      className={`relative w-full h-full rounded-xl overflow-hidden bg-[#151B2B] border transition-all duration-200 group flex items-center justify-center ${
        isSpeaking
          ? 'glow-active-speaker border-[#00C896]'
          : 'border-[#232D42] hover:border-[#384564]'
      }`}
    >
      {/* Video element: always kept active in DOM with opacity transition so mobile video decoders NEVER pause or freeze */}
      {stream && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal} // Always mute local video element to avoid self-echo
          className={`w-full h-full object-cover transition-opacity duration-150 ${isLocal ? 'scale-x-[-1]' : ''} ${
            isVideoOff ? 'opacity-0 absolute inset-0 pointer-events-none' : 'opacity-100 relative'
          }`}
        />
      )}

      {/* Dedicated audio element for remote participants: NEVER affected by video visibility or display:none */}
      {!isLocal && stream && (
        <audio
          ref={audioRef}
          autoPlay
          playsInline
        />
      )}

      {/* Avatar Placeholder when video is OFF */}
      {isVideoOff && (
        <div className="flex flex-col items-center justify-center p-4">
          <div
            style={{ backgroundColor: participant.avatarColor }}
            className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-white font-bold text-xl md:text-2xl shadow-xl relative"
          >
            {participant.name.slice(0, 2).toUpperCase()}

            {/* Speaking pulsing wave around avatar */}
            {isSpeaking && (
              <span className="absolute inset-0 rounded-full border-2 border-[#00C896] animate-ping opacity-75"></span>
            )}
          </div>
          <span className="mt-2 text-xs font-semibold text-white truncate max-w-[140px]">
            {participant.name} {isLocal && '(You)'}
          </span>
        </div>
      )}

      {/* Top badges (Role, Hand Raise, Spotlight) */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-1.5">
          {/* Role badge */}
          {participant.role === 'host' && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-bold flex items-center gap-1 backdrop-blur-md">
              <Crown className="w-3 h-3" />
              <span>HOST</span>
            </span>
          )}
          {participant.role === 'moderator' && (
            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 text-[10px] font-bold flex items-center gap-1 backdrop-blur-md">
              <Shield className="w-3 h-3" />
              <span>MOD</span>
            </span>
          )}

          {/* Hand raised badge */}
          {participant.isHandRaised && (
            <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 text-[10px] font-bold flex items-center gap-1 backdrop-blur-md animate-bounce">
              <Hand className="w-3 h-3" />
              <span>Raised</span>
            </span>
          )}
        </div>

        {/* Pin to Spotlight Button */}
        {onPin && (
          <button
            onClick={onPin}
            title={isSpotlight ? 'Unpin' : 'Pin to main view'}
            className="pointer-events-auto p-1.5 rounded-lg bg-[#0B0F19]/80 hover:bg-[#00C896] hover:text-[#0B0F19] text-[#929BAD] transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md border border-[#232D42]"
          >
            <Pin className={`w-3.5 h-3.5 ${isSpotlight ? 'text-[#00C896]' : ''}`} />
          </button>
        )}
      </div>

      {/* Bottom info bar (Name, Mic status, Active voice waves) */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0B0F19]/85 backdrop-blur-md border border-[#232D42] text-xs text-white max-w-[70%]">
          {/* Mic icon with speaking indicator */}
          {isMuted ? (
            <MicOff className="w-3.5 h-3.5 text-red-400 shrink-0" />
          ) : isSpeaking ? (
            <div className="flex items-end gap-0.5 h-3 shrink-0">
              <span className="w-1 bg-[#00C896] h-full animate-[wave_0.8s_ease-in-out_infinite]"></span>
              <span className="w-1 bg-[#00C896] h-2 animate-[wave_0.5s_ease-in-out_infinite_0.1s]"></span>
              <span className="w-1 bg-[#00C896] h-3 animate-[wave_0.7s_ease-in-out_infinite_0.2s]"></span>
            </div>
          ) : (
            <Mic className="w-3.5 h-3.5 text-[#00C896] shrink-0" />
          )}

          <span className="truncate font-medium text-[11px]">
            {participant.name} {isLocal && '(You)'}
          </span>
        </div>

        {/* Moderator Action Buttons for target participant */}
        {canModerate && (
          <div className="pointer-events-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => muteParticipant(participant.id)}
              title="Mute Participant"
              className="p-1.5 rounded-lg bg-[#0B0F19]/80 hover:bg-red-500 text-[#929BAD] hover:text-white transition-all backdrop-blur-md border border-[#232D42]"
            >
              <VolumeX className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => kickParticipant(participant.id, 'Removed by moderator')}
              title="Kick Participant"
              className="p-1.5 rounded-lg bg-[#0B0F19]/80 hover:bg-red-600 text-[#929BAD] hover:text-white transition-all backdrop-blur-md border border-[#232D42]"
            >
              <UserX className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
