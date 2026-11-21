// src/components/transition/SpaceWarpTransition.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Rocket, Sparkles, Zap, Radio } from 'lucide-react';

interface SpaceWarpTransitionProps {
  serverNumber: string;
  traderName: string;
  onComplete: () => void;
}

export const SpaceWarpTransition: React.FC<SpaceWarpTransitionProps> = ({
  serverNumber,
  traderName,
  onComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [warpProgress, setWarpProgress] = useState(0);
  const [telemetryText, setTelemetryText] = useState('CALIBRATING QUANTUM HYPERDRIVE...');

  useEffect(() => {
    // 1. Play Synthesized Sci-Fi Hyperspace Sound (Native Web Audio API)
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const now = ctx.currentTime;

        // Low frequency engine spool & warp sweep
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(50, now);
        osc.frequency.exponentialRampToValueAtTime(420, now + 1.8);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(150, now);
        filter.frequency.exponentialRampToValueAtTime(4000, now + 1.8);

        oscGain.gain.setValueAtTime(0.01, now);
        oscGain.gain.linearRampToValueAtTime(0.2, now + 0.3);
        oscGain.gain.linearRampToValueAtTime(0.3, now + 1.6);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

        osc.connect(filter);
        filter.connect(oscGain);
        oscGain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 2.2);

        // White noise hyperspace wind / sonic boom
        const bufferSize = Math.floor(ctx.sampleRate * 2.2);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(250, now);
        noiseFilter.frequency.exponentialRampToValueAtTime(2200, now + 1.8);
        noiseFilter.Q.value = 2.5;

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.01, now);
        noiseGain.gain.linearRampToValueAtTime(0.25, now + 1.4);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(now);
        noise.stop(now + 2.2);
      }
    } catch {}

    // 2. Realistic 3D Starfield Warp Simulation
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Star data structure
    interface Star {
      x: number;
      y: number;
      z: number;
      pz: number;
      color: string;
      size: number;
    }

    const starCount = 1000;
    const maxZ = 1200;
    const stars: Star[] = [];

    const starPalette = [
      '#FFFFFF',
      '#00C896', // TradeMeet green
      '#00F0FF', // Cyan
      '#70A5FF', // Blue
      '#FFE57F', // Yellow star
    ];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width * 2.5,
        y: (Math.random() - 0.5) * height * 2.5,
        z: Math.random() * maxZ,
        pz: maxZ,
        color: starPalette[Math.floor(Math.random() * starPalette.length)],
        size: Math.random() * 2 + 1,
      });
    }

    const startTime = Date.now();
    const duration = 2100; // 2.1 seconds total hyperspace travel
    let animationId: number;

    const render = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      setWarpProgress(progress);

      // Update telemetry text at key milestones
      if (progress < 0.25) {
        setTelemetryText('INITIALIZING TRADING HYPERDRIVE • TRAJECTORY LOCKED');
      } else if (progress < 0.6) {
        setTelemetryText(`WARPING TO TRADING FLOOR SERVER #${serverNumber} • VELOCITY: WARP 8.4`);
      } else if (progress < 0.85) {
        setTelemetryText('SYNCHRONIZING 1080P VIDEO & AUDIO WEBRTC MESH • WARP 9.9');
      } else {
        setTelemetryText('DROPPING OUT OF HYPERSPACE • ENTERING ROOM...');
      }

      // Trail fade for motion blur
      ctx.fillStyle = progress > 0.88 ? `rgba(255, 255, 255, ${(progress - 0.88) * 8})` : 'rgba(5, 9, 18, 0.22)';
      ctx.fillRect(0, 0, width, height);

      // Speed increases exponentially as we warp
      const speed = 4 + Math.pow(progress, 2.5) * 85;
      const cx = width / 2;
      const cy = height / 2;

      ctx.lineWidth = 1.5;

      for (let i = 0; i < starCount; i++) {
        const star = stars[i];
        star.pz = star.z;
        star.z -= speed;

        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * width * 2.5;
          star.y = (Math.random() - 0.5) * height * 2.5;
          star.z = maxZ;
          star.pz = maxZ;
        }

        // Project 3D coordinates to 2D screen
        const k = 250 / star.z;
        const px = star.x * k + cx;
        const py = star.y * k + cy;

        const prevK = 250 / star.pz;
        const prevX = star.x * prevK + cx;
        const prevY = star.y * prevK + cy;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const brightness = Math.min(1, (1 - star.z / maxZ) * (0.4 + progress * 0.8));
          ctx.strokeStyle = star.color;
          ctx.globalAlpha = brightness;
          ctx.lineWidth = Math.max(1, (1 - star.z / maxZ) * 3);

          // Draw streak line from past position to current position
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(px, py);
          ctx.stroke();
        }
      }

      // Hyperspace central tunnel glow
      const tunnelGradient = ctx.createRadialGradient(cx, cy, 10, cx, cy, width * 0.6);
      tunnelGradient.addColorStop(0, `rgba(0, 200, 150, ${0.15 + progress * 0.3})`);
      tunnelGradient.addColorStop(0.3, `rgba(0, 240, 255, ${0.08 + progress * 0.2})`);
      tunnelGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = tunnelGradient;
      ctx.fillRect(0, 0, width, height);

      ctx.globalAlpha = 1.0;

      if (progress < 1) {
        animationId = requestAnimationFrame(render);
      } else {
        onComplete();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [serverNumber, onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#050912] flex flex-col items-center justify-between p-6 select-none overflow-hidden animate-in fade-in duration-200">
      {/* 3D Starfield Warp Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Top Telemetry Header */}
      <div className="relative z-10 w-full max-w-4xl flex items-center justify-between text-xs text-[#00C896] font-mono tracking-widest pt-4">
        <div className="flex items-center gap-2 bg-[#0B0F19]/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#00C896]/30">
          <Rocket className="w-4 h-4 animate-pulse text-[#00C896]" />
          <span>TRADEMATRIX // HYPERWARP ENGINE</span>
        </div>
        <div className="bg-[#0B0F19]/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#00C896]/30">
          <span>DESTINATION: SERVER #{serverNumber}</span>
        </div>
      </div>

      {/* Center Sci-Fi Crosshair & Warp Telemetry */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
        {/* Reticle graphic */}
        <div className="relative w-36 h-36 flex items-center justify-center mb-6">
          <div className="absolute inset-0 rounded-full border border-[#00C896]/40 animate-ping"></div>
          <div className="absolute inset-2 rounded-full border border-[#00F0FF]/30 border-dashed animate-spin duration-700"></div>
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#00C896]/30 to-[#00F0FF]/20 backdrop-blur-md border border-[#00C896] flex items-center justify-center shadow-[0_0_30px_#00C896]">
            <Zap className="w-8 h-8 text-white animate-pulse" />
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-white tracking-widest uppercase mb-2 drop-shadow-[0_0_12px_rgba(0,200,150,0.8)] font-sans">
          Traveling Into Space
        </h2>
        <p className="text-sm text-[#00F0FF] font-mono tracking-wider mb-4 drop-shadow">
          Trader: <span className="text-white font-bold">{traderName}</span>
        </p>

        {/* Progress Bar */}
        <div className="w-72 sm:w-96 h-2 bg-[#0B0F19] rounded-full border border-[#232D42] overflow-hidden p-0.5 mb-3 shadow-[0_0_15px_rgba(0,200,150,0.25)]">
          <div
            className="h-full bg-gradient-to-r from-[#00C896] via-[#00F0FF] to-white rounded-full transition-all duration-75 shadow-[0_0_10px_#00C896]"
            style={{ width: `${Math.round(warpProgress * 100)}%` }}
          />
        </div>

        <span className="text-xs font-mono text-[#00C896] tracking-widest">
          {telemetryText}
        </span>
      </div>

      {/* Bottom Footer Info */}
      <div className="relative z-10 w-full max-w-4xl flex items-center justify-between text-[11px] font-mono text-[#929BAD] pb-4">
        <span>COORDINATES: LAT 1.3521 / LON 103.8198</span>
        <button
          type="button"
          onClick={onComplete}
          className="text-[#5F6B84] hover:text-white transition-colors underline"
        >
          Skip Warp →
        </button>
      </div>
    </div>
  );
};
