// src/context/MediaContext.tsx
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useSocket } from './SocketContext';
import { getLiveKitToken } from '../services/api';
import { Room as LiveKitRoom, RoomEvent, Track, RemoteParticipant, RemoteTrackPublication } from 'livekit-client';

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
};

interface MediaDeviceOptions {
  audioInputs: MediaDeviceInfo[];
  videoInputs: MediaDeviceInfo[];
  audioOutputs: MediaDeviceInfo[];
}

interface MediaContextType {
  localStream: MediaStream | null;
  localScreenStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>; // participantId -> camera/mic MediaStream
  remoteScreenStreams: Map<string, MediaStream>; // presenterId -> screen MediaStream
  isAudioMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isSpeaking: boolean;
  currentAudioLevel: number;
  devices: MediaDeviceOptions;
  selectedAudioDeviceId: string;
  selectedVideoDeviceId: string;
  isLiveKitActive: boolean;
  toggleAudio: () => Promise<void>;
  toggleVideo: () => Promise<void>;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => void;
  selectAudioDevice: (deviceId: string) => void;
  selectVideoDevice: (deviceId: string) => void;
  requestMediaPermissions: () => Promise<boolean>;
}

const MediaContext = createContext<MediaContextType | null>(null);

export const MediaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { socket, currentRoom, currentParticipant, isConnected } = useSocket();

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [localScreenStream, setLocalScreenStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [remoteScreenStreams, setRemoteScreenStreams] = useState<Map<string, MediaStream>>(new Map());

  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [isVideoOff, setIsVideoOff] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentAudioLevel, setCurrentAudioLevel] = useState(0);

  const [devices, setDevices] = useState<MediaDeviceOptions>({
    audioInputs: [],
    videoInputs: [],
    audioOutputs: [],
  });
  const [selectedAudioDeviceId, setSelectedAudioDeviceId] = useState('');
  const [selectedVideoDeviceId, setSelectedVideoDeviceId] = useState('');
  const [isLiveKitActive, setIsLiveKitActive] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map());
  const livekitRoomRef = useRef<LiveKitRoom | null>(null);

  // Enumerate audio and video devices
  const updateDeviceList = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      setDevices({
        audioInputs: allDevices.filter((d) => d.kind === 'audioinput'),
        videoInputs: allDevices.filter((d) => d.kind === 'videoinput'),
        audioOutputs: allDevices.filter((d) => d.kind === 'audiooutput'),
      });
    } catch (err) {
      console.warn('Failed to enumerate devices:', err);
    }
  }, []);

  useEffect(() => {
    updateDeviceList();
    if (navigator.mediaDevices?.addEventListener) {
      navigator.mediaDevices.addEventListener('devicechange', updateDeviceList);
      return () => {
        navigator.mediaDevices.removeEventListener('devicechange', updateDeviceList);
      };
    }
  }, [updateDeviceList]);

  // Audio volume analyzer for speaking detection
  const setupAudioAnalyser = useCallback((stream: MediaStream) => {
    try {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const audioTrack = stream.getAudioTracks()[0];
      if (!audioTrack) return;

      const source = audioCtx.createMediaStreamSource(new MediaStream([audioTrack]));
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let lastSpeaking = false;
      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalized = Math.min(100, Math.round((average / 128) * 100));
        setCurrentAudioLevel(normalized);

        const speakingNow = normalized > 16 && !isAudioMuted;
        if (speakingNow !== lastSpeaking) {
          lastSpeaking = speakingNow;
          setIsSpeaking(speakingNow);
          if (socket && isConnected) {
            socket.emit('media:state-update', {
              isSpeaking: speakingNow,
              audioLevel: normalized,
            });
          }
        }

        animationFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (err) {
      console.warn('Audio analyser note:', err);
    }
  }, [socket, isConnected, isAudioMuted]);

  // Request initial media permissions
  const requestMediaPermissions = useCallback(async (): Promise<boolean> => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) return false;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      // Join muted with camera off by default
      stream.getAudioTracks().forEach((t) => (t.enabled = false));
      stream.getVideoTracks().forEach((t) => (t.enabled = false));

      setLocalStream(stream);
      setupAudioAnalyser(stream);
      await updateDeviceList();
      return true;
    } catch (err) {
      // If video fails, try audio only
      try {
        const audioOnly = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioOnly.getAudioTracks().forEach((t) => (t.enabled = false));
        setLocalStream(audioOnly);
        setupAudioAnalyser(audioOnly);
        return true;
      } catch {
        return false;
      }
    }
  }, [setupAudioAnalyser, updateDeviceList]);

  // Create or retrieve RTCPeerConnection for a remote peer
  const getOrCreatePeerConnection = useCallback((targetId: string, isInitiator = false) => {
    let pc = peerConnectionsRef.current.get(targetId);
    if (pc && pc.signalingState !== 'closed') {
      return pc;
    }

    pc = new RTCPeerConnection(RTC_CONFIG);
    peerConnectionsRef.current.set(targetId, pc);

    // Add local tracks to this connection
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc!.addTrack(track, localStream);
      });
    }

    // Handle remote media track arrival
    pc.ontrack = (event) => {
      const incomingStream = event.streams[0];
      if (incomingStream) {
        remoteStreamsRef.current.set(targetId, incomingStream);
        setRemoteStreams(new Map(remoteStreamsRef.current));
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket && isConnected) {
        socket.emit('webrtc:ice-candidate', {
          to: targetId,
          candidate: event.candidate,
        });
      }
    };

    // If initiator, create and send WebRTC offer
    if (isInitiator) {
      pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true })
        .then((offer) => pc!.setLocalDescription(offer))
        .then(() => {
          if (socket && isConnected) {
            socket.emit('webrtc:offer', {
              to: targetId,
              offer: pc!.localDescription,
            });
          }
        })
        .catch((err) => console.warn('Create offer error:', err));
    }

    return pc;
  }, [localStream, socket, isConnected]);

  // Toggle Microphone
  const toggleAudio = useCallback(async () => {
    try {
      let stream = localStream;
      if (!stream) {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: selectedAudioDeviceId ? { deviceId: { exact: selectedAudioDeviceId } } : true,
          video: false,
        });
        setLocalStream(stream);
        setupAudioAnalyser(stream);
      }

      let audioTrack = stream.getAudioTracks()[0];
      const nextMuted = !isAudioMuted;

      if (!audioTrack && !nextMuted) {
        const newAudio = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioTrack = newAudio.getAudioTracks()[0];
        stream.addTrack(audioTrack);
      }

      if (audioTrack) {
        audioTrack.enabled = !nextMuted;
        setIsAudioMuted(nextMuted);

        // Add to peer connections if not present
        peerConnectionsRef.current.forEach((pc) => {
          const senders = pc.getSenders();
          const hasSender = senders.some((s) => s.track?.kind === 'audio');
          if (!hasSender && audioTrack) {
            pc.addTrack(audioTrack, stream!);
          }
        });

        if (socket && isConnected) {
          socket.emit('media:state-update', {
            isAudioMuted: nextMuted,
            isSpeaking: false,
          });
        }
      }
    } catch (err) {
      console.error('Error toggling audio:', err);
    }
  }, [localStream, isAudioMuted, selectedAudioDeviceId, setupAudioAnalyser, socket, isConnected]);

  // Toggle Video Camera
  const toggleVideo = useCallback(async () => {
    try {
      let stream = localStream;
      const nextVideoOff = !isVideoOff;

      if (!nextVideoOff) {
        // Turning video ON: Get camera video track
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: selectedVideoDeviceId ? { deviceId: { exact: selectedVideoDeviceId } } : true,
          audio: false,
        });
        const newVideoTrack = videoStream.getVideoTracks()[0];

        if (!stream) {
          stream = new MediaStream([newVideoTrack]);
          setLocalStream(stream);
        } else {
          const oldTrack = stream.getVideoTracks()[0];
          if (oldTrack) {
            stream.removeTrack(oldTrack);
            oldTrack.stop();
          }
          stream.addTrack(newVideoTrack);
          setLocalStream(new MediaStream(stream.getTracks()));
        }

        setIsVideoOff(false);

        // Update all peer connections with new video track
        peerConnectionsRef.current.forEach(async (pc) => {
          const senders = pc.getSenders();
          const videoSender = senders.find((s) => s.track?.kind === 'video');
          if (videoSender) {
            videoSender.replaceTrack(newVideoTrack).catch(() => {});
          } else {
            pc.addTrack(newVideoTrack, stream!);
            // Renegotiate
            try {
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              const targetId = Array.from(peerConnectionsRef.current.entries()).find(([_, p]) => p === pc)?.[0];
              if (targetId && socket && isConnected) {
                socket.emit('webrtc:offer', { to: targetId, offer });
              }
            } catch {}
          }
        });

        if (socket && isConnected) {
          socket.emit('media:state-update', { isVideoOff: false });
        }
      } else {
        // Turning video OFF
        if (stream) {
          stream.getVideoTracks().forEach((track) => {
            track.enabled = false;
            track.stop();
            stream!.removeTrack(track);
          });
          setLocalStream(new MediaStream(stream.getTracks()));
        }
        setIsVideoOff(true);

        peerConnectionsRef.current.forEach((pc) => {
          const videoSender = pc.getSenders().find((s) => s.track?.kind === 'video');
          if (videoSender) {
            videoSender.replaceTrack(null).catch(() => {});
          }
        });

        if (socket && isConnected) {
          socket.emit('media:state-update', { isVideoOff: true });
        }
      }
    } catch (err) {
      console.error('Error toggling video:', err);
    }
  }, [localStream, isVideoOff, selectedVideoDeviceId, socket, isConnected]);

  // Simultaneous Screen Sharing
  const startScreenShare = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        alert('Screen sharing is not supported by your browser.');
        return;
      }

      const screen = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'monitor' },
        audio: true,
      });

      setLocalScreenStream(screen);
      setIsScreenSharing(true);

      const screenTrack = screen.getVideoTracks()[0];

      // Add screen track to all peer connections
      peerConnectionsRef.current.forEach(async (pc, targetId) => {
        pc.addTrack(screenTrack, screen);
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          if (socket && isConnected) {
            socket.emit('webrtc:offer', { to: targetId, offer, type: 'screen' });
          }
        } catch {}
      });

      if (socket && isConnected) {
        socket.emit('screen:start');
      }

      screenTrack.onended = () => {
        stopScreenShare();
      };
    } catch (err) {
      console.warn('Screen share canceled:', err);
    }
  }, [socket, isConnected]);

  const stopScreenShare = useCallback(() => {
    if (localScreenStream) {
      localScreenStream.getTracks().forEach((t) => t.stop());
      setLocalScreenStream(null);
    }
    setIsScreenSharing(false);
    if (socket && isConnected) {
      socket.emit('screen:stop');
    }
  }, [localScreenStream, socket, isConnected]);

  // Device switching
  const selectAudioDevice = useCallback(async (deviceId: string) => {
    setSelectedAudioDeviceId(deviceId);
    if (localStream) {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: deviceId } },
        });
        const oldTrack = localStream.getAudioTracks()[0];
        const newTrack = newStream.getAudioTracks()[0];
        if (oldTrack) {
          localStream.removeTrack(oldTrack);
          oldTrack.stop();
        }
        newTrack.enabled = !isAudioMuted;
        localStream.addTrack(newTrack);
        setupAudioAnalyser(localStream);
      } catch (err) {
        console.error('Failed to switch audio device:', err);
      }
    }
  }, [localStream, isAudioMuted, setupAudioAnalyser]);

  const selectVideoDevice = useCallback(async (deviceId: string) => {
    setSelectedVideoDeviceId(deviceId);
    if (localStream && !isVideoOff) {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: deviceId } },
        });
        const oldTrack = localStream.getVideoTracks()[0];
        const newTrack = newStream.getVideoTracks()[0];
        if (oldTrack) {
          localStream.removeTrack(oldTrack);
          oldTrack.stop();
        }
        localStream.addTrack(newTrack);
        setLocalStream(new MediaStream(localStream.getTracks()));
      } catch (err) {
        console.error('Failed to switch video device:', err);
      }
    }
  }, [localStream, isVideoOff]);

  // WebRTC mesh signaling handler: connects ANY two participants in the same server room!
  useEffect(() => {
    if (!socket) return;

    // 1. When a new participant joins our server, create WebRTC offer and initiate call
    const handleParticipantJoined = ({ participant }: { participant: { id: string; name: string } }) => {
      if (participant.id !== currentParticipant?.id) {
        console.log(`📡 New participant joined (${participant.name}). Initiating WebRTC connection...`);
        getOrCreatePeerConnection(participant.id, true);
      }
    };

    // 2. When receiving WebRTC offer from another participant
    const handleOffer = async ({ from, offer }: { from: string; offer: any }) => {
      try {
        const pc = getOrCreatePeerConnection(from, false);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('webrtc:answer', { to: from, answer });
      } catch (err) {
        console.warn('WebRTC offer handling error:', err);
      }
    };

    // 3. When receiving WebRTC answer
    const handleAnswer = async ({ from, answer }: { from: string; answer: any }) => {
      try {
        const pc = peerConnectionsRef.current.get(from);
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
      } catch (err) {
        console.warn('WebRTC answer handling error:', err);
      }
    };

    // 4. When receiving ICE candidate
    const handleCandidate = async ({ from, candidate }: { from: string; candidate: any }) => {
      try {
        const pc = peerConnectionsRef.current.get(from);
        if (pc && candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.warn('WebRTC candidate handling error:', err);
      }
    };

    // 5. When participant leaves, clean up connection
    const handleParticipantLeft = ({ participantId }: { participantId: string }) => {
      const pc = peerConnectionsRef.current.get(participantId);
      if (pc) {
        pc.close();
        peerConnectionsRef.current.delete(participantId);
      }
      remoteStreamsRef.current.delete(participantId);
      setRemoteStreams(new Map(remoteStreamsRef.current));
    };

    socket.on('participant:joined', handleParticipantJoined);
    socket.on('webrtc:offer', handleOffer);
    socket.on('webrtc:answer', handleAnswer);
    socket.on('webrtc:ice-candidate', handleCandidate);
    socket.on('participant:left', handleParticipantLeft);

    return () => {
      socket.off('participant:joined', handleParticipantJoined);
      socket.off('webrtc:offer', handleOffer);
      socket.off('webrtc:answer', handleAnswer);
      socket.off('webrtc:ice-candidate', handleCandidate);
      socket.off('participant:left', handleParticipantLeft);
    };
  }, [socket, currentParticipant?.id, getOrCreatePeerConnection]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
      if (localStream) localStream.getTracks().forEach((t) => t.stop());
      if (localScreenStream) localScreenStream.getTracks().forEach((t) => t.stop());
      peerConnectionsRef.current.forEach((pc) => pc.close());
    };
  }, []);

  return (
    <MediaContext.Provider
      value={{
        localStream,
        localScreenStream,
        remoteStreams,
        remoteScreenStreams,
        isAudioMuted,
        isVideoOff,
        isScreenSharing,
        isSpeaking,
        currentAudioLevel,
        devices,
        selectedAudioDeviceId,
        selectedVideoDeviceId,
        isLiveKitActive,
        toggleAudio,
        toggleVideo,
        startScreenShare,
        stopScreenShare,
        selectAudioDevice,
        selectVideoDevice,
        requestMediaPermissions,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = () => {
  const ctx = useContext(MediaContext);
  if (!ctx) throw new Error('useMedia must be used within a MediaProvider');
  return ctx;
};
