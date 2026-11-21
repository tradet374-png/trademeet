// src/components/home/LandingHero.tsx
import React, { useState, useEffect } from 'react';
import { checkServerStatus } from '../../services/api';
import traderHeroBg from '../../assets/trader-hero-bg.jpg';
import {
  Users,
  Play,
  Calendar,
  Database,
  User,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Zap,
  Globe2,
  Trophy,
  Home
} from 'lucide-react';

interface LandingHeroProps {
  onJoin: (serverNumber: string, name: string) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onJoin }) => {
  const [serverNumber, setServerNumber] = useState('1');
  const [personName, setPersonName] = useState('');
  const [serverStatus, setServerStatus] = useState<{
    exists: boolean;
    isActive: boolean;
    participantCount: number;
    activeScreensCount?: number;
    roomName?: string;
  }>({
    exists: true,
    isActive: true,
    participantCount: 0,
    activeScreensCount: 0,
  });
  const [isChecking, setIsChecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-generate cool trader handle if empty
  useEffect(() => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    const traderHandles = ['BullTrader', 'AlphaScalper', 'WhaleTrader', 'Satoshi', 'ForexPro', 'MacroTrader'];
    const randomHandle = traderHandles[Math.floor(Math.random() * traderHandles.length)];
    setPersonName(`${randomHandle}${randomNum}`);
  }, []);

  // Debounced check of server status
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
    onJoin(serverNumber.trim(), personName.trim());
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverNumber.trim()) {
      setErrorMessage('Please enter a server number.');
      return;
    }
    if (!personName.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }
    setErrorMessage('');
    onJoin(serverNumber.trim(), personName.trim());
  };

  return (
    <div className="relative w-screen h-screen h-[100dvh] bg-[#0B0F19] flex items-center justify-center overflow-hidden select-none">
      {/* =========================================================================
          1. DESKTOP & TABLET VIEW (md and up):
          Pixel-Perfect 16:9 Interface matching your exact mockup image,
          with live interactive Join Floor Card positioned directly on the image card.
         ========================================================================= */}
      <div className="hidden md:flex relative w-full aspect-[16/9] max-h-screen max-w-[177.78vh] items-center justify-center overflow-hidden shadow-2xl">
        {/* Crisp Full Interface Image (100% sharp, zero darkening, zero canvas) */}
        <img
          src={traderHeroBg}
          alt="TradeMeet Main Interface"
          className="w-full h-full object-cover pointer-events-none select-none"
        />

        {/* Live Interactive Join Live Trading Floor Card Overlaid on the Exact Card Coordinates */}
        <div
          className="absolute rounded-2xl lg:rounded-3xl p-3 sm:p-4 lg:p-5 flex flex-col justify-between border-2 border-[#00C896]/70 shadow-[0_0_35px_rgba(0,200,150,0.3)] bg-[#0B0F19]/95 backdrop-blur-xl"
          style={{
            left: '37.0%',
            top: '22.2%',
            width: '28.2%',
            height: '63.9%',
          }}
        >
          {/* Card Header matching mockup */}
          <div className="text-center pt-0.5">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#151B2B] border border-[#00C896]/50 flex items-center justify-center mx-auto mb-1.5 shadow-[0_0_15px_rgba(0,200,150,0.25)] text-[#00C896]">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-sm sm:text-base lg:text-lg font-black text-white tracking-tight leading-tight">
              Join Live Trading Floor
            </h3>
            <p className="text-[10px] sm:text-[11px] text-[#929BAD] mt-0.5 leading-tight">
              Enter the server details to connect with our trading community
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{errorMessage}</span>
            </div>
          )}

          {/* Interactive Form Fields */}
          <form onSubmit={handleJoin} className="space-y-2 lg:space-y-2.5 my-auto">
            {/* Server Number Input */}
            <div>
              <div className="relative">
                <Database className="w-3.5 h-3.5 text-[#00C896] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={serverNumber}
                  onChange={(e) => setServerNumber(e.target.value)}
                  placeholder="Server Number (e.g. 1, 7, GOLD)"
                  className="w-full bg-[#151B2B] border border-[#232D42] rounded-xl pl-9 pr-14 py-2 sm:py-2.5 text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-[#00C896] focus:ring-1 focus:ring-[#00C896] transition-all"
                  required
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-[#00C896] bg-[#00C896]/10 px-1.5 py-0.5 rounded border border-[#00C896]/30">
                  #{serverNumber || '?'}
                </span>
              </div>

              {/* Quick Server Selectors */}
              <div className="flex items-center gap-1 mt-1 overflow-x-auto scrollbar-none">
                <span className="text-[9px] text-[#5F6B84] shrink-0">Quick:</span>
                {['1', '7', 'GOLD', 'CRYPTO'].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setServerNumber(num)}
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono transition-all ${
                      serverNumber === num
                        ? 'bg-[#00C896] text-[#0B0F19] font-bold'
                        : 'bg-[#151B2B] text-[#929BAD] hover:text-white border border-[#232D42]'
                    }`}
                  >
                    #{num}
                  </button>
                ))}
              </div>
            </div>

            {/* Trader Name Input */}
            <div className="relative">
              <User className="w-3.5 h-3.5 text-[#00C896] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="Your Name / Trader Tag"
                className="w-full bg-[#151B2B] border border-[#232D42] rounded-xl pl-9 pr-3 py-2 sm:py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-[#00C896] focus:ring-1 focus:ring-[#00C896] transition-all"
                required
              />
            </div>

            {/* Primary Join Button */}
            <button
              type="submit"
              className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-[#00C896] hover:bg-[#00E5AA] text-[#0B0F19] font-black text-xs sm:text-sm tracking-wide transition-all shadow-[0_0_20px_rgba(0,200,150,0.4)] flex items-center justify-center gap-2 group active:scale-[0.98] cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current stroke-[2.5]" />
              <span>Join Meeting →</span>
            </button>

            {/* 'or' divider */}
            <div className="relative flex py-0.5 items-center">
              <div className="flex-grow border-t border-[#232D42]"></div>
              <span className="flex-shrink mx-2 text-[#5F6B84] text-[10px]">or</span>
              <div className="flex-grow border-t border-[#232D42]"></div>
            </div>

            {/* Secondary Create Server Button */}
            <button
              type="button"
              onClick={handleCreate}
              className="w-full py-2 px-3 rounded-xl bg-[#151B2B] hover:bg-[#1A2234] text-white border border-[#232D42] hover:border-[#00C896]/50 text-[11px] sm:text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-[#00C896]" />
              <span>Create Server</span>
            </button>
          </form>

          {/* Status Indicator */}
          <div className="pt-1.5 border-t border-[#232D42] flex items-center justify-between text-[10px]">
            <span className="text-[#5F6B84]">Server Status:</span>
            {isChecking ? (
              <span className="text-yellow-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping"></span>
                Checking...
              </span>
            ) : serverStatus.isActive ? (
              <span className="text-[#00C896] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00C896]"></span>
                Active ({serverStatus.participantCount} online)
              </span>
            ) : (
              <span className="text-[#929BAD] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                Ready to Start
              </span>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. MOBILE VIEW (< md):
          Comfortable mobile-responsive container so phone users can easily tap.
         ========================================================================= */}
      <div className="flex md:hidden flex-col w-full h-full overflow-y-auto px-4 py-6 justify-between relative z-10">
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#232D42]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00C896] to-[#008F6B] flex items-center justify-center shadow-md">
              <TrendingUp className="w-5 h-5 text-[#0B0F19] stroke-[2.5]" />
            </div>
            <span className="text-xl font-black text-white">Trade<span className="text-[#00C896]">Meet</span></span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#00C896]/15 border border-[#00C896]/40 text-[#00C896] text-[10px] font-bold">
            Live Community
          </span>
        </div>

        {/* Mobile Mockup Card */}
        <div className="w-full bg-[#0B0F19]/95 rounded-2xl p-5 border-2 border-[#00C896]/60 shadow-[0_0_25px_rgba(0,200,150,0.25)] my-auto">
          <div className="text-center mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#151B2B] border border-[#00C896]/40 flex items-center justify-center mx-auto mb-2 text-[#00C896]">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-white">Join Live Trading Floor</h3>
            <p className="text-xs text-[#929BAD] mt-0.5">Enter server details to connect</p>
          </div>

          <form onSubmit={handleJoin} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#929BAD] mb-1">Server Number</label>
              <div className="relative">
                <Database className="w-4 h-4 text-[#00C896] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={serverNumber}
                  onChange={(e) => setServerNumber(e.target.value)}
                  placeholder="e.g. 1, 7, GOLD"
                  className="w-full bg-[#151B2B] border border-[#232D42] rounded-xl pl-9 pr-3 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-[#00C896]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#929BAD] mb-1">Your Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#00C896] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="Enter your trader handle"
                  className="w-full bg-[#151B2B] border border-[#232D42] rounded-xl pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00C896]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#00C896] text-[#0B0F19] font-black text-sm shadow-[0_0_20px_rgba(0,200,150,0.4)] flex items-center justify-center gap-2 mt-2"
            >
              <Play className="w-4 h-4 fill-current stroke-[2.5]" />
              <span>Join Meeting →</span>
            </button>
          </form>
        </div>

        {/* Mobile Features Dock */}
        <div className="mt-4 pt-3 border-t border-[#232D42]/60 grid grid-cols-2 gap-2 text-[10px] text-[#929BAD]">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-[#00C896]" />
            <span>1080p Video & Audio</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-[#00C896]" />
            <span>Multi-Screen Share</span>
          </div>
        </div>
      </div>
    </div>
  );
};
