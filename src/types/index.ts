// src/types/index.ts

export type UserRole = 'host' | 'moderator' | 'participant';

export interface Participant {
  id: string; // Socket ID or unique client ID
  name: string;
  role: UserRole;
  serverNumber: string;
  isAudioMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isSpeaking: boolean;
  audioLevel: number; // 0 to 100 for visualizer
  isHandRaised: boolean;
  joinedAt: number;
  avatarColor: string;
  deviceInfo?: string;
}

export interface ScreenPresenter {
  presenterId: string;
  presenterName: string;
}

export interface RoomInfo {
  serverNumber: string;
  roomName: string;
  createdAt: number;
  hostId: string;
  participantCount: number;
  isActive: boolean;
  isLocked: boolean;
  allowScreenShare: boolean; // whether non-hosts can share screens
  activeScreens: ScreenPresenter[]; // All participants currently sharing screen simultaneously
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  type: 'text' | 'gif' | 'image' | 'system';
  mediaUrl?: string;
  timestamp: number;
  avatarColor: string;
}

export type ViewLayoutMode = 'split' | 'videos' | 'screens';
