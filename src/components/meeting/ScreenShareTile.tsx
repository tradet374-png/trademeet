// src/components/meeting/ScreenShareTile.tsx
import React, { useRef, useEffect, useState } from 'react';
import { Monitor, Maximize, Minimize, StopCircle, Pin } from 'lucide-react';

interface ScreenShareTileProps {
  presenterId: string;
  presenterName: string;
  stream: MediaStream | null;
  isLocal: boolean;
  isSpotlight?: boolean;
  onToggleSpotlight?: () => void;
  onStopSharing?: () => void;
}

export const ScreenShareTile: React.FC<ScreenShareTileProps> = ({
  presenterId,
  presenterName,
  stream,
  isLocal,
  isSpotlight,
  onToggleSpotlight,
  onStopSharing,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full bg-[#070A11] rounded-xl overflow-hidden border border-[#232D42] hover:border-[#00C896]/60 transition-all flex items-center justify-center group shadow-xl ${
        isSpotlight ? 'ring-2 ring-[#00C896]' : ''
      }`}
    >
      {/* Video display */}
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-contain"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-[#5F6B84] p-4 gap-2">
          <Monitor className="w-8 h-8 text-[#5F6B84] animate-pulse" />
          <span className="text-xs font-medium">Connecting to {presenterName}'s screen...</span>
        </div>
      )}

      {/* Top Bar on Screen Share */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#151B2B]/90 backdrop-blur-md border border-[#232D42] text-white text-xs shadow-md pointer-events-auto">
          <Monitor className="w-3.5 h-3.5 text-[#00C896]" />
          <span className="font-semibold text-white truncate max-w-[150px]">
            {isLocal ? 'Your Screen' : `${presenterName}'s Screen`}
          </span>
          <span className="px-1.5 py-0.2 rounded bg-[#00C896]/20 text-[#00C896] font-mono text-[9px] font-bold">
            LIVE
          </span>
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Spotlight / Pin */}
          {onToggleSpotlight && (
            <button
              onClick={onToggleSpotlight}
              title={isSpotlight ? 'Show All Screens' : 'Spotlight This Screen'}
              className="p-1.5 rounded-lg bg-[#151B2B]/90 hover:bg-[#00C896] text-[#929BAD] hover:text-[#0B0F19] transition-all backdrop-blur-md border border-[#232D42]"
            >
              <Pin className={`w-3.5 h-3.5 ${isSpotlight ? 'text-[#00C896]' : ''}`} />
            </button>
          )}

          {/* Full-screen toggle */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
            className="p-1.5 rounded-lg bg-[#151B2B]/90 hover:bg-[#00C896] text-[#929BAD] hover:text-[#0B0F19] transition-all backdrop-blur-md border border-[#232D42]"
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          </button>

          {/* Stop Sharing Button if Local */}
          {isLocal && onStopSharing && (
            <button
              onClick={onStopSharing}
              title="Stop Sharing Your Screen"
              className="px-2.5 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-red-500/20"
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span>Stop</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
