// server/rooms.ts
import { RoomInfo, Participant, ChatMessage, ScreenPresenter, UserRole } from '../src/types';

export class RoomManager {
  private rooms: Map<string, RoomInfo> = new Map();
  private participants: Map<string, Participant> = new Map(); // socketId -> Participant
  private roomParticipants: Map<string, Set<string>> = new Map(); // serverNumber -> Set<socketId>
  private roomMessages: Map<string, ChatMessage[]> = new Map(); // serverNumber -> ChatMessage[]
  private roomScreens: Map<string, Map<string, string>> = new Map(); // serverNumber -> (presenterId -> presenterName)

  constructor() {
    // Seed initial active trading servers
    this.createRoom('1', 'Alpha Trading Floor', 'system');
    this.createRoom('7', 'Crypto Scalpers Live', 'system');
    this.createRoom('GOLD', 'Gold & Forex War Room', 'system');
  }

  createRoom(serverNumber: string, roomName?: string, hostId = ''): RoomInfo {
    const formattedNum = String(serverNumber).trim();
    if (this.rooms.has(formattedNum)) {
      return this.rooms.get(formattedNum)!;
    }

    const room: RoomInfo = {
      serverNumber: formattedNum,
      roomName: roomName || `Trading Room #${formattedNum}`,
      createdAt: Date.now(),
      hostId,
      participantCount: 0,
      isActive: true,
      isLocked: false,
      allowScreenShare: true,
      activeScreens: [],
    };

    this.rooms.set(formattedNum, room);
    this.roomParticipants.set(formattedNum, new Set());
    this.roomMessages.set(formattedNum, []);
    this.roomScreens.set(formattedNum, new Map());

    // Add welcome system message
    this.addMessage(formattedNum, {
      id: `sys-${Date.now()}`,
      senderId: 'system',
      senderName: 'TradeMeet Bot',
      senderRole: 'moderator',
      content: `Welcome to Server ${formattedNum}! Real-time voice, video, simultaneous multi-screen sharing, and live text chat are active.`,
      type: 'system',
      timestamp: Date.now(),
      avatarColor: '#00C896',
    });

    return room;
  }

  getRoom(serverNumber: string): RoomInfo | undefined {
    const r = this.rooms.get(String(serverNumber).trim());
    if (r) {
      r.activeScreens = this.getActiveScreens(serverNumber);
    }
    return r;
  }

  getAllActiveRooms(): (RoomInfo & { participants: Participant[] })[] {
    const list: (RoomInfo & { participants: Participant[] })[] = [];
    for (const [serverNum, room] of this.rooms.entries()) {
      const socketIds = this.roomParticipants.get(serverNum) || new Set();
      const pList: Participant[] = [];
      for (const sid of socketIds) {
        const p = this.participants.get(sid);
        if (p) pList.push(p);
      }
      room.activeScreens = this.getActiveScreens(serverNum);
      list.push({
        ...room,
        participantCount: pList.length,
        isActive: pList.length > 0 || room.hostId === 'system',
        participants: pList,
      });
    }
    return list;
  }

  joinRoom(serverNumber: string, socketId: string, name: string): { room: RoomInfo; participant: Participant; isHost: boolean } {
    const serverNum = String(serverNumber).trim();
    let room = this.rooms.get(serverNum);
    const existingSocketIds = this.roomParticipants.get(serverNum) || new Set();

    let role: UserRole = 'participant';
    let isHost = false;

    // First real person to join an empty room or if host left becomes Host
    if (!room) {
      room = this.createRoom(serverNum, `Trading Room #${serverNum}`, socketId);
      role = 'host';
      isHost = true;
    } else if (existingSocketIds.size === 0 || !room.hostId || room.hostId === 'system') {
      room.hostId = socketId;
      role = 'host';
      isHost = true;
    }

    const avatarColors = [
      '#00C896', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#06B6D4', '#F97316'
    ];
    const avatarColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

    const participant: Participant = {
      id: socketId,
      name: name.trim() || `Trader-${socketId.slice(0, 4)}`,
      role,
      serverNumber: serverNum,
      isAudioMuted: true,
      isVideoOff: true,
      isScreenSharing: false,
      isSpeaking: false,
      audioLevel: 0,
      isHandRaised: false,
      joinedAt: Date.now(),
      avatarColor,
    };

    this.participants.set(socketId, participant);
    existingSocketIds.add(socketId);
    this.roomParticipants.set(serverNum, existingSocketIds);
    room.participantCount = existingSocketIds.size;
    room.isActive = true;
    room.activeScreens = this.getActiveScreens(serverNum);

    return { room, participant, isHost };
  }

  leaveRoom(socketId: string): { serverNumber?: string; participant?: Participant; newHostId?: string; remainingScreens?: ScreenPresenter[] } {
    const participant = this.participants.get(socketId);
    if (!participant) return {};

    const serverNum = participant.serverNumber;
    const socketIds = this.roomParticipants.get(serverNum);
    let newHostId: string | undefined;

    // Remove any screen share active by this user
    this.removeScreenPresenter(serverNum, socketId);
    const remainingScreens = this.getActiveScreens(serverNum);

    if (socketIds) {
      socketIds.delete(socketId);
      const room = this.rooms.get(serverNum);
      if (room) {
        room.participantCount = socketIds.size;
        room.activeScreens = remainingScreens;

        // If host leaves, assign next participant as host
        if (room.hostId === socketId) {
          const nextInLine = socketIds.values().next().value;
          if (nextInLine) {
            const nextParticipant = this.participants.get(nextInLine);
            if (nextParticipant) {
              nextParticipant.role = 'host';
              room.hostId = nextInLine;
              newHostId = nextInLine;
            }
          } else {
            room.hostId = '';
            room.isActive = false;
          }
        }
      }
    }

    this.participants.delete(socketId);
    return { serverNumber: serverNum, participant, newHostId, remainingScreens };
  }

  // Multi-Screen Sharing Management (ALL can share simultaneously!)
  addScreenPresenter(serverNumber: string, presenterId: string, presenterName: string): ScreenPresenter[] {
    const serverNum = String(serverNumber).trim();
    let screenMap = this.roomScreens.get(serverNum);
    if (!screenMap) {
      screenMap = new Map();
      this.roomScreens.set(serverNum, screenMap);
    }
    screenMap.set(presenterId, presenterName);

    const room = this.rooms.get(serverNum);
    const list = this.getActiveScreens(serverNum);
    if (room) room.activeScreens = list;

    const p = this.participants.get(presenterId);
    if (p) p.isScreenSharing = true;

    return list;
  }

  removeScreenPresenter(serverNumber: string, presenterId: string): ScreenPresenter[] {
    const serverNum = String(serverNumber).trim();
    const screenMap = this.roomScreens.get(serverNum);
    if (screenMap) {
      screenMap.delete(presenterId);
    }

    const room = this.rooms.get(serverNum);
    const list = this.getActiveScreens(serverNum);
    if (room) room.activeScreens = list;

    const p = this.participants.get(presenterId);
    if (p) p.isScreenSharing = false;

    return list;
  }

  getActiveScreens(serverNumber: string): ScreenPresenter[] {
    const serverNum = String(serverNumber).trim();
    const screenMap = this.roomScreens.get(serverNum);
    if (!screenMap) return [];
    return Array.from(screenMap.entries()).map(([presenterId, presenterName]) => ({
      presenterId,
      presenterName,
    }));
  }

  getParticipants(serverNumber: string): Participant[] {
    const serverNum = String(serverNumber).trim();
    const socketIds = this.roomParticipants.get(serverNum) || new Set();
    const list: Participant[] = [];
    for (const sid of socketIds) {
      const p = this.participants.get(sid);
      if (p) list.push(p);
    }
    return list;
  }

  getParticipant(socketId: string): Participant | undefined {
    return this.participants.get(socketId);
  }

  updateParticipant(socketId: string, updates: Partial<Participant>): Participant | undefined {
    const p = this.participants.get(socketId);
    if (!p) return undefined;
    Object.assign(p, updates);
    return p;
  }

  updateRoom(serverNumber: string, updates: Partial<RoomInfo>): RoomInfo | undefined {
    const r = this.rooms.get(String(serverNumber).trim());
    if (!r) return undefined;
    Object.assign(r, updates);
    return r;
  }

  // Live Chat
  addMessage(serverNumber: string, msg: ChatMessage): ChatMessage {
    const serverNum = String(serverNumber).trim();
    let msgs = this.roomMessages.get(serverNum);
    if (!msgs) {
      msgs = [];
      this.roomMessages.set(serverNum, msgs);
    }
    msgs.push(msg);
    if (msgs.length > 250) {
      msgs.shift();
    }
    return msg;
  }

  getMessages(serverNumber: string): ChatMessage[] {
    return this.roomMessages.get(String(serverNumber).trim()) || [];
  }
}

export const roomManager = new RoomManager();
