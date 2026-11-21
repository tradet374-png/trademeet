// src/components/home/LandingHero.tsx
import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { checkServerStatus } from '../../services/api';
import {
  TrendingUp,
  Users,
  Video,
  Mic,
  Shield,
  Layers,
  Sparkles,
  ArrowRight,
  Radio,
  CheckCircle2,
  AlertCircle,
  Monitor
} from 'lucide-react';

interface LandingHeroProps {
  onJoin: (serverNumber: string, name: string) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onJoin }) => {
  const { currentRoom } = useSocket();
  const [serverNumber, setServerNumber] = useState('1');
  const [personName, setPersonName] = useState('');
  const [serverStatus, setServerStatus] = useState<{ exists: boolean; isActive: boolean; participantCount: number; activeScreensCount?: number; roomName?: string }>({
    exists: true,
    isActive: true,
    participantCount: 0,
    activeScreensCount: 0,
  });
  const [isChecking, setIsChecking] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-generate cool default trader name if empty
  useEffect(() => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    const traderHandles = ['BullTrader', 'AlphaScalper', 'WhaleTrader', 'Satoshi', 'ForexPro', 'MacroTrader'];
    const randomHandle = traderHandles[Math.floor(Math.random() * traderHandles.length)];
    setPersonName(`${randomHandle}${randomNum}`);
  }, []);

  // Debounced check of server number status
  useEffect(() => {
    if (!serverNumber.trim()) {
      setServerStatus({ exists: false, isActive: false, participantCount: 0, activeScreensCount: 0 });
      return;
    }

    const timer = setTimeout(async () => {
      setIsChecking(true);
      try {
        const status = await checkServerStatus(serverNumber.trim());
        setServerStatus(status);
      } catch {
        setServerStatus({ exists: false, isActive: false, participantCount: 0, activeScreensCount: 0 });
      } finally {
        setIsChecking(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [serverNumber]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverNumber.trim()) {
      setErrorMessage('Please enter a server number.');
      return;
    }
    if (!personName.trim()) {
      setErrorMessage('Please enter your trader name.');
      return;
    }
    setErrorMessage('');
    setIsJoining(true);
    onJoin(serverNumber.trim(), personName.trim());
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverNumber.trim()) {
      setErrorMessage('Please specify a server number to create.');
      return;
    }
    if (!personName.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }
    setErrorMessage('');
    setIsJoining(true);
    onJoin(serverNumber.trim(), personName.trim());
  };

  return (
    <div className="relative z-10 max-w-5xl mx-auto px-4 pt-12 pb-20">
      {/* Brand Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#151B2B] border border-[#232D42] text-xs font-medium text-[#00C896] mb-5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#00C896] animate-pulse"></span>
          Simultaneous Multi-Screen Sharing • Live Voice & Video • Real-Time Text Message Chat
        </div>

        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#00C896] to-[#008F6B] flex items-center justify-center shadow-lg shadow-[#00C896]/20">
            <TrendingUp className="w-7 h-7 text-[#0B0F19] stroke-[2.5]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white font-sans">
            Trade<span className="text-[#00C896]">Meet</span>
          </h1>
        </div>

        <p className="text-base md:text-lg text-[#929BAD] max-w-2xl mx-auto font-normal">
          The global live trading community. Enter a server number to join live voice, video, simultaneous multi-screen sharing, and real-time text message chat.
        </p>
      </div>

      {/* Main Join Server Card */}
      <div className="max-w-xl mx-auto glass-panel rounded-2xl p-6 md:p-8 border border-[#232D42] shadow-2xl relative overflow-hidden">
        {/* Glow accent bar at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00C896] to-transparent"></div>

        <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#232D42]">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-[#00C896] animate-pulse" />
            <span className="font-semibold text-white tracking-wide text-sm uppercase">Join Live Trading Floor</span>
          </div>

          {/* Server Active / Inactive Indication */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B0F19] border border-[#232D42] text-xs">
            {isChecking ? (
              <span className="text-[#929BAD] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping"></span>
                Checking server...
              </span>
            ) : serverStatus.isActive ? (
              <span className="text-[#00C896] font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00C896] shadow-[0_0_8px_#00C896]"></span>
                Server Active ({serverStatus.participantCount} {serverStatus.participantCount === 1 ? 'trader' : 'traders'})
              </span>
            ) : (
              <span className="text-[#929BAD] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                Server Inactive (Ready to Start)
              </span>
            )}
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-5">
          {/* Server Number Input */}
          <div>
            <label className="block text-xs font-semibold text-[#929BAD] uppercase tracking-wider mb-2">
              Server Number
            </label>
            <div className="relative">
              <input
                type="text"
                value={serverNumber}
                onChange={(e) => setServerNumber(e.target.value)}
                placeholder="e.g. 1, 7, GOLD, CRYPTO-DESK"
                className="w-full px-4 py-3.5 bg-[#0B0F19] border border-[#232D42] rounded-xl text-white font-mono text-base focus:outline-none focus:border-[#00C896] focus:ring-1 focus:ring-[#00C896] transition-all placeholder:text-[#5F6B84]"
                required
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[#5F6B84] bg-[#151B2B] px-2 py-0.5 rounded border border-[#232D42]">
                SERVER #{serverNumber || '?'}
              </div>
            </div>

            {/* Quick Server Selectors */}
            <div className="flex items-center gap-2 mt-2.5">
              <span className="text-[11px] text-[#5F6B84]">Quick Rooms:</span>
              {['1', '7', 'GOLD', 'CRYPTO'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setServerNumber(num)}
                  className={`text-xs px-2.5 py-0.5 rounded font-mono transition-all ${
                    serverNumber === num
                      ? 'bg-[#00C896]/20 text-[#00C896] border border-[#00C896]/40'
                      : 'bg-[#151B2B] text-[#929BAD] hover:text-white border border-[#232D42]'
                  }`}
                >
                  #{num}
                </button>
              ))}
            </div>
          </div>

          {/* Trader Name Input */}
          <div>
            <label className="block text-xs font-semibold text-[#929BAD] uppercase tracking-wider mb-2">
              Your Name / Trader Tag
            </label>
            <div className="relative">
              <input
                type="text"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="e.g. TraderAlex, Scalper_01"
                className="w-full px-4 py-3.5 bg-[#0B0F19] border border-[#232D42] rounded-xl text-white font-sans text-base focus:outline-none focus:border-[#00C896] focus:ring-1 focus:ring-[#00C896] transition-all placeholder:text-[#5F6B84]"
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={isJoining}
              className="flex-1 py-3.5 px-6 rounded-xl bg-[#00C896] hover:bg-[#00B083] disabled:opacity-75 text-[#0B0F19] font-bold text-sm tracking-wide transition-all shadow-lg shadow-[#00C896]/25 flex items-center justify-center gap-2 group active:scale-[0.99]"
            >
              {isJoining ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#0B0F19] border-t-transparent rounded-full animate-spin"></span>
                  <span>ENTERING SERVER #{serverNumber}...</span>
                </>
              ) : (
                <>
                  <span>JOIN LIVE MEETING</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCreate}
              disabled={isJoining}
              className="py-3.5 px-5 rounded-xl bg-[#1A2234] hover:bg-[#242F48] text-white border border-[#232D42] font-semibold text-sm transition-all flex items-center justify-center gap-2 hover:border-[#00C896]/40"
            >
              <span>{serverStatus.isActive ? 'Start New Room' : 'Create Server'}</span>
            </button>
          </div>
        </form>

        {/* Informative footer */}
        <div className="mt-6 pt-5 border-t border-[#232D42] flex items-center justify-between text-[11px] text-[#5F6B84]">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00C896]" />
            <span>Simultaneous Screen Share</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00C896]" />
            <span>Real-Time Text Chat & GIFs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00C896]" />
            <span>25+ Traders Scalable</span>
          </div>
        </div>
      </div>
    </div>
  );
};
