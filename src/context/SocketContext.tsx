// src/context/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { RoomInfo, Participant, ChatMessage, ScreenPresenter, UserRole } from '../types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  currentRoom: RoomInfo | null;
  currentParticipant: Participant | null;
  isHost: boolean;
  participants: Participant[];
  messages: ChatMessage[];
  activeScreens: ScreenPresenter[];
  toastMessage: string | null;
  joinRoom: (serverNumber: string, name: string) => void;
  leaveRoom: () => void;
  sendMessage: (content: string, type?: 'text' | 'gif' | 'image', mediaUrl?: string) => void;
  muteParticipant: (targetId: string) => void;
  kickParticipant: (targetId: string, reason?: string) => void;
  updateParticipantRole: (targetId: string, newRole: UserRole) => void;
  updateRoomSettings: (settings: { allowScreenShare?: boolean; isLocked?: boolean }) => void;
  endMeeting: () => void;
  toggleHandRaise: () => void;
  clearToast: () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<RoomInfo | null>(null);
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeScreens, setActiveScreens] = useState<ScreenPresenter[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  }, []);

  const clearToast = useCallback(() => setToastMessage(null), []);

  useEffect(() => {
    // Connect to WebSocket server (uses VITE_BACKEND_URL when deployed to Surge or external host)
    const backendUrl = import.meta.env.VITE_BACKEND_URL || undefined;
    const s = io(backendUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    socketRef.current = s;
    setSocket(s);

    s.on('connect', () => {
      setIsConnected(true);
      console.log('⚡ Connected to TradeMeet WebSocket server:', s.id);
    });

    s.on('disconnect', () => {
      setIsConnected(false);
      console.log('🔌 Disconnected from TradeMeet server');
    });

    // Room joined callback
    s.on('room:joined', (data: {
      room: RoomInfo;
      participant: Participant;
      isHost: boolean;
      participants: Participant[];
      messages: ChatMessage[];
      activeScreens?: ScreenPresenter[];
    }) => {
      setCurrentRoom(data.room);
      setCurrentParticipant(data.participant);
      setIsHost(data.isHost);
      setParticipants(data.participants);
      setMessages(data.messages);
      setActiveScreens(data.activeScreens || []);
      showToast(`Joined Server ${data.room.serverNumber} as ${data.participant.name}`);
    });

    // Other participant joined
    s.on('participant:joined', ({ participant }: { participant: Participant }) => {
      setParticipants((prev) => {
        if (prev.some((p) => p.id === participant.id)) return prev;
        return [...prev, participant];
      });
      showToast(`${participant.name} joined the meeting`);
    });

    // Participant updated (mic, cam, active speaking, role)
    s.on('participant:updated', (updated: Participant) => {
      setParticipants((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      if (s.id === updated.id) {
        setCurrentParticipant(updated);
        if (updated.role === 'host') setIsHost(true);
      }
    });

    // Participant left
    s.on('participant:left', ({ participantId, name, newHostId }: { participantId: string; name: string; newHostId?: string }) => {
      setParticipants((prev) => prev.filter((p) => p.id !== participantId));
      setActiveScreens((prev) => prev.filter((s) => s.presenterId !== participantId));
      showToast(`${name} left the room`);

      if (newHostId && s.id === newHostId) {
        setIsHost(true);
        setCurrentParticipant((prev) => (prev ? { ...prev, role: 'host' } : null));
        showToast('You are now the meeting host.');
      }
    });

    // Chat messages
    s.on('chat:message', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Multi-Screen Sharing list updated (ALL can share simultaneously!)
    s.on('screen:list-updated', ({ activeScreens: screens }: { activeScreens: ScreenPresenter[] }) => {
      setActiveScreens(screens || []);
    });

    // Host control events
    s.on('host:force-mute', ({ by }: { by: string }) => {
      showToast(`You were muted by host ${by}`);
    });

    s.on('host:kicked', ({ reason }: { reason: string }) => {
      alert(`You have been removed from the server: ${reason}`);
      window.location.href = '/';
    });

    s.on('meeting:ended', ({ by }: { by: string }) => {
      alert(`The meeting was ended by host ${by}`);
      window.location.href = '/';
    });

    s.on('room:settings-updated', (settings: RoomInfo) => {
      setCurrentRoom(settings);
    });

    s.on('error:toast', (msg: string) => {
      showToast(msg);
    });

    return () => {
      s.disconnect();
    };
  }, [showToast]);

  const joinRoom = useCallback((serverNumber: string, name: string) => {
    const serverNum = String(serverNumber || '1').trim();
    const traderName = String(name || 'Trader').trim();

    // 1. If socket exists, emit room:join
    if (socketRef.current) {
      socketRef.current.emit('room:join', { serverNumber: serverNum, name: traderName });
    }

    // 2. Resilience: If socket is slow (e.g. mobile 4G/5G or server cold start), give it 6 seconds
    // to complete WebSocket handshake before falling back to local demo room
    const timer = setTimeout(() => {
      setCurrentRoom((existing) => {
        if (existing) return existing; // Already joined from server response!
        console.warn('⚠️ Server connection timed out after 6s. Falling back to local room.');

        const selfParticipant: Participant = {
          id: socketRef.current?.id || `trader-${Date.now().toString(36)}`,
          name: traderName,
          role: 'host',
          serverNumber: serverNum,
          isAudioMuted: true,
          isVideoOff: true,
          isScreenSharing: false,
          isSpeaking: false,
          audioLevel: 0,
          isHandRaised: false,
          joinedAt: Date.now(),
          avatarColor: '#00C896',
        };

        const localRoom: RoomInfo = {
          serverNumber: serverNum,
          roomName: `Trading Room #${serverNum}`,
          createdAt: Date.now(),
          hostId: selfParticipant.id,
          participantCount: 1,
          isActive: true,
          isLocked: false,
          allowScreenShare: true,
          activeScreens: [],
        };

        setCurrentParticipant(selfParticipant);
        setIsHost(true);
        setParticipants([selfParticipant]);
        setMessages([
          {
            id: `sys-${Date.now()}`,
            senderId: 'system',
            senderName: 'TradeMeet Bot',
            senderRole: 'moderator',
            content: `Welcome to Server ${serverNum}! Voice, video, simultaneous multi-screen sharing, and text chat are ready.`,
            type: 'system',
            timestamp: Date.now(),
            avatarColor: '#00C896',
          },
        ]);
        showToast(`Joined Server #${serverNum} as ${traderName}`);
        return localRoom;
      });
    }, 6000);

    return () => clearTimeout(timer);
  }, [showToast]);

  const leaveRoom = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current.connect();
    }
    setCurrentRoom(null);
    setCurrentParticipant(null);
    setParticipants([]);
    setMessages([]);
    setActiveScreens([]);
  }, []);

  const sendMessage = useCallback((content: string, type: 'text' | 'gif' | 'image' = 'text', mediaUrl?: string) => {
    const p = currentParticipant;
    if (socketRef.current && isConnected) {
      socketRef.current.emit('chat:send', { content, type, mediaUrl });
    } else if (p) {
      // Local fallback message for offline/Surge
      const localMsg: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        senderId: p.id,
        senderName: p.name,
        senderRole: p.role,
        content,
        type,
        mediaUrl,
        timestamp: Date.now(),
        avatarColor: p.avatarColor,
      };
      setMessages((prev) => [...prev, localMsg]);
    }
  }, [currentParticipant, isConnected]);

  const muteParticipant = useCallback((targetId: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit('host:mute-participant', { targetId });
  }, []);

  const kickParticipant = useCallback((targetId: string, reason?: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit('host:kick-participant', { targetId, reason });
  }, []);

  const updateParticipantRole = useCallback((targetId: string, newRole: UserRole) => {
    if (!socketRef.current) return;
    socketRef.current.emit('host:update-role', { targetId, newRole });
  }, []);

  const updateRoomSettings = useCallback((settings: { allowScreenShare?: boolean; isLocked?: boolean }) => {
    if (!socketRef.current) return;
    socketRef.current.emit('host:room-settings', settings);
  }, []);

  const endMeeting = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit('host:end-meeting');
  }, []);

  const toggleHandRaise = useCallback(() => {
    if (!socketRef.current || !currentParticipant) return;
    const newState = !currentParticipant.isHandRaised;
    socketRef.current.emit('media:state-update', { isHandRaised: newState });
    setCurrentParticipant((prev) => (prev ? { ...prev, isHandRaised: newState } : null));
  }, [currentParticipant]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        currentRoom,
        currentParticipant,
        isHost,
        participants,
        messages,
        activeScreens,
        toastMessage,
        joinRoom,
        leaveRoom,
        sendMessage,
        muteParticipant,
        kickParticipant,
        updateParticipantRole,
        updateRoomSettings,
        endMeeting,
        toggleHandRaise,
        clearToast,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within a SocketProvider');
  return ctx;
};
