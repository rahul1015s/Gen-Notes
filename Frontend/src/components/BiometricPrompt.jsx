import React, { useState, useEffect } from 'react';
import { Fingerprint, X, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  authenticateBiometric,
  isPlatformAuthenticatorAvailable,
} from '@/lib/webauthn';

/**
 * BiometricPrompt Component
 * Shows biometric unlock option when app loads
 * Displays fallback option to use password
 */
const BiometricPrompt = ({ userId, onSuccess, onCancel, isDark = true }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if biometric is available
    const checkSupport = async () => {
      const supported = await isPlatformAuthenticatorAvailable();
      setIsSupported(supported);
    };
    
    checkSupport();
  }, []);

  const handleBiometricAuth = async () => {
    setIsLoading(true);
    setError(null);

    const result = await authenticateBiometric(userId);

    if (result.success) {
      toast.success(result.message);
      onSuccess(result.token, result.user);
    } else {
      setError(result.error);
      toast.error(result.error);
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return null; // Don't show if biometric not available
  }

  return (
    <div className={cn(
      'fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm',
      isDark ? 'bg-black/50' : 'bg-black/30'
    )}>
      <div className={cn(
        'rounded-2xl p-6 w-full max-w-sm mx-4 border',
        isDark
          ? 'bg-slate-800 border-slate-700'
          : 'bg-white border-slate-200'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className={cn(
            'text-xl font-bold',
            isDark ? 'text-white' : 'text-slate-900'
          )}>
            Unlock GenNotes
          </h2>
          <button
            onClick={onCancel}
            className={cn(
              'p-2 rounded-lg transition-colors',
              isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
            )}
          >
            <X size={20} />
          </button>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center',
            isDark ? 'bg-blue-600/20' : 'bg-blue-100'
          )}>
            {isLoading ? (
              <Loader size={32} className="text-blue-600 animate-spin" />
            ) : error ? (
              <AlertCircle size={32} className="text-red-500" />
            ) : (
              <Fingerprint size={32} className="text-blue-600" />
            )}
          </div>
        </div>

        {/* Status Text */}
        <div className="text-center mb-6">
          <p className={cn(
            'font-medium mb-2',
            isDark ? 'text-white' : 'text-slate-900'
          )}>
            {isLoading
              ? 'Place your finger or face...'
              : error
              ? 'Authentication Failed'
              : 'Use Fingerprint or Face ID'}
          </p>
          {error && (
            <p className={cn(
              'text-sm',
              isDark ? 'text-slate-400' : 'text-slate-600'
            )}>
              {error}
            </p>
          )}
          {!isLoading && !error && (
            <p className={cn(
              'text-sm',
              isDark ? 'text-slate-400' : 'text-slate-600'
            )}>
              Quick and secure unlock
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleBiometricAuth}
            disabled={isLoading}
            className={cn(
              'w-full py-3 rounded-lg font-medium transition-colors',
              isLoading
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer',
              isDark
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            )}
          >
            {isLoading ? 'Authenticating...' : 'Use Biometric'}
          </button>

          <button
            onClick={onCancel}
            disabled={isLoading}
            className={cn(
              'w-full py-3 rounded-lg font-medium transition-colors',
              isDark
                ? 'bg-slate-700 hover:bg-slate-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
            )}
          >
            Use Password Instead
          </button>
        </div>

        {/* Footer */}
        <p className={cn(
          'text-xs text-center mt-4',
          isDark ? 'text-slate-500' : 'text-slate-600'
        )}>
          Your biometric data stays on your device
        </p>
      </div>
    </div>
  );
};

export default BiometricPrompt;
