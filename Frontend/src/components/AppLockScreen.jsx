import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import api from '@/lib/axios';
import PatternLock from './PatternLock';
import GestureLock from './GestureLock';

export default function AppLockScreen({ method = 'pin', onUnlocked = () => {}, isDark = true }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const verify = async (secret, m) => {
    setLoading(true);
    setError('');
    try {
      await api.post('/api/v1/users/app-lock/verify', { method: m, secret });
      onUnlocked();
    } catch (err) {
      setError(err.response?.data?.message || 'Unlock failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className={`w-full max-w-sm rounded-2xl border p-6 ${isDark ? 'bg-slate-900 border-slate-700/50 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Unlock App</h2>
            <p className="text-xs text-slate-400">Enter your {method}</p>
          </div>
        </div>

        {method === 'pin' && (
          <div className="space-y-3">
            <input
              type="password"
              inputMode="numeric"
              placeholder="Enter 4-digit PIN"
              className={`input input-bordered w-full text-center text-2xl tracking-widest font-mono ${isDark ? 'bg-slate-800 text-white border-slate-700' : ''}`}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              maxLength="4"
              disabled={loading}
            />
            <button
              className="btn btn-primary w-full"
              disabled={loading || pin.length !== 4}
              onClick={() => verify(pin, 'pin')}
            >
              Unlock
            </button>
          </div>
        )}

        {method === 'pattern' && (
          <PatternLock
            isDark={isDark}
            onComplete={(pattern) => verify(pattern, 'pattern')}
          />
        )}

        {method === 'gesture' && (
          <GestureLock
            isDark={isDark}
            onComplete={(gesture) => verify(gesture, 'gesture')}
          />
        )}

        {error && <div className="mt-3 text-sm text-red-400">{error}</div>}
      </div>
    </div>
  );
}
