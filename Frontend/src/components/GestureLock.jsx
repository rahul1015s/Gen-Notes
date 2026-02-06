import React, { useRef, useState } from 'react';

export default function GestureLock({ onComplete = () => {}, isDark = true }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [points, setPoints] = useState([]);

  const start = (e) => {
    setDrawing(true);
    setPoints([]);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    setPoints([{ x: x - rect.left, y: y - rect.top }]);
  };

  const move = (e) => {
    if (!drawing) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    setPoints((prev) => [...prev, { x: x - rect.left, y: y - rect.top }]);
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = isDark ? '#60a5fa' : '#2563eb';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      const last = points[points.length - 1];
      if (last) {
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(x - rect.left, y - rect.top);
        ctx.stroke();
      }
    }
  };

  const end = () => {
    if (!drawing) return;
    setDrawing(false);
    const signature = points.map((p) => `${Math.round(p.x)}.${Math.round(p.y)}`).join('|');
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    if (signature.length > 20) {
      onComplete(signature);
    }
  };

  return (
    <div className="space-y-3">
      <div className={`rounded-xl border p-3 ${isDark ? 'border-slate-700/50 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
        <canvas
          ref={canvasRef}
          width={260}
          height={160}
          className="w-full h-40 rounded-lg"
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
        />
      </div>
      <p className="text-xs text-slate-400">Draw a gesture to unlock</p>
    </div>
  );
}
