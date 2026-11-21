// src/App.tsx
import React, { useState } from 'react';
import { useSocket } from './context/SocketContext';
import { useMedia } from './context/MediaContext';
import { ViewLayoutMode } from './types';
import { BackgroundAnimation } from './components/home/BackgroundAnimation';
import { LandingHero } from './components/home/LandingHero';
import { ServerDirectory } from './components/home/ServerDirectory';
import { FeaturesShowcase } from './components/home/FeaturesShowcase';
import { TopBar } from './components/meeting/TopBar';
import { BottomBar } from './components/meeting/BottomBar';
import { VideoGrid } from './components/meeting/VideoGrid';
import { MultiScreenGrid } from './components/meeting/MultiScreenGrid';
import { ChatPanel } from './components/chat/ChatPanel';
import { ParticipantList } from './components/participants/ParticipantList';
import { SettingsModal } from './components/meeting/SettingsModal';
import { HostControlsModal } from './components/meeting/HostControlsModal';
import { Bell } from 'lucide-react';

export const App: React.FC = () => {
  const {
    currentRoom,
    currentParticipant,
    participants,
    joinRoom,
    leaveRoom,
    toastMessage,
    clearToast,
    activeScreens,
  } = useSocket();

  const { requestMediaPermissions } = useMedia();

  const [layoutMode, setLayoutMode] = useState<ViewLayoutMode>('split');
  const [activeSidebarTab, setActiveSidebarTab] = useState<'chat' | 'participants' | 'none'>('chat');
  const [showSettings, setShowSettings] = useState(false);
  const [showHostControls, setShowHostControls] = useState(false);

  // Handle joining a room from the Home Page
  const handleJoin = (serverNumber: string, name: string) => {
    // Softly request media permissions in background without blocking room entry
    requestMediaPermissions().catch(() => {});
    joinRoom(serverNumber, name);
  };

  // If user is NOT in a meeting room, show Home Page
  if (!currentRoom) {
    return (
      <div className="relative min-h-screen bg-[#0B0F19] text-white flex flex-col justify-between overflow-x-hidden">
        {/* Animated Background */}
        <BackgroundAnimation />

        {/* Global Toast Alert */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 bg-[#151B2B] border border-[#00C896] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs animate-in slide-in-from-top-4">
            <span className="w-2 h-2 rounded-full bg-[#00C896] animate-pulse"></span>
            <span>{toastMessage}</span>
            <button onClick={clearToast} className="text-[#929BAD] hover:text-white ml-2">✕</button>
          </div>
        )}

        {/* Home Page Content */}
        <div className="relative z-10 flex-1">
          <LandingHero onJoin={handleJoin} />
          <ServerDirectory onSelectServer={(num) => handleJoin(num, currentParticipant?.name || 'Trader')} />
          <FeaturesShowcase />
        </div>

        {/* Home Footer */}
        <footer className="relative z-10 border-t border-[#232D42] py-6 px-4 text-center text-xs text-[#5F6B84] bg-[#0B0F19]/90">
          <p>© 2024 TradeMeet • Live Trading Community. Simultaneous Multi-Screen Sharing & High-Capacity Audio/Video.</p>
        </footer>
      </div>
    );
  }

  // If user IS in a meeting room, show Meeting Dashboard
  const hasScreens = activeScreens.length > 0;

  return (
    <div className="flex flex-col h-screen h-[100dvh] w-screen bg-[#0B0F19] text-white overflow-hidden select-none">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-16 right-5 z-50 bg-[#151B2B]/95 backdrop-blur-md border border-[#00C896]/50 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs animate-in slide-in-from-top-2">
          <Bell className="w-3.5 h-3.5 text-[#00C896]" />
          <span>{toastMessage}</span>
          <button onClick={clearToast} className="text-[#929BAD] hover:text-white ml-2 text-xs">✕</button>
        </div>
      )}

      {/* Top Bar */}
      <TopBar
        layoutMode={layoutMode}
        onLayoutChange={setLayoutMode}
        activeSidebarTab={activeSidebarTab}
        onSidebarTabChange={setActiveSidebarTab}
        onOpenSettings={() => setShowSettings(true)}
        onOpenHostControls={() => setShowHostControls(true)}
      />

      {/* Main Workspace Area + Right Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Workspace Central Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative h-full w-full">
          {/* Multi-Screen Sharing Grid (All participants can share screens simultaneously) */}
          <div
            className={`transition-all duration-200 ${
              layoutMode === 'screens'
                ? 'w-full h-full block'
                : layoutMode === 'split'
                ? hasScreens
                  ? 'w-full md:w-3/5 lg:w-2/3 h-[58%] md:h-full block shrink-0'
                  : 'hidden'
                : 'hidden'
            }`}
          >
            <MultiScreenGrid />
          </div>

          {/* Video Grid Section */}
          <div
            className={`transition-all duration-200 ${
              layoutMode === 'videos'
                ? 'w-full h-full block'
                : layoutMode === 'split'
                ? hasScreens
                  ? 'w-full md:w-2/5 lg:w-1/3 h-[42%] md:h-full block'
                  : 'w-full h-full block'
                : 'hidden'
            }`}
          >
            <VideoGrid participants={participants} />
          </div>
        </div>

        {/* Right Sidebar (Real-time Text Message Chat or Connected Traders List) */}
        {activeSidebarTab !== 'none' && (
          <div className="fixed inset-x-0 bottom-16 top-14 z-30 md:static md:w-80 lg:w-96 md:h-full shrink-0 shadow-2xl">
            {activeSidebarTab === 'chat' && (
              <ChatPanel onClose={() => setActiveSidebarTab('none')} />
            )}
            {activeSidebarTab === 'participants' && (
              <ParticipantList onClose={() => setActiveSidebarTab('none')} />
            )}
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <BottomBar
        onToggleChat={() =>
          setActiveSidebarTab((prev) => (prev === 'chat' ? 'none' : 'chat'))
        }
        onOpenSettings={() => setShowSettings(true)}
        isChatOpen={activeSidebarTab === 'chat'}
        onLeave={leaveRoom}
      />

      {/* Settings Modal */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      {/* Host Controls Modal */}
      {showHostControls && (
        <HostControlsModal onClose={() => setShowHostControls(false)} />
      )}
    </div>
  );
};
