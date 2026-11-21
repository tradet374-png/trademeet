// src/components/home/BackgroundAnimation.tsx
import React, { useEffect, useRef } from 'react';
import traderHeroBg from '../../assets/trader-hero-bg.jpg';

export const BackgroundAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Candlestick data points for a smooth animated wave
    interface Candle {
      x: number;
      open: number;
      close: number;
      high: number;
      low: number;
      color: string;
      speed: number;
    }

    const candleWidth = 14;
    const candleSpacing = 28;
    const candleCount = Math.ceil(width / candleSpacing) + 5;
    const candles: Candle[] = [];

    let baseline = height * 0.65;
    let price = baseline;

    for (let i = 0; i < candleCount; i++) {
      const delta = (Math.random() - 0.48) * 45;
      const nextPrice = Math.max(height * 0.25, Math.min(height * 0.85, price + delta));
      const isGreen = nextPrice < price; // In canvas Y is down, so lower Y means higher price
      const open = price;
      const close = nextPrice;
      const high = Math.min(open, close) - Math.random() * 25;
      const low = Math.max(open, close) + Math.random() * 25;

      candles.push({
        x: i * candleSpacing,
        open,
        close,
        high,
        low,
        color: isGreen ? '#00C896' : '#FF4B55',
        speed: 0.6,
      });

      price = nextPrice;
    }

    let offset = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw subtle grid
      ctx.strokeStyle = 'rgba(35, 45, 66, 0.25)';
      ctx.lineWidth = 1;

      const gridSize = 48;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Ambient radial glow on background
      const gradient = ctx.createRadialGradient(
        width * 0.5,
        height * 0.4,
        50,
        width * 0.5,
        height * 0.5,
        width * 0.7
      );
      gradient.addColorStop(0, 'rgba(0, 200, 150, 0.04)');
      gradient.addColorStop(0.5, 'rgba(21, 27, 43, 0.3)');
      gradient.addColorStop(1, 'rgba(11, 15, 25, 0.95)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // 3. Draw moving candlesticks with low opacity
      offset += 0.5;
      if (offset >= candleSpacing) {
        offset = 0;
        const first = candles.shift();
        if (first) {
          const last = candles[candles.length - 1];
          const delta = (Math.random() - 0.48) * 45;
          const nextPrice = Math.max(height * 0.25, Math.min(height * 0.85, last.close + delta));
          const isGreen = nextPrice < last.close;
          candles.push({
            x: last.x + candleSpacing,
            open: last.close,
            close: nextPrice,
            high: Math.min(last.close, nextPrice) - Math.random() * 25,
            low: Math.max(last.close, nextPrice) + Math.random() * 25,
            color: isGreen ? '#00C896' : '#FF4B55',
            speed: 0.6,
          });
        }
      }

      // Draw chart line underneath candles
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 200, 150, 0.25)';
      ctx.lineWidth = 2;
      for (let i = 0; i < candles.length; i++) {
        const c = candles[i];
        const posX = c.x - offset;
        const midY = (c.open + c.close) / 2;
        if (i === 0) ctx.moveTo(posX, midY);
        else ctx.lineTo(posX, midY);
      }
      ctx.stroke();

      // Draw Candlesticks
      ctx.globalAlpha = 0.22;
      for (const c of candles) {
        const posX = c.x - offset;
        if (posX < -50 || posX > width + 50) continue;

        ctx.strokeStyle = c.color;
        ctx.fillStyle = c.color;
        ctx.lineWidth = 1.5;

        // Wick
        ctx.beginPath();
        ctx.moveTo(posX + candleWidth / 2, c.high);
        ctx.lineTo(posX + candleWidth / 2, c.low);
        ctx.stroke();

        // Body
        const top = Math.min(c.open, c.close);
        const bodyHeight = Math.max(3, Math.abs(c.open - c.close));
        ctx.fillRect(posX, top, candleWidth, bodyHeight);
      }
      ctx.globalAlpha = 1.0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* High-Impact Trading Desk & Bull/Bear Background Image */}
      <img
        src={traderHeroBg}
        alt="Trading Floor Background"
        className="w-full h-full object-cover object-center scale-105 filter brightness-[0.55] contrast-125 saturate-110"
      />

      {/* Atmospheric dark gradient overlays to ensure text & form elements are 100% crisp and readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F19]/75 via-[#0B0F19]/50 to-[#0B0F19]/90" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_#0B0F19_85%)]" />

      {/* Subtle animated candlestick wave overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-25 mix-blend-screen"
      />
    </div>
  );
};
