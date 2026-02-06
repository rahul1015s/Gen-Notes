import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import {
  generateBiometricRegistrationOptions,
  verifyBiometricRegistration,
  generateBiometricAuthenticationOptions,
  verifyBiometricAuthentication,
  hasBiometricCredentials,
  getBiometricCredentials,
} from "../services/webauthn.service.js";

/**
 * Get RP ID and Origin from request
 */
const getRPConfig = (req) => {
  // In production, use environment variables
  // For now, derive from request host
  const host = req.get('host') || process.env.RP_ID || 'localhost';
  const rpId = host.split(':')[0]; // Remove port
  const origin = `${req.protocol}://${host}`;
  
  return { rpId, origin, rpName: 'GenNotes' };
};

/**
 * POST /auth/webauthn/register-options
 * Generate registration options for biometric enrollment
 */
export const getRegistrationOptions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    const { rpId, origin, rpName } = getRPConfig(req);

    const result = await generateBiometricRegistrationOptions(
      user,
      rpId,
      rpName,
      origin
    );

    res.status(200).json({
      success: true,
      data: result.options,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /auth/webauthn/register-verify
 * Verify biometric registration and store credential
 */
export const verifyRegistration = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { registrationResponse } = req.body;

    if (!registrationResponse) {
      const error = new Error('Registration response is required');
      error.status = 400;
      throw error;
    }

    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    const { rpId, origin } = getRPConfig(req);

    // Verify the registration response
    const verification = await verifyBiometricRegistration(
      user,
      registrationResponse,
      rpId,
      origin
    );

    if (!verification.success) {
      const error = new Error('Biometric registration failed');
      error.status = 400;
      throw error;
    }

    // Store the credential in the user's biometric credentials
    const { credential } = verification;
    
    // Initialize biometricCredentials if not exists
    if (!user.biometricCredentials) {
      user.biometricCredentials = [];
    }

    // Check if credential already exists (update instead of duplicate)
    const existingIndex = user.biometricCredentials.findIndex(
      (cred) => cred.credentialID === credential.credentialID
    );

    if (existingIndex >= 0) {
      // Update existing credential
      user.biometricCredentials[existingIndex] = {
        ...user.biometricCredentials[existingIndex],
        ...credential,
      };
    } else {
      // Add new credential
      user.biometricCredentials.push(credential);
    }

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Biometric credential registered successfully',
      data: {
        credentialCount: user.biometricCredentials.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /auth/webauthn/auth-options
 * Generate authentication options for biometric unlock
 */
export const getAuthenticationOptions = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      const error = new Error('User ID is required');
      error.status = 400;
      throw error;
    }

    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    // Check if user has biometric credentials
    if (!hasBiometricCredentials(user)) {
      const error = new Error('User has no biometric credentials enrolled');
      error.status = 400;
      throw error;
    }

    const { rpId } = getRPConfig(req);
    const credentials = getBiometricCredentials(user);

    const result = await generateBiometricAuthenticationOptions(
      user,
      credentials,
      rpId
    );

    res.status(200).json({
      success: true,
      data: result.options,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /auth/webauthn/auth-verify
 * Verify biometric authentication response
 */
export const verifyAuthentication = async (req, res, next) => {
  try {
    const { userId, authResponse } = req.body;

    if (!userId || !authResponse) {
      const error = new Error('User ID and authentication response are required');
      error.status = 400;
      throw error;
    }

    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    if (!hasBiometricCredentials(user)) {
      const error = new Error('User has no biometric credentials enrolled');
      error.status = 400;
      throw error;
    }

    const { rpId, origin } = getRPConfig(req);
    const credentials = getBiometricCredentials(user);

    // Find the credential used for this authentication
    const normalizeId = (id) => {
      try {
        return Buffer.from(id, 'base64url').toString('base64');
      } catch (e) {
        try {
          return Buffer.from(id, 'base64').toString('base64');
        } catch (err) {
          return null;
        }
      }
    };

    const credentialId = authResponse.id;
    const normalizedId = normalizeId(credentialId);
    const storedCredential = credentials.find(
      (cred) => normalizedId && cred.credentialID === normalizedId
    );

    if (!storedCredential) {
      const error = new Error('Credential not found');
      error.status = 404;
      throw error;
    }

    // Verify the authentication response
    const verification = await verifyBiometricAuthentication(
      user,
      authResponse,
      rpId,
      origin,
      storedCredential
    );

    if (!verification.success) {
      const error = new Error('Biometric authentication failed');
      error.status = 401;
      throw error;
    }

    // Update the counter and last used time
    const credIndex = user.biometricCredentials.findIndex(
      (cred) => cred.credentialID === storedCredential.credentialID
    );
    if (credIndex >= 0) {
      user.biometricCredentials[credIndex].counter = verification.newCounter;
      user.biometricCredentials[credIndex].lastUsedAt = new Date();
      await user.save();
    }

    // Generate JWT token for authenticated session
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Biometric authentication successful',
      data: {
        token,
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /auth/webauthn/credentials
 * Get user's enrolled biometric credentials
 */
export const getBiometricCredentialsForUser = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    const credentials = user.biometricCredentials || [];
    const credentialList = credentials.map((cred) => ({
      id: cred.credentialID,
      displayId: cred.credentialID.substring(0, 12) + '...', // Masked ID for display
      type: cred.credentialDeviceType || 'unknown',
      backedUp: cred.credentialBackedUp,
      createdAt: cred.createdAt,
      lastUsedAt: cred.lastUsedAt,
    }));

    res.status(200).json({
      success: true,
      data: {
        enrolled: credentials.length > 0,
        credentials: credentialList,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /auth/webauthn/credentials/:credentialId
 * Remove a biometric credential
 */
export const removeBiometricCredential = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { credentialId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    // Find and remove the credential
    const initialCount = user.biometricCredentials.length;
    user.biometricCredentials = user.biometricCredentials.filter(
      (cred) => cred.credentialID !== credentialId
    );

    if (user.biometricCredentials.length === initialCount) {
      const error = new Error('Credential not found');
      error.status = 404;
      throw error;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Biometric credential removed successfully',
      data: {
        remainingCredentials: user.biometricCredentials.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate JWT token (use your existing auth token function)
 */
const generateToken = (userId) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: '7d',
  });
};
