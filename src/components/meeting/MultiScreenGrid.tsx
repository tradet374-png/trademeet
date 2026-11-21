// src/components/meeting/MultiScreenGrid.tsx
import React, { useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useMedia } from '../../context/MediaContext';
import { ScreenShareTile } from './ScreenShareTile';
import { Monitor, Grid, Share2 } from 'lucide-react';

export const MultiScreenGrid: React.FC = () => {
  const { activeScreens, currentParticipant } = useSocket();
  const { localScreenStream, remoteScreenStreams, stopScreenShare, startScreenShare, isScreenSharing } = useMedia();

  const [spotlightId, setSpotlightId] = useState<string | null>(null);

  if (activeScreens.length === 0) {
    return (
      <div className="flex-1 h-full w-full bg-[#0B0F19] flex flex-col items-center justify-center p-6 text-center border-b md:border-b-0 md:border-r border-[#232D42]">
        <div className="w-16 h-16 rounded-2xl bg-[#151B2B] border border-[#232D42] flex items-center justify-center text-[#5F6B84] mb-4">
          <Monitor className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-white mb-1.5">No Active Screen Shares</h3>
        <p className="text-xs text-[#929BAD] max-w-sm mb-4">
          All participants can share their screens simultaneously. Share your trading terminal, broker window, or analysis charts.
        </p>
        <button
          onClick={startScreenShare}
          className="px-4 py-2 rounded-xl bg-[#00C896] hover:bg-[#00B083] text-[#0B0F19] font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#00C896]/20 transition-all"
        >
          <Share2 className="w-4 h-4" />
          <span>Share Your Screen Now</span>
        </button>
      </div>
    );
  }

  const spotlightScreen = spotlightId
    ? activeScreens.find((s) => s.presenterId === spotlightId)
    : null;

  const count = activeScreens.length;

  const getGridClasses = () => {
    if (spotlightId) return 'grid-cols-1';
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2';
    if (count <= 4) return 'grid-cols-1 sm:grid-cols-2';
    return 'grid-cols-2 lg:grid-cols-3';
  };

  return (
    <div className="flex-1 h-full w-full bg-[#0B0F19] p-3 flex flex-col overflow-hidden relative border-b md:border-b-0 md:border-r border-[#232D42]">
      {/* Top Banner: Active screens count & Reset button */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#232D42] shrink-0 text-xs text-[#929BAD]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00C896] animate-pulse"></span>
          <span className="font-semibold text-white">
            {activeScreens.length} {activeScreens.length === 1 ? 'Screen Being Shared' : 'Screens Shared Simultaneously'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {spotlightId && (
            <button
              onClick={() => setSpotlightId(null)}
              className="text-xs px-2.5 py-1 rounded-lg bg-[#1A2234] hover:bg-[#242F48] text-white border border-[#232D42] flex items-center gap-1.5"
            >
              <Grid className="w-3.5 h-3.5 text-[#00C896]" />
              <span>Show All Screens</span>
            </button>
          )}

          {!isScreenSharing && (
            <button
              onClick={startScreenShare}
              className="text-xs px-2.5 py-1 rounded-lg bg-[#00C896]/15 hover:bg-[#00C896]/25 text-[#00C896] border border-[#00C896]/30 flex items-center gap-1.5 font-bold"
            >
              <Share2 className="w-3 h-3" />
              <span>Also Share My Screen</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of screens */}
      <div className="flex-1 w-full overflow-y-auto">
        {spotlightId && spotlightScreen ? (
          <div className="flex flex-col h-full gap-2">
            <div className="flex-1 min-h-[300px]">
              <ScreenShareTile
                presenterId={spotlightScreen.presenterId}
                presenterName={spotlightScreen.presenterName}
                stream={
                  spotlightScreen.presenterId === currentParticipant?.id
                    ? localScreenStream
                    : remoteScreenStreams.get(spotlightScreen.presenterId) || null
                }
                isLocal={spotlightScreen.presenterId === currentParticipant?.id}
                isSpotlight={true}
                onToggleSpotlight={() => setSpotlightId(null)}
                onStopSharing={stopScreenShare}
              />
            </div>

            {/* Thumbnail filmstrip of other screens */}
            <div className="h-24 flex items-center gap-2 overflow-x-auto py-1 shrink-0">
              {activeScreens.map((s) => (
                <div key={s.presenterId} className="w-36 h-full shrink-0">
                  <ScreenShareTile
                    presenterId={s.presenterId}
                    presenterName={s.presenterName}
                    stream={
                      s.presenterId === currentParticipant?.id
                        ? localScreenStream
                        : remoteScreenStreams.get(s.presenterId) || null
                    }
                    isLocal={s.presenterId === currentParticipant?.id}
                    isSpotlight={spotlightId === s.presenterId}
                    onToggleSpotlight={() => setSpotlightId(s.presenterId)}
                    onStopSharing={stopScreenShare}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={`grid gap-3 h-full auto-rows-fr ${getGridClasses()}`}>
            {activeScreens.map((s) => {
              const isLocal = s.presenterId === currentParticipant?.id;
              const stream = isLocal
                ? localScreenStream
                : remoteScreenStreams.get(s.presenterId) || null;

              return (
                <div key={s.presenterId} className="w-full h-full min-h-[220px]">
                  <ScreenShareTile
                    presenterId={s.presenterId}
                    presenterName={s.presenterName}
                    stream={stream}
                    isLocal={isLocal}
                    onToggleSpotlight={() => setSpotlightId(s.presenterId)}
                    onStopSharing={stopScreenShare}
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
