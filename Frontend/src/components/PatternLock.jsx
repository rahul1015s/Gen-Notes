import React, { useState } from 'react';

const points = [
  1,2,3,
  4,5,6,
  7,8,9
];

export default function PatternLock({ onComplete = () => {}, isDark = true }) {
  const [pattern, setPattern] = useState([]);

  const handleTap = (id) => {
    if (pattern.includes(id)) return;
    const next = [...pattern, id];
    setPattern(next);
    if (next.length >= 4) {
      onComplete(next.join('-'));
      setPattern([]);
    }
  };

  return (
    <div className="space-y-3">
      <div className={`grid grid-cols-3 gap-4 p-4 rounded-xl border ${isDark ? 'border-slate-700/50 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
        {points.map((p) => (
          <button
            key={p}
            className={`w-14 h-14 rounded-full border flex items-center justify-center text-sm font-semibold ${
              pattern.includes(p)
                ? 'bg-blue-600 text-white border-blue-600'
                : isDark
                  ? 'border-slate-600 text-slate-300'
                  : 'border-slate-300 text-slate-700'
            }`}
            onClick={() => handleTap(p)}
          >
            {p}
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-400">Tap 4+ dots to unlock</p>
    </div>
  );
}
