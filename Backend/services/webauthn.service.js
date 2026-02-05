import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';

/**
 * WebAuthn Service - Handles biometric registration and authentication
 * Uses @simplewebauthn for secure WebAuthn operations
 */

// In-memory store for registration/authentication challenges
// In production, store in Redis or database with TTL
const challengeStore = new Map();
const CHALLENGE_TIMEOUT = 10 * 60 * 1000; // 10 minutes

/**
 * Store challenge temporarily for verification
 */
export const storeChallenge = (userId, challenge, type = 'registration') => {
  const key = `${type}_${userId}`;
  challengeStore.set(key, {
    challenge,
    timestamp: Date.now(),
    type
  });
  
  // Auto-cleanup after timeout
  setTimeout(() => challengeStore.delete(key), CHALLENGE_TIMEOUT);
};

/**
 * Retrieve and clear challenge
 */
export const getChallenge = (userId, type = 'registration') => {
  const key = `${type}_${userId}`;
  const data = challengeStore.get(key);
  challengeStore.delete(key); // Clear after retrieval
  return data;
};

/**
 * Generate registration options for biometric enrollment
 */
export const generateBiometricRegistrationOptions = async (user, rpId, rpName, origin) => {
  try {
    const options = generateRegistrationOptions({
      rpName: rpName || 'GenNotes',
      rpID: rpId,
      userID: user._id.toString(),
      userName: user.email,
      userDisplayName: user.name || user.email,
      timeout: 60000, // 60 seconds
      attestationType: 'none',
      authenticatorSelection: {
        authenticatorAttachment: 'platform', // Use platform authenticator (device's biometric)
        residentKey: 'preferred',
        userVerification: 'required', // Require biometric/PIN verification
      },
      // Only support resident keys (biometric)
      supportedAlgorithmIDs: [-7, -257], // ES256, RS256
    });

    // Store challenge for later verification
    storeChallenge(user._id.toString(), options.challenge, 'registration');

    return {
      success: true,
      options,
    };
  } catch (error) {
    console.error('Error generating registration options:', error);
    throw error;
  }
};

/**
 * Verify biometric registration response
 */
export const verifyBiometricRegistration = async (user, registrationResponse, rpId, origin) => {
  try {
    // Get the challenge we stored earlier
    const challengeData = getChallenge(user._id.toString(), 'registration');
    if (!challengeData) {
      throw new Error('Challenge expired or not found. Please try again.');
    }

    // Verify the registration response
    const verification = verifyRegistrationResponse({
      response: registrationResponse,
      expectedChallenge: challengeData.challenge,
      expectedOrigin: origin,
      expectedRPID: rpId,
    });

    if (!verification.verified || !verification.registrationInfo) {
      throw new Error('Biometric registration verification failed');
    }

    const { registrationInfo } = verification;
    const { credentialPublicKey, credentialID, counter } = registrationInfo;

    return {
      success: true,
      credential: {
        credentialID: Buffer.from(credentialID).toString('base64'),
        publicKey: Buffer.from(credentialPublicKey).toString('base64'),
        counter: counter,
        credentialDeviceType: registrationInfo.credentialDeviceType,
        credentialBackedUp: registrationInfo.credentialBackedUp,
      },
    };
  } catch (error) {
    console.error('Error verifying registration:', error);
    throw error;
  }
};

/**
 * Generate authentication options for biometric unlock
 */
export const generateBiometricAuthenticationOptions = async (user, credentials, rpId) => {
  try {
    // Convert stored credentials back to their original format
    const allowCredentials = credentials.map((cred) => ({
      id: Buffer.from(cred.credentialID, 'base64'),
      type: 'public-key',
      transports: ['internal'], // Biometric is always internal
    }));

    const options = generateAuthenticationOptions({
      rpID: rpId,
      timeout: 60000, // 60 seconds
      userVerification: 'required',
      allowCredentials: allowCredentials.length > 0 ? allowCredentials : undefined,
    });

    // Store challenge for verification
    storeChallenge(user._id.toString(), options.challenge, 'authentication');

    return {
      success: true,
      options,
    };
  } catch (error) {
    console.error('Error generating authentication options:', error);
    throw error;
  }
};

/**
 * Verify biometric authentication response
 */
export const verifyBiometricAuthentication = async (user, authResponse, rpId, origin, storedCredential) => {
  try {
    const challengeData = getChallenge(user._id.toString(), 'authentication');
    if (!challengeData) {
      throw new Error('Challenge expired or not found. Please try again.');
    }

    // Reconstruct the public key from stored base64
    const publicKey = Buffer.from(storedCredential.publicKey, 'base64');

    // Verify the authentication response
    const verification = verifyAuthenticationResponse({
      response: authResponse,
      expectedChallenge: challengeData.challenge,
      expectedOrigin: origin,
      expectedRPID: rpId,
      credential: {
        id: Buffer.from(storedCredential.credentialID, 'base64'),
        publicKey: publicKey,
        counter: storedCredential.counter,
        transports: ['internal'],
      },
    });

    if (!verification.verified) {
      throw new Error('Biometric authentication verification failed');
    }

    const { authenticationInfo } = verification;
    
    // Check for cloned credentials (counter must increase)
    if (authenticationInfo.newCounter <= storedCredential.counter) {
      console.warn('Potential cloned credential detected for user:', user._id);
      throw new Error('Credential appears to be cloned. Please contact support.');
    }

    return {
      success: true,
      newCounter: authenticationInfo.newCounter,
      signCount: authenticationInfo.newCounter,
    };
  } catch (error) {
    console.error('Error verifying authentication:', error);
    throw error;
  }
};

/**
 * Check if user has biometric credentials enrolled
 */
export const hasBiometricCredentials = (user) => {
  return user.biometricCredentials && user.biometricCredentials.length > 0;
};

/**
 * Get all biometric credentials for a user
 */
export const getBiometricCredentials = (user) => {
  return user.biometricCredentials || [];
};
