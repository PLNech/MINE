'use client';

import { useGame } from '@/lib/context/GameContext';
import { useEffect, useRef } from 'react';

export default function GameMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { state } = useGame();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to parent size
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Draw sepia-toned map background
    ctx.fillStyle = '#e4d5b7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw mock mine in center
    ctx.strokeStyle = '#4a3f35';
    ctx.lineWidth = 2;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw mine entrance (simple triangle)
    ctx.beginPath();
    ctx.moveTo(centerX - 30, centerY + 20);
    ctx.lineTo(centerX, centerY - 20);
    ctx.lineTo(centerX + 30, centerY + 20);
    ctx.closePath();
    ctx.stroke();

    // Draw some terrain lines
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(centerX - 100 + (i * 40), centerY - 50 + (Math.sin(i) * 20));
      ctx.lineTo(centerX - 80 + (i * 40), centerY + 50 + (Math.cos(i) * 20));
      ctx.stroke();
    }

    return () => window.removeEventListener('resize', resizeCanvas);
  }, [state]);

  return (
    <div className="relative w-full h-full">
      <canvas 
        ref={canvasRef}
        className="absolute inset-0"
      />
      {/* Overlay for paper texture */}
      <div className="absolute inset-0 pointer-events-none bg-paper-texture opacity-30" />
    </div>
  );
} 