import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios.js';

const NoteLockSettings = ({ noteId, onLockStatusChange }) => {
  const [isLocked, setIsLocked] = useState(false);
  const [lockType, setLockType] = useState('PIN');
  const [loading, setLoading] = useState(true);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);

  // Fetch lock status
  useEffect(() => {
    fetchLockStatus();
  }, [noteId]);

  const fetchLockStatus = async () => {
    try {
      const res = await api.get(`/api/v1/locks/${noteId}`);
      setIsLocked(res.data.isLocked);
      setLockType(res.data.lockType);
    } catch (err) {
      // No lock found, which is fine
      setIsLocked(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLock = async () => {
    if (newPin.length !== 4 || confirmPin.length !== 4) {
      toast.error('PIN must be 4 digits');
      return;
    }

    if (newPin !== confirmPin) {
      toast.error('PINs do not match');
      return;
    }

    setSetupLoading(true);
    try {
      await api.post('/api/v1/locks', {
        noteId,
        pin: parseInt(newPin),
        lockType: 'PIN',
      });

      toast.success('✅ Note locked with PIN');
      setIsLocked(true);
      setShowPinSetup(false);
      setNewPin('');
      setConfirmPin('');
      onLockStatusChange?.(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to lock note');
    } finally {
      setSetupLoading(false);
    }
  };

  const handleRemoveLock = async () => {
    if (!window.confirm('Remove lock from this note?')) return;

    setLoading(true);
    try {
      await api.delete(`/api/v1/locks/${noteId}`, { data: {} });
      toast.success('✅ Lock removed');
      setIsLocked(false);
      onLockStatusChange?.(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove lock');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeLock = async () => {
    if (newPin.length !== 4 || confirmPin.length !== 4) {
      toast.error('PIN must be 4 digits');
      return;
    }

    if (newPin !== confirmPin) {
      toast.error('PINs do not match');
      return;
    }

    setSetupLoading(true);
    try {
      await api.patch(`/api/v1/locks/${noteId}`, {
        pin: parseInt(newPin),
      });

      toast.success('✅ PIN updated');
      setShowPinSetup(false);
      setNewPin('');
      setConfirmPin('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update PIN');
    } finally {
      setSetupLoading(false);
    }
  };

  if (loading) {
    return <Loader2 className="w-4 h-4 animate-spin" />;
  }

  return (
    <div className="space-y-4">
      {/* Current Status */}
      <div className="bg-base-200 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isLocked ? (
            <>
              <Lock className="w-5 h-5 text-warning" />
              <div>
                <p className="font-medium">🔒 Locked</p>
                <p className="text-xs text-base-content/60">{lockType} Protection</p>
              </div>
            </>
          ) : (
            <>
              <Unlock className="w-5 h-5 text-success" />
              <div>
                <p className="font-medium">🔓 Unlocked</p>
                <p className="text-xs text-base-content/60">No protection</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Setup/Change Lock */}
      {showPinSetup ? (
        <div className="bg-base-200 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Lock className="w-4 h-4" />
            {isLocked ? 'Change PIN' : 'Create PIN Lock'}
          </h4>

          <input
            type="password"
            inputMode="numeric"
            placeholder="Enter 4-digit PIN"
            className="input input-bordered w-full text-center text-2xl tracking-widest font-mono focus:input-primary"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            maxLength="4"
            disabled={setupLoading}
          />

          <input
            type="password"
            inputMode="numeric"
            placeholder="Confirm PIN"
            className="input input-bordered w-full text-center text-2xl tracking-widest font-mono focus:input-primary"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            maxLength="4"
            disabled={setupLoading}
          />

          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowPinSetup(false);
                setNewPin('');
                setConfirmPin('');
              }}
              disabled={setupLoading}
              className="btn btn-ghost btn-sm flex-1"
            >
              Cancel
            </button>
            <button
              onClick={isLocked ? handleChangeLock : handleCreateLock}
              disabled={setupLoading || newPin.length !== 4}
              className="btn btn-primary btn-sm flex-1 gap-2"
            >
              {setupLoading && <Loader2 className="w-3 h-3 animate-spin" />}
              {isLocked ? 'Update PIN' : 'Create Lock'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          {!isLocked ? (
            <button
              onClick={() => setShowPinSetup(true)}
              className="btn btn-outline btn-sm flex-1 gap-2"
            >
              <Lock className="w-4 h-4" />
              Add PIN Lock
            </button>
          ) : (
            <>
              <button
                onClick={() => setShowPinSetup(true)}
                className="btn btn-outline btn-sm flex-1 gap-2"
              >
                <Lock className="w-4 h-4" />
                Change PIN
              </button>
              <button
                onClick={handleRemoveLock}
                className="btn btn-error btn-sm gap-2"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )}

      {/* Info */}
      <p className="text-xs text-base-content/50">
        💡 PIN-protected notes require verification before opening. Use a secure 4-digit PIN.
      </p>
    </div>
  );
};

export default NoteLockSettings;
