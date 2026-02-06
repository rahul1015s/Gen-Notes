import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import api from './axios';

/**
 * WebAuthn Browser Utilities
 * Handles biometric registration and authentication on the frontend
 */

/**
 * Check if the browser supports WebAuthn
 */
export const isWebAuthnSupported = () => {
  return (
    window.PublicKeyCredential !== undefined &&
    navigator.credentials !== undefined
  );
};

/**
 * Check if platform authenticator (biometric) is available
 */
export const isPlatformAuthenticatorAvailable = async () => {
  if (!isWebAuthnSupported()) {
    return false;
  }
  
  try {
    const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    return available;
  } catch (error) {
    console.error('Error checking platform authenticator availability:', error);
    return false;
  }
};

/**
 * Register a new biometric credential
 * Should be called after successful login
 */
export const registerBiometric = async (token) => {
  try {
    // Check support
    const supported = await isPlatformAuthenticatorAvailable();
    if (!supported) {
      throw new Error('Biometric authentication not available on this device');
    }

    // Step 1: Get registration options from backend
    console.log('Fetching registration options...');
    const optionsResponse = await api.post('/api/v1/auth/webauthn/register-options', null, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!optionsResponse.data?.success) {
      throw new Error('Failed to get registration options');
    }

    const options = optionsResponse.data.data;

    // Step 2: Start registration (shows biometric prompt)
    console.log('Starting registration with options:', options);
    const registrationResponse = await startRegistration(options);
    console.log('Registration response received:', registrationResponse);

    // Step 3: Verify registration on backend
    const verifyResponse = await api.post(
      '/api/v1/auth/webauthn/register-verify',
      { registrationResponse },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!verifyResponse.data?.success) {
      throw new Error('Failed to verify registration');
    }

    console.log('Biometric registration successful');
    return {
      success: true,
      message: 'Fingerprint/Face ID has been enabled',
      credentialCount: verifyResponse.data.data?.credentialCount || 1,
    };
  } catch (error) {
    console.error('Biometric registration error:', error);
    
    // Parse error messages
    let message = error.message || 'Biometric registration failed';
    
    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message.includes('NotAllowedError')) {
      message = 'Registration was cancelled';
    } else if (error.message.includes('NotSupportedError')) {
      message = 'Biometric authentication not supported on this device';
    }
    
    return {
      success: false,
      error: message,
    };
  }
};

/**
 * Authenticate user with biometric
 * Called when app loads and user hasn't logged in yet
 */
export const authenticateBiometric = async (userId) => {
  try {
    // Check support
    const supported = await isPlatformAuthenticatorAvailable();
    if (!supported) {
      throw new Error('Biometric authentication not available on this device');
    }

    // Step 1: Get authentication options from backend
    console.log('Fetching authentication options...');
    const optionsResponse = await api.post(
      '/api/v1/auth/webauthn/auth-options',
      { userId }
    );

    if (!optionsResponse.data?.success) {
      throw new Error(optionsResponse.data?.message || 'Failed to get authentication options');
    }

    const options = optionsResponse.data.data;

    // Step 2: Start authentication (shows biometric prompt)
    console.log('Starting authentication...');
    const authResponse = await startAuthentication(options);
    console.log('Authentication response received');

    // Step 3: Verify authentication on backend
    const verifyResponse = await api.post(
      '/api/v1/auth/webauthn/auth-verify',
      { userId, authResponse }
    );

    if (!verifyResponse.data?.success) {
      throw new Error('Failed to verify authentication');
    }

    const { token, user } = verifyResponse.data.data;

    console.log('Biometric authentication successful');
    return {
      success: true,
      token,
      user,
      message: 'Unlocked with fingerprint/Face ID',
    };
  } catch (error) {
    console.error('Biometric authentication error:', error);
    
    // Parse error messages
    let message = error.message || 'Biometric authentication failed';
    
    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message.includes('NotAllowedError')) {
      message = 'Authentication was cancelled or biometric not recognized';
    } else if (error.message.includes('NotSupportedError')) {
      message = 'Biometric authentication not supported on this device';
    } else if (error.message.includes('no biometric credentials')) {
      message = 'No biometric credentials enrolled. Please use password instead.';
    }
    
    return {
      success: false,
      error: message,
    };
  }
};

/**
 * Get user's enrolled biometric credentials
 */
export const getBiometricCredentials = async (token) => {
  try {
    const response = await api.get('/api/v1/auth/webauthn/credentials', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.data?.success) {
      throw new Error('Failed to fetch credentials');
    }

    return {
      success: true,
      enrolled: response.data.data?.enrolled || false,
      credentials: response.data.data?.credentials || [],
    };
  } catch (error) {
    console.error('Error fetching credentials:', error);
    return {
      success: false,
      enrolled: false,
      credentials: [],
      error: error.message,
    };
  }
};

/**
 * Remove a biometric credential
 */
export const removeBiometricCredential = async (credentialId, token) => {
  try {
    const response = await api.delete(
      `/api/v1/auth/webauthn/credentials/${credentialId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!response.data?.success) {
      throw new Error('Failed to remove credential');
    }

    return {
      success: true,
      message: response.data.message,
      remainingCredentials: response.data.data?.remainingCredentials || 0,
    };
  } catch (error) {
    console.error('Error removing credential:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};
