// src/components/home/LandingHero.tsx
import React, { useState, useEffect } from 'react';
import { checkServerStatus } from '../../services/api';
import {
  TrendingUp,
  Users,
  Video,
  Mic,
  Monitor,
  MessageSquare,
  PhoneOff,
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
  Check
} from 'lucide-react';

interface LandingHeroProps {
  onJoin: (serverNumber: string, name: string) => void;
}

const DEMO_TRADERS = [
  {
    name: 'Alex (Host)',
    role: 'Bull Scalper',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=260&auto=format&fit=crop&q=80',
    speaking: true,
  },
  {
    name: 'Priya K.',
    role: 'Crypto Analyst',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=260&auto=format&fit=crop&q=80',
    speaking: false,
  },
  {
    name: 'Marcus T.',
    role: 'Macro Pro',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=260&auto=format&fit=crop&q=80',
    speaking: false,
  },
  {
    name: 'Elena R.',
    role: 'Forex Lead',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=260&auto=format&fit=crop&q=80',
    speaking: false,
  },
  {
    name: 'David H.',
    role: 'Day Scalper',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=260&auto=format&fit=crop&q=80',
    speaking: true,
  },
  {
    name: 'Sarah L.',
    role: 'Price Action',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=260&auto=format&fit=crop&q=80',
    speaking: false,
  },
];

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

  // Auto-generate cool trader handle
  useEffect(() => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    const traderHandles = ['BullTrader', 'AlphaScalper', 'WhaleTrader', 'Satoshi', 'ForexPro', 'MacroTrader'];
    const randomHandle = traderHandles[Math.floor(Math.random() * traderHandles.length)];
    setPersonName(`${randomHandle}${randomNum}`);
  }, []);

  // Debounced server status check
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

  const checklistItems = [
    'Live Voice & Video',
    'Chat & GIFs',
    'Screen Sharing',
    'Trading Ideas',
    'Real-Time Charts',
    'Global Community',
  ];

  return (
    <div className="relative w-full min-h-screen bg-[#070B14] text-white flex flex-col justify-between overflow-x-hidden select-none">
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-[#00C896]/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed top-1/3 right-10 w-96 h-96 bg-[#00F0FF]/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="fixed bottom-10 right-1/4 w-80 h-80 bg-[#FF4B55]/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* =========================================================================
          1. TOP NAVIGATION BAR (Matching Mockup exactly)
         ========================================================================= */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between border-b border-[#1E293B]/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00C896] to-[#008F6B] flex items-center justify-center shadow-lg shadow-[#00C896]/30">
            <TrendingUp className="w-6 h-6 text-[#0B0F19] stroke-[2.5]" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white font-sans">
            Trade<span className="text-[#00C896]">Meet</span>
          </span>
        </div>

        {/* Navigation links matching mockup */}
        <nav className="flex items-center gap-1.5 sm:gap-2">
          <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#00C896]/15 border border-[#00C896]/60 text-[#00C896] text-xs font-bold shadow-[0_0_15px_rgba(0,200,150,0.25)]">
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          <button onClick={() => alert('TradeMeet features: Simultaneous multi-screen sharing, 1080p WebRTC camera, live GIFs, and instant voice chat.')} className="hidden sm:inline-block px-3.5 py-1.5 text-xs text-[#929BAD] hover:text-white transition-colors">
            Features
          </button>
          <button onClick={() => alert('Over 2,400 active traders connect daily across stocks, crypto, and forex rooms.')} className="hidden sm:inline-block px-3.5 py-1.5 text-xs text-[#929BAD] hover:text-white transition-colors">
            Community
          </button>
          <button onClick={() => alert('TradeMeet is 100% Free and open-source for community trading groups.')} className="hidden md:inline-block px-3.5 py-1.5 text-xs text-[#929BAD] hover:text-white transition-colors">
            Pricing
          </button>
          <button onClick={() => alert('TradeMeet: The live community trading floor powered by WebRTC mesh.')} className="hidden md:inline-block px-3.5 py-1.5 text-xs text-[#929BAD] hover:text-white transition-colors">
            About
          </button>
        </nav>
      </header>

      {/* =========================================================================
          2. MAIN HERO SECTION (3 Columns: Left Story + Center Card + Right Real Device)
         ========================================================================= */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          
          {/* ----------------- LEFT COLUMN: Title & Checklist ----------------- */}
          <div className="lg:col-span-4 flex flex-col items-start space-y-5">
            {/* Live Trading Community Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#151B2B] border border-[#232D42] text-xs font-medium text-white shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#00C896] animate-pulse shadow-[0_0_8px_#00C896]"></span>
              <span className="text-[#929BAD]">Live Trading Community</span>
            </div>

            {/* Title & Slogan */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none font-sans">
                TradeMeet
              </h1>
              <h2 className="text-3xl sm:text-4xl font-black italic tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-[#00C896] to-[#00F0FF] leading-tight">
                Trade. Learn. Grow.
              </h2>
            </div>

            {/* Description */}
            <p className="text-sm text-[#929BAD] leading-relaxed">
              Join our <strong className="text-white font-semibold">live trading meetings</strong>, discuss strategies, share charts and grow together with traders worldwide.
            </p>

            {/* 6-Item Checklist in 2 Columns */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 w-full pt-1">
              {checklistItems.map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-[#E2E8F0]">
                  <div className="w-4 h-4 rounded-full bg-[#00C896]/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-[#00C896] stroke-[3]" />
                  </div>
                  <span className="font-medium truncate">{item}</span>
                </div>
              ))}
            </div>

            {/* Be a Smarter Trader Tagline */}
            <div className="pt-2">
              <span className="text-2xl sm:text-3xl font-extrabold italic text-white drop-shadow-[0_2px_10px_rgba(0,200,150,0.5)] font-serif tracking-wide">
                Be a Smarter Trader!
              </span>
              <div className="w-44 h-1 bg-gradient-to-r from-[#00C896] to-transparent rounded-full mt-1.5 shadow-[0_0_8px_#00C896]"></div>
            </div>
          </div>

          {/* ----------------- CENTER COLUMN: The Glowing Join Floor Card ----------------- */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="w-full max-w-sm sm:max-w-md bg-[#0B0F19]/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 border-2 border-[#00C896]/70 shadow-[0_0_40px_rgba(0,200,150,0.28)] relative overflow-hidden transition-all">
              {/* Cyan Top Corner Glow */}
              <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#00C896]/20 rounded-full blur-2xl pointer-events-none"></div>

              {/* Card Header matching mockup */}
              <div className="text-center mb-5">
                <div className="w-12 h-12 rounded-2xl bg-[#151B2B] border border-[#00C896]/50 flex items-center justify-center mx-auto mb-2.5 shadow-[0_0_20px_rgba(0,200,150,0.25)] text-[#00C896]">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Join Live Trading Floor
                </h3>
                <p className="text-[11px] text-[#929BAD] mt-0.5">
                  Enter the server details to connect with our trading community
                </p>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="mb-3 p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleJoin} className="space-y-3.5">
                {/* Server Number Input */}
                <div>
                  <label className="block text-[10px] font-semibold text-[#929BAD] uppercase tracking-wider mb-1">
                    Server Number
                  </label>
                  <div className="relative">
                    <Database className="w-4 h-4 text-[#00C896] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={serverNumber}
                      onChange={(e) => setServerNumber(e.target.value)}
                      placeholder="e.g. 1, 7, GOLD"
                      className="w-full bg-[#151B2B] border border-[#232D42] rounded-xl pl-10 pr-20 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-[#00C896] focus:ring-1 focus:ring-[#00C896] transition-all"
                      required
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-[#00C896] bg-[#00C896]/15 px-2 py-0.5 rounded border border-[#00C896]/30">
                      ROOM #{serverNumber || '?'}
                    </span>
                  </div>

                  {/* Quick Server Selectors */}
                  <div className="flex items-center gap-1 mt-1.5 overflow-x-auto scrollbar-none">
                    <span className="text-[9px] text-[#5F6B84] shrink-0">Quick:</span>
                    {['1', '7', 'GOLD', 'CRYPTO'].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setServerNumber(num)}
                        className={`text-[9px] px-2 py-0.5 rounded font-mono transition-all ${
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
                  <label className="block text-[10px] font-semibold text-[#929BAD] uppercase tracking-wider mb-1">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#00C896] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={personName}
                      onChange={(e) => setPersonName(e.target.value)}
                      placeholder="Enter your trader name"
                      className="w-full bg-[#151B2B] border border-[#232D42] rounded-xl pl-10 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00C896] focus:ring-1 focus:ring-[#00C896] transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Primary Green Join Button */}
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-[#00C896] hover:bg-[#00E5AA] text-[#0B0F19] font-black text-sm tracking-wide transition-all shadow-[0_0_25px_rgba(0,200,150,0.45)] flex items-center justify-center gap-2 group active:scale-[0.98] mt-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current stroke-[2.5]" />
                  <span>Join Meeting →</span>
                </button>

                {/* 'or' divider */}
                <div className="relative flex py-0.5 items-center">
                  <div className="flex-grow border-t border-[#232D42]"></div>
                  <span className="flex-shrink mx-2 text-[#5F6B84] text-[10px]">or</span>
                  <div className="flex-grow border-t border-[#232D42]"></div>
                </div>

                {/* Create Server Secondary Button */}
                <button
                  type="button"
                  onClick={handleCreate}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#151B2B] hover:bg-[#1A2234] text-white border border-[#232D42] hover:border-[#00C896]/50 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#00C896]" />
                  <span>Create Server</span>
                </button>
              </form>

              {/* Server Status Live Indicator */}
              <div className="mt-4 pt-2.5 border-t border-[#232D42] flex items-center justify-between text-[10px]">
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

          {/* ----------------- RIGHT COLUMN: Real Live Meeting Tablet Device ----------------- */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center relative">
            {/* Bull & Bear Ascending Candlestick Trend Header */}
            <div className="w-full flex items-center justify-between px-2 mb-2 text-xs font-bold">
              <span className="flex items-center gap-1 text-[#00C896] drop-shadow-[0_0_8px_#00C896]">
                🐂 BULL MARKET +14.8%
              </span>
              <span className="flex items-center gap-1 text-[#FF4B55] drop-shadow-[0_0_8px_#FF4B55]">
                🐻 VOLATILITY DESK
              </span>
            </div>

            {/* Realistic Black Glass Tablet Displaying 6 Live Traders */}
            <div className="w-full bg-[#0B0F19] rounded-2xl border-4 border-[#1E293B] shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-2.5 relative overflow-hidden group">
              {/* Top Tablet Bezel Camera */}
              <div className="flex items-center justify-center gap-1 pb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#334155]"></span>
                <span className="text-[9px] font-mono text-[#5F6B84] uppercase tracking-wider">
                  SERVER #1 LIVE CALL (6 TRADERS)
                </span>
              </div>

              {/* 3x2 Grid of Live Video Tiles */}
              <div className="grid grid-cols-3 gap-1.5">
                {DEMO_TRADERS.map((t) => (
                  <div
                    key={t.name}
                    className="relative aspect-[4/3] rounded-lg overflow-hidden bg-[#151B2B] border border-[#232D42] group/tile shadow-sm"
                  >
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {/* Dark gradient for readable name */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1">
                      <div className="flex items-center gap-1 w-full truncate">
                        {t.speaking && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00C896] animate-pulse shrink-0"></span>
                        )}
                        <span className="text-[9px] font-semibold text-white truncate drop-shadow">
                          {t.name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tablet Bottom Meeting Controls Bar matching mockup */}
              <div className="mt-2.5 pt-2 border-t border-[#1E293B] flex items-center justify-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#151B2B] border border-[#232D42] flex items-center justify-center text-[#929BAD]">
                  <Mic className="w-3 h-3 text-[#00C896]" />
                </div>
                <div className="w-6 h-6 rounded-full bg-[#151B2B] border border-[#232D42] flex items-center justify-center text-[#929BAD]">
                  <Video className="w-3 h-3 text-[#00C896]" />
                </div>
                <div className="w-6 h-6 rounded-full bg-[#151B2B] border border-[#232D42] flex items-center justify-center text-[#929BAD]">
                  <Monitor className="w-3 h-3 text-white" />
                </div>
                <div className="w-6 h-6 rounded-full bg-[#151B2B] border border-[#232D42] flex items-center justify-center text-[#929BAD]">
                  <MessageSquare className="w-3 h-3 text-white" />
                </div>
                <div className="w-6 h-6 rounded-full bg-[#151B2B] border border-[#232D42] flex items-center justify-center text-[#929BAD]">
                  <Users className="w-3 h-3 text-white" />
                </div>
                <div className="w-6 h-6 rounded-full bg-[#FF4B55] flex items-center justify-center text-white shadow-[0_0_10px_#FF4B55]">
                  <PhoneOff className="w-3 h-3" />
                </div>
              </div>
            </div>

            {/* Candlestick Wave Graphic Below Device */}
            <div className="w-full flex items-center justify-between text-[10px] text-[#5F6B84] pt-2 px-1 font-mono">
              <span>● Ultra-Low Latency Mesh</span>
              <span>1080p 60FPS</span>
            </div>
          </div>

        </div>
      </main>

      {/* =========================================================================
          3. BOTTOM FEATURE DOCK (Matching Mockup exactly)
         ========================================================================= */}
      <footer className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="w-full bg-[#0B0F19]/90 backdrop-blur-xl border border-[#00C896]/40 rounded-2xl p-4 sm:p-5 shadow-[0_0_35px_rgba(0,200,150,0.15)] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
            {/* Feature 1 */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#00C896]/15 border border-[#00C896]/30 flex items-center justify-center text-[#00C896] shrink-0 shadow-[0_0_12px_rgba(0,200,150,0.2)]">
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white leading-tight">Live Meetings</p>
                <p className="text-[10px] text-[#929BAD]">& Discussions</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#00C896]/15 border border-[#00C896]/30 flex items-center justify-center text-[#00C896] shrink-0 shadow-[0_0_12px_rgba(0,200,150,0.2)]">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white leading-tight">Real-Time</p>
                <p className="text-[10px] text-[#929BAD]">Chart Sharing</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#00C896]/15 border border-[#00C896]/30 flex items-center justify-center text-[#00C896] shrink-0 shadow-[0_0_12px_rgba(0,200,150,0.2)]">
                <Globe2 className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white leading-tight">Connect with</p>
                <p className="text-[10px] text-[#929BAD]">Traders Worldwide</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#00C896]/15 border border-[#00C896]/30 flex items-center justify-center text-[#00C896] shrink-0 shadow-[0_0_12px_rgba(0,200,150,0.2)]">
                <Trophy className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white leading-tight">Learn Proven</p>
                <p className="text-[10px] text-[#929BAD]">Strategies</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
