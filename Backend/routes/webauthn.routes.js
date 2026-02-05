import { Router } from 'express';
import authorize from '../middlewares/auth.middleware.js';
import {
  getRegistrationOptions,
  verifyRegistration,
  getAuthenticationOptions,
  verifyAuthentication,
  getBiometricCredentialsForUser,
  removeBiometricCredential,
} from '../controllers/webauthn.controller.js';

const webauthnRouter = Router();

/**
 * Biometric Registration Routes
 */

// Get registration options (requires auth)
webauthnRouter.post(
  '/register-options',
  authorize,
  getRegistrationOptions
);

// Verify registration and store credential (requires auth)
webauthnRouter.post(
  '/register-verify',
  authorize,
  verifyRegistration
);

/**
 * Biometric Authentication Routes
 */

// Get authentication options (does NOT require auth - used before login)
webauthnRouter.post(
  '/auth-options',
  getAuthenticationOptions
);

// Verify authentication and return token (does NOT require auth)
webauthnRouter.post(
  '/auth-verify',
  verifyAuthentication
);

/**
 * Credential Management Routes
 */

// Get user's enrolled credentials (requires auth)
webauthnRouter.get(
  '/credentials',
  authorize,
  getBiometricCredentialsForUser
);

// Remove a credential (requires auth)
webauthnRouter.delete(
  '/credentials/:credentialId',
  authorize,
  removeBiometricCredential
);

export default webauthnRouter;
