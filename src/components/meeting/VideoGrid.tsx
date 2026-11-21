// src/components/meeting/VideoGrid.tsx
import React, { useState } from 'react';
import { Participant } from '../../types';
import { VideoTile } from './VideoTile';
import { useMedia } from '../../context/MediaContext';
import { useSocket } from '../../context/SocketContext';
import { Users, Grid, Eye, EyeOff } from 'lucide-react';

interface VideoGridProps {
  participants: Participant[];
}

export const VideoGrid: React.FC<VideoGridProps> = ({ participants }) => {
  const { localStream, remoteStreams } = useMedia();
  const { currentParticipant } = useSocket();

  const [spotlightId, setSpotlightId] = useState<string | null>(null);
  const [hideSelfView, setHideSelfView] = useState(false);

  // Filter participants if user chose to hide self view
  const displayParticipants = hideSelfView && currentParticipant
    ? participants.filter((p) => p.id !== currentParticipant.id)
    : participants;

  const count = displayParticipants.length;

  // Compute dynamic CSS grid columns & rows based on participant count
  const getGridClasses = () => {
    if (spotlightId) return 'grid-cols-1';
    if (count <= 1) return 'grid-cols-1 max-w-2xl mx-auto';
    if (count === 2) return 'grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto';
    if (count <= 4) return 'grid-cols-2 max-w-5xl mx-auto';
    if (count <= 6) return 'grid-cols-2 sm:grid-cols-3 max-w-6xl mx-auto';
    if (count <= 9) return 'grid-cols-3 max-w-6xl mx-auto';
    if (count <= 16) return 'grid-cols-3 sm:grid-cols-4';
    if (count <= 25) return 'grid-cols-4 sm:grid-cols-5';
    // 25+ participants scalable layout
    return 'grid-cols-4 sm:grid-cols-6';
  };

  const spotlightParticipant = spotlightId
    ? participants.find((p) => p.id === spotlightId)
    : null;

  return (
    <div className="flex flex-col h-full w-full bg-[#0B0F19] p-3 md:p-4 overflow-hidden relative">
      {/* Top Controls: Participant Counter & Self View Toggle */}
      <div className="flex items-center justify-between mb-3 z-10 shrink-0">
        <div className="flex items-center gap-2 text-xs text-[#929BAD] bg-[#151B2B] px-3 py-1.5 rounded-lg border border-[#232D42]">
          <Users className="w-3.5 h-3.5 text-[#00C896]" />
          <span>
            {participants.length} {participants.length === 1 ? 'Trader Connected' : 'Traders Connected'}
          </span>
          {participants.length > 25 && (
            <span className="px-1.5 py-0.2 rounded bg-[#00C896]/20 text-[#00C896] text-[10px] font-bold">
              25+ Scaled
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {spotlightId && (
            <button
              onClick={() => setSpotlightId(null)}
              className="text-xs px-2.5 py-1 rounded-lg bg-[#1A2234] hover:bg-[#242F48] text-white border border-[#232D42] flex items-center gap-1.5"
            >
              <Grid className="w-3.5 h-3.5 text-[#00C896]" />
              <span>Reset to Grid</span>
            </button>
          )}

          <button
            onClick={() => setHideSelfView((prev) => !prev)}
            title={hideSelfView ? 'Show my self-view' : 'Hide my self-view'}
            className="text-xs px-2.5 py-1 rounded-lg bg-[#151B2B] hover:bg-[#1A2234] text-[#929BAD] hover:text-white border border-[#232D42] flex items-center gap-1.5"
          >
            {hideSelfView ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{hideSelfView ? 'Show Me' : 'Hide Me'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="flex-1 w-full overflow-y-auto">
        {spotlightId && spotlightParticipant ? (
          /* Spotlight Mode: 1 Big Focused Video + Filmstrip of Others */
          <div className="flex flex-col h-full gap-3">
            <div className="flex-1 min-h-[300px] w-full">
              <VideoTile
                participant={spotlightParticipant}
                stream={
                  spotlightParticipant.id === currentParticipant?.id
                    ? localStream
                    : remoteStreams.get(spotlightParticipant.id) || null
                }
                isLocal={spotlightParticipant.id === currentParticipant?.id}
                isSpotlight={true}
                onPin={() => setSpotlightId(null)}
              />
            </div>

            {/* Thumbnail Filmstrip along the bottom */}
            <div className="h-28 flex items-center gap-2 overflow-x-auto py-1 shrink-0">
              {participants.map((p) => (
                <div key={p.id} className="w-36 h-full shrink-0">
                  <VideoTile
                    participant={p}
                    stream={
                      p.id === currentParticipant?.id
                        ? localStream
                        : remoteStreams.get(p.id) || null
                    }
                    isLocal={p.id === currentParticipant?.id}
                    isSpotlight={spotlightId === p.id}
                    onPin={() => setSpotlightId(p.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Normal Dynamic Grid Layout */
          <div className={`grid gap-3 h-full auto-rows-fr ${getGridClasses()}`}>
            {displayParticipants.map((p) => {
              const isLocal = p.id === currentParticipant?.id;
              const stream = isLocal ? localStream : remoteStreams.get(p.id) || null;

              return (
                <div key={p.id} className="min-h-[140px] md:min-h-[180px] w-full h-full">
                  <VideoTile
                    participant={p}
                    stream={stream}
                    isLocal={isLocal}
                    onPin={() => setSpotlightId(p.id)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
