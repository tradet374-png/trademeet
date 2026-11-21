// src/components/home/LandingHero.tsx
import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { checkServerStatus } from '../../services/api';
import {
  TrendingUp,
  Users,
  Video,
  Mic,
  Radio,
  CheckCircle2,
  AlertCircle,
  Database,
  User,
  ArrowRight,
  Play,
  Calendar,
  Zap,
  Globe2,
  Trophy,
  Sparkles,
  Home,
  Layers,
  DollarSign,
  Info
} from 'lucide-react';

interface LandingHeroProps {
  onJoin: (serverNumber: string, name: string) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onJoin }) => {
  const { currentRoom } = useSocket();
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

  // Auto-generate trader handle if empty
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
      setErrorMessage('Please specify a server number to create.');
      return;
    }
    if (!personName.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }
    setErrorMessage('');
    onJoin(serverNumber.trim(), personName.trim());
  };

  const checklistItems = [
    'Live Voice & Video',
    'Chat & GIFs',
    'Screen Sharing',
    'Trading Ideas',
    'Real-Time Charts',
    'Global Community',
  ];

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16 flex flex-col justify-between min-h-screen">
      {/* 1. Top Navbar Header Matching Mockup */}
      <nav className="w-full flex items-center justify-between py-4 mb-6 md:mb-10 border-b border-[#232D42]/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00C896] to-[#008F6B] flex items-center justify-center shadow-lg shadow-[#00C896]/30">
            <TrendingUp className="w-6 h-6 text-[#0B0F19] stroke-[2.5]" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white font-sans">
            Trade<span className="text-[#00C896]">Meet</span>
          </span>
        </div>

        {/* Navigation items */}
        <div className="hidden md:flex items-center gap-1.5 lg:gap-2">
          <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#00C896]/15 border border-[#00C896]/60 text-[#00C896] text-xs font-semibold shadow-[0_0_15px_rgba(0,200,150,0.25)]">
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          <a href="#features" className="px-4 py-1.5 text-xs text-[#929BAD] hover:text-white transition-colors">
            Features
          </a>
          <a href="#community" className="px-4 py-1.5 text-xs text-[#929BAD] hover:text-white transition-colors">
            Community
          </a>
          <a href="#pricing" className="px-4 py-1.5 text-xs text-[#929BAD] hover:text-white transition-colors">
            Pricing
          </a>
          <a href="#about" className="px-4 py-1.5 text-xs text-[#929BAD] hover:text-white transition-colors">
            About
          </a>
        </div>
      </nav>

      {/* 2. Main Hero Layout Grid: Left Content + Center Join Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto py-4">
        {/* Left Side: Brand Story, Tagline & Checklist */}
        <div className="lg:col-span-6 flex flex-col items-start space-y-6">
          {/* Live Trading Community Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#151B2B]/90 border border-[#232D42] text-xs font-medium text-white shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#00C896] animate-pulse"></span>
            <span className="text-[#929BAD]">Live Trading Community</span>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] font-sans">
              TradeMeet
            </h1>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black italic tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-[#00C896] to-[#00F0FF] leading-[1.1]">
              Trade. Learn. Grow.
            </h2>
          </div>

          {/* Description */}
          <p className="text-base sm:text-lg text-[#929BAD] max-w-xl leading-relaxed">
            Join our <strong className="text-white font-semibold">live trading meetings</strong>, discuss strategies, share charts and grow together with traders worldwide.
          </p>

          {/* 2-Column Checklist */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 w-full max-w-md pt-2">
            {checklistItems.map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs sm:text-sm text-[#E2E8F0]">
                <div className="w-4 h-4 rounded-full bg-[#00C896]/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00C896]" />
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* Be a Smarter Trader Tagline */}
          <div className="pt-2">
            <span className="text-2xl sm:text-3xl font-extrabold italic text-white drop-shadow-[0_2px_8px_rgba(0,200,150,0.4)] font-serif tracking-wide">
              Be a Smarter Trader!
            </span>
            <div className="w-48 h-1 bg-gradient-to-r from-[#00C896] to-transparent rounded-full mt-1"></div>
          </div>
        </div>

        {/* Center / Right: The Exact Cyan-Glow Join Floor Card */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end">
          <div className="w-full max-w-md bg-[#0B0F19]/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border-2 border-[#00C896]/60 shadow-[0_0_40px_rgba(0,200,150,0.22)] relative overflow-hidden transition-all">
            {/* Ambient Cyan Corner Glow */}
            <div className="absolute -top-20 -right-20 w-44 h-44 bg-[#00C896]/15 rounded-full blur-3xl pointer-events-none"></div>

            {/* Card Header Icon & Titles */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[#151B2B] border border-[#00C896]/40 flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(0,200,150,0.25)] text-[#00C896]">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Join Live Trading Floor
              </h3>
              <p className="text-xs text-[#929BAD] mt-1">
                Enter the server details to connect with our trading community
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Join Form */}
            <form onSubmit={handleJoin} className="space-y-4">
              {/* Server Number Input */}
              <div>
                <label className="block text-[11px] font-semibold text-[#929BAD] uppercase tracking-wider mb-1.5">
                  Server Number
                </label>
                <div className="relative">
                  <Database className="w-4 h-4 text-[#5F6B84] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={serverNumber}
                    onChange={(e) => setServerNumber(e.target.value)}
                    placeholder="e.g. 1, 7, GOLD"
                    className="w-full bg-[#151B2B] border border-[#232D42] rounded-xl pl-10 pr-24 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#00C896] focus:ring-1 focus:ring-[#00C896] transition-all"
                    required
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <span className="text-[10px] font-mono text-[#00C896] bg-[#00C896]/10 px-2 py-1 rounded border border-[#00C896]/30">
                      ROOM #{serverNumber || '?'}
                    </span>
                  </div>
                </div>

                {/* Quick Server Selectors */}
                <div className="flex items-center gap-1.5 mt-2 overflow-x-auto scrollbar-none">
                  <span className="text-[10px] text-[#5F6B84] shrink-0">Quick:</span>
                  {['1', '7', 'GOLD', 'CRYPTO', 'SCALP'].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setServerNumber(num)}
                      className={`text-[11px] px-2 py-0.5 rounded font-mono transition-all ${
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
              <div>
                <label className="block text-[11px] font-semibold text-[#929BAD] uppercase tracking-wider mb-1.5">
                  Your Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#5F6B84] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                    placeholder="Enter your trader name"
                    className="w-full bg-[#151B2B] border border-[#232D42] rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#00C896] focus:ring-1 focus:ring-[#00C896] transition-all"
                    required
                  />
                </div>
              </div>

              {/* Primary Join Button */}
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-[#00C896] hover:bg-[#00B083] text-[#0B0F19] font-black text-sm tracking-wide transition-all shadow-[0_0_25px_rgba(0,200,150,0.4)] flex items-center justify-center gap-2 group active:scale-[0.98] mt-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current stroke-[2.5]" />
                <span>Join Meeting →</span>
              </button>

              {/* Or Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-[#232D42]"></div>
                <span className="flex-shrink mx-3 text-[#5F6B84] text-xs">or</span>
                <div className="flex-grow border-t border-[#232D42]"></div>
              </div>

              {/* Secondary Create Server Button */}
              <button
                type="button"
                onClick={handleCreate}
                className="w-full py-3 px-4 rounded-xl bg-[#151B2B] hover:bg-[#1A2234] text-white border border-[#232D42] hover:border-[#00C896]/50 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-[#00C896]" />
                <span>Create Server</span>
              </button>
            </form>

            {/* Server Status Indicator */}
            <div className="mt-4 pt-3 border-t border-[#232D42] flex items-center justify-between text-[11px]">
              <span className="text-[#5F6B84]">Status:</span>
              {isChecking ? (
                <span className="text-yellow-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping"></span>
                  Checking Server...
                </span>
              ) : serverStatus.isActive ? (
                <span className="text-[#00C896] font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00C896]"></span>
                  Active ({serverStatus.participantCount} online)
                </span>
              ) : (
                <span className="text-[#929BAD] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                  Ready to Start
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Glass Feature Dock Matching Mockup */}
      <div className="w-full max-w-5xl mx-auto mt-6 bg-[#0B0F19]/80 backdrop-blur-xl border border-[#00C896]/40 rounded-2xl p-4 sm:p-5 shadow-[0_0_30px_rgba(0,200,150,0.12)]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00C896]/15 flex items-center justify-center text-[#00C896] shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <p className="font-bold text-white">Live Meetings</p>
              <p className="text-[10px] text-[#929BAD]">& Discussions</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00C896]/15 flex items-center justify-center text-[#00C896] shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <p className="font-bold text-white">Real-Time</p>
              <p className="text-[10px] text-[#929BAD]">Chart Sharing</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00C896]/15 flex items-center justify-center text-[#00C896] shrink-0">
              <Globe2 className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <p className="font-bold text-white">Connect with</p>
              <p className="text-[10px] text-[#929BAD]">Traders Worldwide</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00C896]/15 flex items-center justify-center text-[#00C896] shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <p className="font-bold text-white">Learn Proven</p>
              <p className="text-[10px] text-[#929BAD]">Strategies</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
