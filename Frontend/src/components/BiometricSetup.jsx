import React, { useState, useEffect } from 'react';
import { Fingerprint, Trash2, CheckCircle, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  registerBiometric,
  getBiometricCredentials,
  removeBiometricCredential,
  isPlatformAuthenticatorAvailable,
} from '@/lib/webauthn';

/**
 * BiometricSetup Component
 * Manage biometric credentials in Settings page
 */
const BiometricSetup = ({ token, isDark = true }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRemoving, setIsRemoving] = useState(null);
  const [credentials, setCredentials] = useState([]);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Check if biometric is available
      const supported = await isPlatformAuthenticatorAvailable();
      setIsSupported(supported);

      if (!token) {
        setIsLoading(false);
        return;
      }

      // Fetch enrolled credentials
      const result = await getBiometricCredentials(token);
      if (result.success) {
        setEnrolled(result.enrolled);
        setCredentials(result.credentials || []);
      }
      setIsLoading(false);
    };

    init();
  }, [token]);

  const handleRegisterBiometric = async () => {
    if (!token) {
      toast.error('Please login first');
      return;
    }

    setIsRegistering(true);
    const result = await registerBiometric(token);

    if (result.success) {
      toast.success(result.message);
      setEnrolled(true);
      // Refresh credentials list
      const credResult = await getBiometricCredentials(token);
      if (credResult.success) {
        setCredentials(credResult.credentials || []);
      }
    } else {
      toast.error(result.error);
    }
    setIsRegistering(false);
  };

  const handleRemoveCredential = async (credentialId, credIndex) => {
    setIsRemoving(credIndex);
    const result = await removeBiometricCredential(credentialId, token);

    if (result.success) {
      toast.success(result.message);
      setCredentials(credentials.filter((_, i) => i !== credIndex));
      if (result.remainingCredentials === 0) {
        setEnrolled(false);
      }
    } else {
      toast.error(result.error);
    }
    setIsRemoving(null);
  };

  if (!isSupported) {
    return (
      <div className={cn(
        'rounded-lg p-4 border',
        isDark
          ? 'bg-slate-800/50 border-yellow-700/50'
          : 'bg-yellow-50 border-yellow-200'
      )}>
        <p className={isDark ? 'text-yellow-400' : 'text-yellow-800'}>
          Biometric authentication is not available on this device
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader size={20} className="animate-spin mr-2" />
        <span>Loading biometric settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <div className={cn(
        'rounded-lg p-4 border',
        enrolled
          ? isDark
            ? 'bg-green-900/20 border-green-700/50'
            : 'bg-green-50 border-green-200'
          : isDark
          ? 'bg-slate-800/50 border-slate-700/50'
          : 'bg-slate-100 border-slate-200'
      )}>
        <div className="flex items-center gap-3">
          {enrolled ? (
            <CheckCircle className={isDark ? 'text-green-400' : 'text-green-600'} size={20} />
          ) : (
            <Fingerprint className={isDark ? 'text-slate-400' : 'text-slate-600'} size={20} />
          )}
          <div>
            <p className={cn(
              'font-medium',
              enrolled
                ? isDark ? 'text-green-400' : 'text-green-700'
                : isDark ? 'text-white' : 'text-slate-900'
            )}>
              {enrolled ? 'Biometric Unlock Enabled' : 'Enable Biometric Unlock'}
            </p>
            <p className={cn(
              'text-sm',
              isDark ? 'text-slate-400' : 'text-slate-600'
            )}>
              {enrolled
                ? 'Unlock GenNotes with your fingerprint or face'
                : 'Add biometric unlock for faster access'}
            </p>
          </div>
        </div>
      </div>

      {/* Enrolled Credentials */}
      {enrolled && credentials.length > 0 && (
        <div className="space-y-2">
          <h4 className={cn(
            'text-sm font-semibold',
            isDark ? 'text-slate-300' : 'text-slate-700'
          )}>
            Registered Devices
          </h4>
          {credentials.map((cred, idx) => (
            <div
              key={idx}
              className={cn(
                'rounded-lg p-3 border flex items-center justify-between',
                isDark
                  ? 'bg-slate-800/50 border-slate-700/50'
                  : 'bg-slate-50 border-slate-200'
              )}
            >
              <div className="flex-1">
                <p className={cn(
                  'text-sm font-medium',
                  isDark ? 'text-white' : 'text-slate-900'
                )}>
                  {cred.type || 'Biometric Device'}
                </p>
                <p className={cn(
                  'text-xs',
                  isDark ? 'text-slate-500' : 'text-slate-600'
                )}>
                  {cred.displayId || cred.id}
                  {' • '}
                  Added {new Date(cred.createdAt).toLocaleDateString()}
                  {cred.lastUsedAt && (
                    <> • Last used {new Date(cred.lastUsedAt).toLocaleDateString()}</>
                  )}
                </p>
              </div>
              <button
                onClick={() => handleRemoveCredential(cred.id, idx)}
                disabled={isRemoving === idx}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  isRemoving === idx ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                  isDark
                    ? 'hover:bg-red-900/20 text-red-400'
                    : 'hover:bg-red-50 text-red-600'
                )}
                title="Remove this biometric credential"
              >
                {isRemoving === idx ? (
                  <Loader size={18} className="animate-spin" />
                ) : (
                  <Trash2 size={18} />
                )}
              </button>
            </div>
          ))}
          
          {/* Add Another Device */}
          <button
            onClick={handleRegisterBiometric}
            disabled={isRegistering}
            className={cn(
              'w-full py-2 rounded-lg text-sm font-medium transition-colors border',
              isRegistering ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
              isDark
                ? 'border-blue-600/50 hover:bg-blue-600/10 text-blue-400'
                : 'border-blue-200 hover:bg-blue-50 text-blue-600'
            )}
          >
            {isRegistering ? 'Adding Device...' : '+ Add Another Device'}
          </button>
        </div>
      )}

      {/* Enable Button */}
      {!enrolled && (
        <button
          onClick={handleRegisterBiometric}
          disabled={isRegistering}
          className={cn(
            'w-full py-3 rounded-lg font-medium transition-colors',
            isRegistering ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
            isDark
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          )}
        >
          {isRegistering ? 'Setting up...' : 'Enable Biometric Unlock'}
        </button>
      )}

      {/* Info */}
      <p className={cn(
        'text-xs',
        isDark ? 'text-slate-500' : 'text-slate-600'
      )}>
        Your biometric data is processed on your device only. We never store your fingerprint or face data.
      </p>
    </div>
  );
};

export default BiometricSetup;
