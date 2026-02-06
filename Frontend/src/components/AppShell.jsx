import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BiometricPrompt from './BiometricPrompt';
import { isPlatformAuthenticatorAvailable } from '@/lib/webauthn';
import api from '@/lib/axios';
import AppLockScreen from './AppLockScreen';
import offlineSyncService from '../services/offlineSyncService.js';
import { registerPeriodicSync, registerOneOffSync } from '../services/backgroundSync.js';
import { ensurePushSubscription } from '../services/pushService.js';

/**
 * AppShell Component
 * Handles app-level logic including biometric unlock on load
 * Wraps the main app content
 */
const AppShell = ({ children, isDark }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);
  const [pendingUserId, setPendingUserId] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showAppLock, setShowAppLock] = useState(false);
  const [appLockMethod, setAppLockMethod] = useState('pin');

  useEffect(() => {
    const initializeApp = async () => {
      const token = localStorage.getItem('token');
      
      // If user is logged in, check app lock
      if (token) {
        offlineSyncService.setAuthToken(token).catch(() => {});
        if (localStorage.getItem('bgSyncEnabled') === 'true') {
          ensurePushSubscription().catch(() => {});
          registerPeriodicSync('daily-sync', 24 * 60 * 60 * 1000).catch(() => {});
          registerOneOffSync('notes-sync').catch(() => {});
        }
        try {
          const res = await api.get('/api/v1/users/app-lock');
          const enabled = res.data?.appLock?.enabled;
          const method = res.data?.appLock?.method || 'pin';
          if (enabled && !sessionStorage.getItem('appUnlocked')) {
            setAppLockMethod(method);
            setShowAppLock(true);
          }
        } catch (err) {}
        setIsCheckingAuth(false);
        return;
      }

      // Check if we're on an auth page
      const authPages = ['/log-in', '/sign-up', '/forgot-password', '/verify-otp'];
      const isAuthPage = authPages.some(page => location.pathname.startsWith(page));
      
      if (isAuthPage) {
        setIsCheckingAuth(false);
        return;
      }

      // Check if biometric is available and user has credentials enrolled
      const isBiometricAvailable = await isPlatformAuthenticatorAvailable();
      
      if (isBiometricAvailable) {
        // Try to get stored userId from last login attempt
        const lastUserEmail = localStorage.getItem('lastLoginEmail');
        const lastUserId = localStorage.getItem('lastLoginUserId');
        
        if (lastUserId) {
          // Try to fetch user to verify they still exist
          try {
            const response = await api.get(`/api/v1/users/${lastUserId}`);
            if (response.data?.data?.email) {
              setPendingUserId(lastUserId);
              setShowBiometricPrompt(true);
            }
          } catch (error) {
            console.log('User no longer exists or session expired');
          }
        }
      }
      
      setIsCheckingAuth(false);
    };

    initializeApp();
  }, [location.pathname, navigate]);

  const handleBiometricSuccess = (token, user) => {
    // Store token and user data
    localStorage.setItem('token', token);
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('userName', user.name);
    localStorage.setItem('userId', user._id);
    localStorage.setItem('lastLoginUserId', user._id);
    localStorage.setItem('lastLoginEmail', user.email);
    
    setShowBiometricPrompt(false);
    
    // Redirect to dashboard
    navigate('/all-notes', { replace: true });
  };

  const handleBiometricCancel = () => {
    setShowBiometricPrompt(false);
    // Don't navigate, let user choose to login manually
  };

  const handleAppUnlock = () => {
    sessionStorage.setItem('appUnlocked', '1');
    setShowAppLock(false);
  };

  if (isCheckingAuth) {
    return null; // Or show a loading screen
  }

  return (
    <>
      {showBiometricPrompt && pendingUserId && (
        <BiometricPrompt
          userId={pendingUserId}
          onSuccess={handleBiometricSuccess}
          onCancel={handleBiometricCancel}
          isDark={isDark}
        />
      )}
      {showAppLock && (
        <AppLockScreen
          method={appLockMethod}
          onUnlocked={handleAppUnlock}
          isDark={isDark}
        />
      )}
      {children}
    </>
  );
};

export default AppShell;
