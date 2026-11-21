// src/components/meeting/SettingsModal.tsx
import React, { useRef, useEffect } from 'react';
import { useMedia } from '../../context/MediaContext';
import { Mic, Video, Volume2, Shield, Sparkles, CheckCircle2 } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const {
    devices,
    selectedAudioDeviceId,
    selectedVideoDeviceId,
    selectAudioDevice,
    selectVideoDevice,
    localStream,
    currentAudioLevel,
    isLiveKitActive,
  } = useMedia();

  const previewVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (previewVideoRef.current && localStream) {
      previewVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#151B2B] border border-[#232D42] rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#232D42] bg-[#1A2234] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00C896]" />
            <h3 className="font-bold text-white text-sm uppercase tracking-wide">
              Audio & Video Settings
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
        <div className="p-5 space-y-5">
          {/* Camera Preview */}
          <div>
            <label className="block text-xs font-semibold text-[#929BAD] uppercase tracking-wider mb-2">
              Camera Preview
            </label>
            <div className="relative aspect-video rounded-xl bg-[#0B0F19] border border-[#232D42] overflow-hidden flex items-center justify-center">
              {localStream && localStream.getVideoTracks().length > 0 ? (
                <video
                  ref={previewVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <div className="text-center text-xs text-[#5F6B84] p-4">
                  Camera is currently off. Click the camera icon in the bottom bar to turn it on.
                </div>
              )}
            </div>
          </div>

          {/* Camera Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#929BAD] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-[#00C896]" />
              <span>Select Camera</span>
            </label>
            <select
              value={selectedVideoDeviceId}
              onChange={(e) => selectVideoDevice(e.target.value)}
              className="w-full bg-[#0B0F19] border border-[#232D42] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00C896]"
            >
              <option value="">Default Camera</option>
              {devices.videoInputs.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Camera ${d.deviceId.slice(0, 5)}`}
                </option>
              ))}
            </select>
          </div>

          {/* Microphone Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#929BAD] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-[#00C896]" />
              <span>Select Microphone</span>
            </label>
            <select
              value={selectedAudioDeviceId}
              onChange={(e) => selectAudioDevice(e.target.value)}
              className="w-full bg-[#0B0F19] border border-[#232D42] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00C896]"
            >
              <option value="">Default Microphone</option>
              {devices.audioInputs.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Microphone ${d.deviceId.slice(0, 5)}`}
                </option>
              ))}
            </select>

            {/* Mic Live Level Meter */}
            <div className="mt-2.5 flex items-center gap-2">
              <span className="text-[11px] text-[#5F6B84] shrink-0">Input Level:</span>
              <div className="flex-1 h-2 bg-[#0B0F19] rounded-full overflow-hidden border border-[#232D42]">
                <div
                  style={{ width: `${currentAudioLevel}%` }}
                  className="h-full bg-gradient-to-r from-[#00C896] via-yellow-400 to-red-500 transition-all duration-75"
                />
              </div>
              <span className="text-[11px] font-mono text-[#929BAD] shrink-0 w-8 text-right">
                {currentAudioLevel}%
              </span>
            </div>
          </div>

          {/* Architecture Status */}
          <div className="p-3 rounded-xl bg-[#0B0F19] border border-[#232D42] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#00C896]" />
              <div>
                <p className="font-semibold text-white">Media Transport</p>
                <p className="text-[11px] text-[#5F6B84]">
                  {isLiveKitActive
                    ? 'LiveKit SFU Active (Scalable 25+ Participants)'
                    : 'Low-Latency WebRTC Active'}
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#00C896]/20 text-[#00C896] font-bold text-[10px]">
              ONLINE
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#232D42] bg-[#1A2234] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#00C896] hover:bg-[#00B083] text-[#0B0F19] font-bold text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
