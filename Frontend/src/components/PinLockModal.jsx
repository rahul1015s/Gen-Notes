import React, { useState } from 'react';
import { Lock, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios.js';

const PinLockModal = ({ noteId, isOpen, onClose, onUnlocked }) => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);

  const handlePinChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (pin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/v1/locks/verify', {
        noteId,
        pin: parseInt(pin),
      });
      
      toast.success('✅ Note unlocked!');
      setPin('');
      setError('');
      onUnlocked?.(true);
      onClose?.();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to unlock note';
      setError(message);
      setAttemptsRemaining(err.response?.data?.attemptsRemaining || 0);
      
      if (attemptsRemaining === 0) {
        toast.error('🔒 Too many attempts. Try again in 5 minutes.');
        onClose?.();
      } else {
        toast.error(`❌ ${message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-base-100 rounded-2xl w-full max-w-sm p-8 shadow-2xl border border-base-300/50 animate-in zoom-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Lock className="w-6 h-6 text-warning" />
            <h3 className="text-xl font-semibold">Enter PIN</h3>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message */}
        <p className="text-sm text-base-content/70 mb-6">
          This note is locked. Enter your 4-digit PIN to access it.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* PIN Input */}
          <div>
            <input
              type="password"
              inputMode="numeric"
              placeholder="••••"
              className="input input-bordered w-full text-center text-3xl tracking-widest font-mono focus:input-primary"
              value={pin}
              onChange={handlePinChange}
              maxLength="4"
              disabled={loading}
              autoFocus
            />
            <div className="flex justify-center gap-2 mt-3">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition ${
                    i < pin.length ? 'bg-primary' : 'bg-base-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-error py-2">
              <span className="text-sm">{error}</span>
              {attemptsRemaining > 0 && (
                <span className="text-xs">
                  Attempts remaining: {attemptsRemaining}
                </span>
              )}
            </div>
          )}

          {/* Number Pad */}
          <div className="grid grid-cols-3 gap-2 my-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => pin.length < 4 && setPin(pin + num)}
                disabled={loading || pin.length >= 4}
                className="btn btn-outline py-4 text-lg font-semibold hover:bg-primary hover:text-primary-content"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={() => pin.length < 4 && setPin(pin + '0')}
              disabled={loading || pin.length >= 4}
              className="btn btn-outline col-start-2 py-4 text-lg font-semibold hover:bg-primary hover:text-primary-content"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => setPin(pin.slice(0, -1))}
              disabled={loading || pin.length === 0}
              className="btn btn-outline btn-error py-4"
            >
              ← Del
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || pin.length !== 4}
            className="btn btn-primary w-full gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Verifying...' : 'Unlock Note'}
          </button>
        </form>

        {/* Help Text */}
        <p className="text-xs text-center text-base-content/50 mt-6">
          Don't remember your PIN? Contact support.
        </p>
      </div>
    </div>
  );
};

export default PinLockModal;
