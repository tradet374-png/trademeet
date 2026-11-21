// server/socket.ts
import { Server as SocketIOServer, Socket } from 'socket.io';
import { roomManager } from './rooms';
import { ChatMessage, UserRole } from '../src/types';

export function setupSocketServer(io: SocketIOServer) {
  io.on('connection', (socket: Socket) => {
    // 1. Join Meeting Room
    socket.on('room:join', ({ serverNumber, name }: { serverNumber: string; name: string }) => {
      const serverNum = String(serverNumber || '1').trim();
      const roomChannel = `server-${serverNum}`;

      // Join Socket.io room channel for strict isolation
      socket.join(roomChannel);

      const { room, participant, isHost } = roomManager.joinRoom(serverNum, socket.id, name);

      // Return join confirmation to the client with initial state
      const participants = roomManager.getParticipants(serverNum);
      const messages = roomManager.getMessages(serverNum);
      const activeScreens = roomManager.getActiveScreens(serverNum);

      socket.emit('room:joined', {
        room,
        participant,
        isHost,
        participants,
        messages,
        activeScreens,
      });

      // Broadcast new participant to other participants in the same server room ONLY
      socket.to(roomChannel).emit('participant:joined', {
        participant,
        participantCount: participants.length,
      });

      // Send system message
      const joinMsg: ChatMessage = {
        id: `sys-${Date.now()}-${Math.random()}`,
        senderId: 'system',
        senderName: 'System',
        senderRole: 'moderator',
        content: `${participant.name} joined the meeting.`,
        type: 'system',
        timestamp: Date.now(),
        avatarColor: participant.avatarColor,
      };
      roomManager.addMessage(serverNum, joinMsg);
      io.to(roomChannel).emit('chat:message', joinMsg);
    });

    // 2. Media State Updates (Audio Mute, Video Off, Active Speaking)
    socket.on('media:state-update', (updates: { isAudioMuted?: boolean; isVideoOff?: boolean; isSpeaking?: boolean; audioLevel?: number; isHandRaised?: boolean }) => {
      const p = roomManager.updateParticipant(socket.id, updates);
      if (p) {
        const roomChannel = `server-${p.serverNumber}`;
        io.to(roomChannel).emit('participant:updated', p);
      }
    });

    // 3. Multi-Screen Sharing Coordination (ALL can share simultaneously!)
    socket.on('screen:start', () => {
      const p = roomManager.getParticipant(socket.id);
      if (!p) return;
      const room = roomManager.getRoom(p.serverNumber);
      if (!room) return;

      if (!room.allowScreenShare && p.role === 'participant') {
        socket.emit('error:toast', 'Screen sharing is restricted by the meeting host.');
        return;
      }

      // Add to room's active screens list
      const activeScreens = roomManager.addScreenPresenter(p.serverNumber, socket.id, p.name);

      const roomChannel = `server-${p.serverNumber}`;
      // Broadcast updated list of all active screens to everyone in this server
      io.to(roomChannel).emit('screen:list-updated', { activeScreens });
      io.to(roomChannel).emit('participant:updated', p);

      const shareMsg: ChatMessage = {
        id: `sys-${Date.now()}-${Math.random()}`,
        senderId: 'system',
        senderName: 'System',
        senderRole: 'moderator',
        content: `🖥️ ${p.name} started sharing their screen.`,
        type: 'system',
        timestamp: Date.now(),
        avatarColor: p.avatarColor,
      };
      roomManager.addMessage(p.serverNumber, shareMsg);
      io.to(roomChannel).emit('chat:message', shareMsg);
    });

    socket.on('screen:stop', () => {
      const p = roomManager.getParticipant(socket.id);
      if (!p) return;

      const activeScreens = roomManager.removeScreenPresenter(p.serverNumber, socket.id);

      const roomChannel = `server-${p.serverNumber}`;
      io.to(roomChannel).emit('screen:list-updated', { activeScreens });
      io.to(roomChannel).emit('participant:updated', p);

      const stopMsg: ChatMessage = {
        id: `sys-${Date.now()}-${Math.random()}`,
        senderId: 'system',
        senderName: 'System',
        senderRole: 'moderator',
        content: `${p.name} stopped sharing screen.`,
        type: 'system',
        timestamp: Date.now(),
        avatarColor: p.avatarColor,
      };
      roomManager.addMessage(p.serverNumber, stopMsg);
      io.to(roomChannel).emit('chat:message', stopMsg);
    });

    // 4. Live Text Chat, GIFs, Images & Emojis
    socket.on('chat:send', (msgData: { content: string; type: 'text' | 'gif' | 'image'; mediaUrl?: string }) => {
      const p = roomManager.getParticipant(socket.id);
      if (!p) return;

      const message: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        senderId: p.id,
        senderName: p.name,
        senderRole: p.role,
        content: msgData.content,
        type: msgData.type || 'text',
        mediaUrl: msgData.mediaUrl,
        timestamp: Date.now(),
        avatarColor: p.avatarColor,
      };

      roomManager.addMessage(p.serverNumber, message);
      io.to(`server-${p.serverNumber}`).emit('chat:message', message);
    });

    // 5. Host & Moderator Controls
    socket.on('host:mute-participant', ({ targetId }: { targetId: string }) => {
      const p = roomManager.getParticipant(socket.id);
      if (!p || (p.role !== 'host' && p.role !== 'moderator')) return;

      const target = roomManager.getParticipant(targetId);
      if (target && target.serverNumber === p.serverNumber) {
        io.to(targetId).emit('host:force-mute', { by: p.name });
        target.isAudioMuted = true;
        io.to(`server-${p.serverNumber}`).emit('participant:updated', target);
      }
    });

    socket.on('host:kick-participant', ({ targetId, reason }: { targetId: string; reason?: string }) => {
      const p = roomManager.getParticipant(socket.id);
      if (!p || (p.role !== 'host' && p.role !== 'moderator')) return;

      const target = roomManager.getParticipant(targetId);
      if (target && target.serverNumber === p.serverNumber) {
        io.to(targetId).emit('host:kicked', { reason: reason || 'Removed by host' });
        const targetSocket = io.sockets.sockets.get(targetId);
        if (targetSocket) {
          targetSocket.leave(`server-${p.serverNumber}`);
          targetSocket.disconnect(true);
        }
      }
    });

    socket.on('host:update-role', ({ targetId, newRole }: { targetId: string; newRole: UserRole }) => {
      const p = roomManager.getParticipant(socket.id);
      if (!p || p.role !== 'host') return;

      const target = roomManager.getParticipant(targetId);
      if (target && target.serverNumber === p.serverNumber) {
        target.role = newRole;
        io.to(`server-${p.serverNumber}`).emit('participant:updated', target);
      }
    });

    socket.on('host:room-settings', (settings: { allowScreenShare?: boolean; isLocked?: boolean }) => {
      const p = roomManager.getParticipant(socket.id);
      if (!p || p.role !== 'host') return;

      const room = roomManager.updateRoom(p.serverNumber, settings);
      if (room) {
        io.to(`server-${p.serverNumber}`).emit('room:settings-updated', room);
      }
    });

    socket.on('host:end-meeting', () => {
      const p = roomManager.getParticipant(socket.id);
      if (!p || p.role !== 'host') return;

      io.to(`server-${p.serverNumber}`).emit('meeting:ended', { by: p.name });
    });

    // 6. WebRTC Audio/Video & Screen Signaling Relay
    socket.on('webrtc:offer', ({ to, offer, type }: { to: string; offer: any; type?: string }) => {
      socket.to(to).emit('webrtc:offer', { from: socket.id, offer, type });
    });

    socket.on('webrtc:answer', ({ to, answer, type }: { to: string; answer: any; type?: string }) => {
      socket.to(to).emit('webrtc:answer', { from: socket.id, answer, type });
    });

    socket.on('webrtc:ice-candidate', ({ to, candidate, type }: { to: string; candidate: any; type?: string }) => {
      socket.to(to).emit('webrtc:ice-candidate', { from: socket.id, candidate, type });
    });

    // 7. Disconnect Cleanup
    socket.on('disconnect', () => {
      const { serverNumber, participant, newHostId, remainingScreens } = roomManager.leaveRoom(socket.id);
      if (serverNumber && participant) {
        const roomChannel = `server-${serverNumber}`;
        const remaining = roomManager.getParticipants(serverNumber);

        io.to(roomChannel).emit('participant:left', {
          participantId: socket.id,
          name: participant.name,
          participantCount: remaining.length,
          newHostId,
        });

        if (remainingScreens) {
          io.to(roomChannel).emit('screen:list-updated', { activeScreens: remainingScreens });
        }

        // Add departure system message
        const leaveMsg: ChatMessage = {
          id: `sys-${Date.now()}-${Math.random()}`,
          senderId: 'system',
          senderName: 'System',
          senderRole: 'moderator',
          content: `${participant.name} left the room.`,
          type: 'system',
          timestamp: Date.now(),
          avatarColor: participant.avatarColor,
        };
        roomManager.addMessage(serverNumber, leaveMsg);
        io.to(roomChannel).emit('chat:message', leaveMsg);
      }
    });
  });
}
