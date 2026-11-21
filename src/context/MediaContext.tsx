// src/context/MediaContext.tsx
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useSocket } from './SocketContext';

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
  const { socket, currentParticipant, isConnected, participants, activeScreens } = useSocket();

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
  const [isLiveKitActive] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Dedicated PeerConnections for Camera & Audio
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map());

  // Dedicated PeerConnections for Multi-Screen Sharing
  const screenPeerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteScreenStreamsRef = useRef<Map<string, MediaStream>>(new Map());

  // ICE Candidate Queues to prevent race conditions before remote description is set
  const pendingIceCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const pendingScreenIceCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());

  const localScreenStreamRef = useRef<MediaStream | null>(null);
  localScreenStreamRef.current = localScreenStream;

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

  // Request initial media permissions (non-blocking)
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
    } catch {
      // Fallback: try audio only if camera is unavailable or denied
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

  // ================= CAMERA & AUDIO WEBRTC CONNECTION =================
  const getOrCreatePeerConnection = useCallback((targetId: string, isInitiator = false) => {
    let pc = peerConnectionsRef.current.get(targetId);
    if (pc && pc.signalingState !== 'closed') {
      return pc;
    }

    pc = new RTCPeerConnection(RTC_CONFIG);
    peerConnectionsRef.current.set(targetId, pc);

    // Ensure audio & video senders or transceivers exist
    const senders = pc.getSenders();
    const hasAudioSender = senders.some((s) => s.track?.kind === 'audio');
    const hasVideoSender = senders.some((s) => s.track?.kind === 'video');

    if (localStream) {
      localStream.getTracks().forEach((track) => {
        const existingSender = senders.find((s) => s.track?.kind === track.kind);
        if (!existingSender) {
          pc.addTrack(track, localStream!);
        } else {
          existingSender.replaceTrack(track).catch(() => {});
        }
      });
    }

    // Pre-allocate transceivers if tracks are not attached yet so SDP has audio & video slots ready
    if (!hasAudioSender && !pc.getSenders().some((s) => s.track?.kind === 'audio')) {
      try { pc.addTransceiver('audio', { direction: 'sendrecv' }); } catch {}
    }
    if (!hasVideoSender && !pc.getSenders().some((s) => s.track?.kind === 'video')) {
      try { pc.addTransceiver('video', { direction: 'sendrecv' }); } catch {}
    }

    // Handle remote camera/mic media track arrival
    pc.ontrack = (event) => {
      const incomingStream = event.streams[0] || new MediaStream([event.track]);
      remoteStreamsRef.current.set(targetId, incomingStream);
      setRemoteStreams(new Map(remoteStreamsRef.current));
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket && isConnected) {
        socket.emit('webrtc:ice-candidate', {
          to: targetId,
          candidate: event.candidate,
          type: 'media',
        });
      }
    };

    // If initiator, create and send WebRTC offer for media
    if (isInitiator) {
      pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true })
        .then((offer) => pc!.setLocalDescription(offer))
        .then(() => {
          if (socket && isConnected) {
            socket.emit('webrtc:offer', {
              to: targetId,
              offer: pc!.localDescription,
              type: 'media',
            });
          }
        })
        .catch((err) => console.warn('Create offer error (media):', err));
    }

    return pc;
  }, [localStream, socket, isConnected]);

  // ================= DEDICATED SCREEN SHARING WEBRTC =================
  const sendScreenOfferToPeer = useCallback(async (targetId: string, screenStream: MediaStream) => {
    try {
      const oldPc = screenPeerConnectionsRef.current.get(targetId);
      if (oldPc) {
        oldPc.close();
      }

      const screenPc = new RTCPeerConnection(RTC_CONFIG);
      screenPeerConnectionsRef.current.set(targetId, screenPc);

      screenStream.getTracks().forEach((track) => {
        screenPc.addTrack(track, screenStream);
      });

      screenPc.onicecandidate = (event) => {
        if (event.candidate && socket && isConnected) {
          socket.emit('webrtc:ice-candidate', {
            to: targetId,
            candidate: event.candidate,
            type: 'screen',
          });
        }
      };

      const offer = await screenPc.createOffer();
      await screenPc.setLocalDescription(offer);

      if (socket && isConnected) {
        socket.emit('webrtc:offer', {
          to: targetId,
          offer: screenPc.localDescription,
          type: 'screen',
        });
      }
    } catch (err) {
      console.warn('Error sending screen offer to peer:', err);
    }
  }, [socket, isConnected]);

  const handleScreenOffer = useCallback(async (from: string, offer: any) => {
    try {
      const oldPc = screenPeerConnectionsRef.current.get(from);
      if (oldPc) {
        oldPc.close();
      }

      const screenPc = new RTCPeerConnection(RTC_CONFIG);
      screenPeerConnectionsRef.current.set(from, screenPc);

      screenPc.ontrack = (event) => {
        const incomingScreen = event.streams[0] || new MediaStream([event.track]);
        remoteScreenStreamsRef.current.set(from, incomingScreen);
        setRemoteScreenStreams(new Map(remoteScreenStreamsRef.current));
      };

      screenPc.onicecandidate = (event) => {
        if (event.candidate && socket && isConnected) {
          socket.emit('webrtc:ice-candidate', {
            to: from,
            candidate: event.candidate,
            type: 'screen',
          });
        }
      };

      await screenPc.setRemoteDescription(new RTCSessionDescription(offer));

      // Flush any pending screen ICE candidates that arrived before description
      const queuedCandidates = pendingScreenIceCandidatesRef.current.get(from) || [];
      for (const cand of queuedCandidates) {
        try {
          await screenPc.addIceCandidate(new RTCIceCandidate(cand));
        } catch {}
      }
      pendingScreenIceCandidatesRef.current.delete(from);

      const answer = await screenPc.createAnswer();
      await screenPc.setLocalDescription(answer);

      if (socket && isConnected) {
        socket.emit('webrtc:answer', {
          to: from,
          answer: screenPc.localDescription,
          type: 'screen',
        });
      }
    } catch (err) {
      console.warn('Error handling screen offer:', err);
    }
  }, [socket, isConnected]);

  const handleScreenAnswer = useCallback(async (from: string, answer: any) => {
    try {
      const screenPc = screenPeerConnectionsRef.current.get(from);
      if (screenPc) {
        await screenPc.setRemoteDescription(new RTCSessionDescription(answer));

        // Flush any pending screen ICE candidates
        const queuedCandidates = pendingScreenIceCandidatesRef.current.get(from) || [];
        for (const cand of queuedCandidates) {
          try {
            await screenPc.addIceCandidate(new RTCIceCandidate(cand));
          } catch {}
        }
        pendingScreenIceCandidatesRef.current.delete(from);
      }
    } catch (err) {
      console.warn('Error handling screen answer:', err);
    }
  }, []);

  const handleScreenCandidate = useCallback(async (from: string, candidate: any) => {
    try {
      const screenPc = screenPeerConnectionsRef.current.get(from);
      if (screenPc && screenPc.remoteDescription) {
        await screenPc.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        const queue = pendingScreenIceCandidatesRef.current.get(from) || [];
        queue.push(candidate);
        pendingScreenIceCandidatesRef.current.set(from, queue);
      }
    } catch (err) {
      console.warn('Error handling screen ICE candidate:', err);
    }
  }, []);

  // Sync remoteScreenStreams with server activeScreens list
  useEffect(() => {
    const activePresenterIds = new Set(activeScreens.map((s) => s.presenterId));
    let changed = false;

    for (const presenterId of remoteScreenStreamsRef.current.keys()) {
      if (!activePresenterIds.has(presenterId)) {
        const pc = screenPeerConnectionsRef.current.get(presenterId);
        if (pc) {
          pc.close();
        }
        screenPeerConnectionsRef.current.delete(presenterId);
        remoteScreenStreamsRef.current.delete(presenterId);
        changed = true;
      }
    }

    if (changed) {
      setRemoteScreenStreams(new Map(remoteScreenStreamsRef.current));
    }
  }, [activeScreens]);

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

        // Update all peer connections with active audio track
        peerConnectionsRef.current.forEach(async (pc, targetId) => {
          const senders = pc.getSenders();
          const audioSender = senders.find((s) => s.track?.kind === 'audio');
          if (audioSender) {
            await audioSender.replaceTrack(audioTrack);
          } else {
            pc.addTrack(audioTrack, stream!);
            if (pc.signalingState === 'stable') {
              try {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socket?.emit('webrtc:offer', { to: targetId, offer, type: 'media' });
              } catch {}
            }
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

  // Synchronize localStream tracks to all active peer connections whenever localStream updates
  useEffect(() => {
    if (!localStream) return;
    const tracks = localStream.getTracks();

    peerConnectionsRef.current.forEach(async (pc, targetId) => {
      let needsRenegotiation = false;
      const senders = pc.getSenders();

      for (const track of tracks) {
        const sender = senders.find((s) => s.track?.kind === track.kind);
        if (sender) {
          sender.replaceTrack(track).catch(() => {});
        } else {
          pc.addTrack(track, localStream);
          needsRenegotiation = true;
        }
      }

      if (needsRenegotiation && pc.signalingState === 'stable') {
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          if (socket && isConnected) {
            socket.emit('webrtc:offer', { to: targetId, offer, type: 'media' });
          }
        } catch (err) {
          console.warn('Media track renegotiation error:', err);
        }
      }
    });
  }, [localStream, socket, isConnected]);

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

        // Update all media peer connections with new video track
        peerConnectionsRef.current.forEach(async (pc) => {
          const senders = pc.getSenders();
          const videoSender = senders.find((s) => s.track?.kind === 'video');
          if (videoSender) {
            videoSender.replaceTrack(newVideoTrack).catch(() => {});
          } else {
            pc.addTrack(newVideoTrack, stream!);
            try {
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              const targetId = Array.from(peerConnectionsRef.current.entries()).find(([_, p]) => p === pc)?.[0];
              if (targetId && socket && isConnected) {
                socket.emit('webrtc:offer', { to: targetId, offer, type: 'media' });
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

  // Simultaneous Screen Sharing (Supports Desktop, Android Chrome, and iOS Camera Cast)
  const startScreenShare = useCallback(async () => {
    try {
      const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
      let screen: MediaStream;

      if (navigator.mediaDevices?.getDisplayMedia) {
        // Standard getDisplayMedia: use clean mobile-compatible parameters
        const constraints = isMobile
          ? { video: true } // Mobile Android Chrome does not support audio or displaySurface constraints
          : { video: { frameRate: { ideal: 30, max: 60 } }, audio: true };

        screen = await navigator.mediaDevices.getDisplayMedia(constraints);
      } else {
        // iOS Safari or unsupported mobile browser fallback: Document / Screen Camera Cast
        const userChoice = window.confirm(
          'Mobile Safari does not allow direct web screen recording.\n\nWould you like to share your Camera View as a presentation / chart stream instead?'
        );
        if (!userChoice) return;

        screen = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
      }

      setLocalScreenStream(screen);
      localScreenStreamRef.current = screen;
      setIsScreenSharing(true);

      // Notify server so activeScreens in room is updated
      if (socket && isConnected) {
        socket.emit('screen:start');
      }

      // Send screen offer to EVERY participant currently connected
      participants.forEach((p) => {
        if (p.id !== currentParticipant?.id) {
          sendScreenOfferToPeer(p.id, screen);
        }
      });

      const screenTrack = screen.getVideoTracks()[0];
      if (screenTrack) {
        screenTrack.onended = () => {
          stopScreenShare();
        };
      }
    } catch (err: any) {
      if (err.name !== 'NotAllowedError') {
        console.warn('Screen share error:', err);
      }
    }
  }, [socket, isConnected, participants, currentParticipant?.id, sendScreenOfferToPeer]);

  const stopScreenShare = useCallback(() => {
    if (localScreenStreamRef.current) {
      localScreenStreamRef.current.getTracks().forEach((t) => t.stop());
      localScreenStreamRef.current = null;
      setLocalScreenStream(null);
    }
    setIsScreenSharing(false);

    // Close and clear our outgoing screen connections
    screenPeerConnectionsRef.current.forEach((pc) => pc.close());
    screenPeerConnectionsRef.current.clear();

    if (socket && isConnected) {
      socket.emit('screen:stop');
    }
  }, [socket, isConnected]);

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

    // 1. When a new participant joins our server
    const handleParticipantJoined = ({ participant }: { participant: { id: string; name: string } }) => {
      if (participant.id !== currentParticipant?.id) {
        console.log(`📡 New participant joined (${participant.name}). Initiating WebRTC media connection...`);
        getOrCreatePeerConnection(participant.id, true);

        // If I am currently sharing screen, send screen offer to the new participant!
        if (localScreenStreamRef.current) {
          sendScreenOfferToPeer(participant.id, localScreenStreamRef.current);
        }
      }
    };

    // 2. When receiving WebRTC offer
    const handleOffer = async ({ from, offer, type }: { from: string; offer: any; type?: string }) => {
      if (type === 'screen') {
        handleScreenOffer(from, offer);
      } else {
        try {
          const pc = getOrCreatePeerConnection(from, false);
          await pc.setRemoteDescription(new RTCSessionDescription(offer));

          // Flush any pending media ICE candidates
          const queued = pendingIceCandidatesRef.current.get(from) || [];
          for (const cand of queued) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(cand));
            } catch {}
          }
          pendingIceCandidatesRef.current.delete(from);

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socket.emit('webrtc:answer', { to: from, answer, type: 'media' });
        } catch (err) {
          console.warn('WebRTC media offer handling error:', err);
        }
      }
    };

    // 3. When receiving WebRTC answer
    const handleAnswer = async ({ from, answer, type }: { from: string; answer: any; type?: string }) => {
      if (type === 'screen') {
        handleScreenAnswer(from, answer);
      } else {
        try {
          const pc = peerConnectionsRef.current.get(from);
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));

            // Flush any pending media ICE candidates
            const queued = pendingIceCandidatesRef.current.get(from) || [];
            for (const cand of queued) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(cand));
              } catch {}
            }
            pendingIceCandidatesRef.current.delete(from);
          }
        } catch (err) {
          console.warn('WebRTC media answer handling error:', err);
        }
      }
    };

    // 4. When receiving ICE candidate
    const handleCandidate = async ({ from, candidate, type }: { from: string; candidate: any; type?: string }) => {
      if (type === 'screen') {
        handleScreenCandidate(from, candidate);
      } else {
        try {
          const pc = peerConnectionsRef.current.get(from);
          if (pc && pc.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } else {
            const queue = pendingIceCandidatesRef.current.get(from) || [];
            queue.push(candidate);
            pendingIceCandidatesRef.current.set(from, queue);
          }
        } catch (err) {
          console.warn('WebRTC media candidate handling error:', err);
        }
      }
    };

    // 5. When participant leaves, clean up connections
    const handleParticipantLeft = ({ participantId }: { participantId: string }) => {
      const pc = peerConnectionsRef.current.get(participantId);
      if (pc) {
        pc.close();
        peerConnectionsRef.current.delete(participantId);
      }
      remoteStreamsRef.current.delete(participantId);
      setRemoteStreams(new Map(remoteStreamsRef.current));

      const screenPc = screenPeerConnectionsRef.current.get(participantId);
      if (screenPc) {
        screenPc.close();
        screenPeerConnectionsRef.current.delete(participantId);
      }
      remoteScreenStreamsRef.current.delete(participantId);
      setRemoteScreenStreams(new Map(remoteScreenStreamsRef.current));
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
  }, [
    socket,
    currentParticipant?.id,
    getOrCreatePeerConnection,
    sendScreenOfferToPeer,
    handleScreenOffer,
    handleScreenAnswer,
    handleScreenCandidate,
  ]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
      if (localStream) localStream.getTracks().forEach((t) => t.stop());
      if (localScreenStreamRef.current) localScreenStreamRef.current.getTracks().forEach((t) => t.stop());
      peerConnectionsRef.current.forEach((pc) => pc.close());
      screenPeerConnectionsRef.current.forEach((pc) => pc.close());
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
