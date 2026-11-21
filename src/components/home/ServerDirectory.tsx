// src/components/home/ServerDirectory.tsx
import React, { useEffect, useState } from 'react';
import { fetchActiveRooms } from '../../services/api';
import { RoomInfo } from '../../types';
import { Users, Radio, ArrowUpRight, Flame, Monitor, MessageSquare } from 'lucide-react';

interface ServerDirectoryProps {
  onSelectServer: (serverNumber: string) => void;
}

export const ServerDirectory: React.FC<ServerDirectoryProps> = ({ onSelectServer }) => {
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadRooms() {
      try {
        const data = await fetchActiveRooms();
        if (isMounted) {
          setRooms(data);
          setIsLoading(false);
        }
      } catch {
        if (isMounted) setIsLoading(false);
      }
    }

    loadRooms();
    const interval = setInterval(loadRooms, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const defaultRooms: RoomInfo[] = [
    {
      serverNumber: '1',
      roomName: 'Alpha Trading Floor',
      createdAt: Date.now(),
      hostId: 'system',
      participantCount: 4,
      isActive: true,
      isLocked: false,
      allowScreenShare: true,
      activeScreens: [],
    },
    {
      serverNumber: '7',
      roomName: 'Crypto Scalpers Live',
      createdAt: Date.now(),
      hostId: 'system',
      participantCount: 6,
      isActive: true,
      isLocked: false,
      allowScreenShare: true,
      activeScreens: [],
    },
    {
      serverNumber: 'GOLD',
      roomName: 'Gold & Forex War Room',
      createdAt: Date.now(),
      hostId: 'system',
      participantCount: 3,
      isActive: true,
      isLocked: false,
      allowScreenShare: true,
      activeScreens: [],
    },
  ];

  const displayRooms = rooms.length > 0 ? rooms : defaultRooms;

  return (
    <div className="relative z-10 max-w-5xl mx-auto px-4 mt-4 mb-16">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-[#00C896]" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">
            Active Trading Rooms
          </h2>
        </div>
        <span className="text-xs text-[#5F6B84] font-mono">
          Auto-refreshing every 5s
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {displayRooms.map((room) => (
          <div
            key={room.serverNumber}
            className="glass-panel hover:glass-panel-glow rounded-xl p-4 transition-all duration-200 border border-[#232D42] hover:border-[#00C896]/50 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#00C896]/10 border border-[#00C896]/30 text-[#00C896] font-mono font-bold text-xs flex items-center justify-center">
                    #{room.serverNumber}
                  </span>
                  <span className="font-semibold text-white text-sm group-hover:text-[#00C896] transition-colors">
                    {room.roomName || `Room #${room.serverNumber}`}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#0B0F19] border border-[#232D42] text-[11px] text-[#00C896] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00C896] animate-pulse"></span>
                  <span>{room.participantCount || 1} live</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#929BAD] mb-4">
                <div className="flex items-center gap-1 bg-[#151B2B] px-2 py-0.5 rounded border border-[#232D42] font-mono text-[11px]">
                  <Monitor className="w-3 h-3 text-blue-400" />
                  <span className="text-white">{room.activeScreens?.length || 0} screens</span>
                </div>
                <div className="flex items-center gap-1 bg-[#151B2B] px-2 py-0.5 rounded border border-[#232D42] font-mono text-[11px]">
                  <MessageSquare className="w-3 h-3 text-[#00C896]" />
                  <span className="text-white">Chat Active</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectServer(room.serverNumber)}
              className="w-full py-2 px-3 rounded-lg bg-[#1A2234] hover:bg-[#00C896] text-[#929BAD] hover:text-[#0B0F19] text-xs font-bold transition-all border border-[#232D42] hover:border-[#00C896] flex items-center justify-center gap-1.5"
            >
              <span>Quick Join Server {room.serverNumber}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
