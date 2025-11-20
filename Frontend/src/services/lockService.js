// Lock Notes Service
import api from "../lib/axios";
import { hashString } from "../utils/helpers";

class LockService {
  /**
   * Lock a note with PIN
   */
  async lockNoteWithPIN(noteId, pin) {
    try {
      const pinHash = await hashString(pin);
      const response = await api.post(`/api/v1/notes/${noteId}/lock`, {
        type: "pin",
        pinHash,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to lock note";
    }
  }

  /**
   * Verify PIN for a locked note
   */
  async verifyPIN(noteId, pin) {
    try {
      const pinHash = await hashString(pin);
      const response = await api.post(`/api/v1/notes/${noteId}/unlock`, {
        pinHash,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Invalid PIN";
    }
  }

  /**
   * Unlock a note
   */
  async unlockNote(noteId) {
    try {
      await api.delete(`/api/v1/notes/${noteId}/lock`);
    } catch (error) {
      throw error.response?.data?.message || "Failed to unlock note";
    }
  }

  /**
   * Enable fingerprint lock (if device supports)
   */
  async enableFingerprintLock(noteId) {
    try {
      if (!window.PublicKeyCredential) {
        throw new Error("Fingerprint not supported on this device");
      }

      const response = await api.post(`/api/v1/notes/${noteId}/lock`, {
        type: "fingerprint",
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to enable fingerprint lock";
    }
  }

  /**
   * Verify fingerprint (using WebAuthn)
   */
  async verifyFingerprint(noteId) {
    try {
      if (!window.PublicKeyCredential) {
        throw new Error("Fingerprint not supported on this device");
      }

      // This is a simplified example - full WebAuthn implementation would be more complex
      const response = await api.post(`/api/v1/notes/${noteId}/unlock`, {
        type: "fingerprint",
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Fingerprint verification failed";
    }
  }

  /**
   * Get lock status for a note
   */
  async getLockStatus(noteId) {
    try {
      const response = await api.get(`/api/v1/notes/${noteId}/lock`);
      return response.data;
    } catch (error) {
      return null; // No lock
    }
  }

  /**
   * Check if device supports biometric auth
   */
  async isBiometricAvailable() {
    if (!window.PublicKeyCredential) {
      return false;
    }

    try {
      const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return available;
    } catch (error) {
      return false;
    }
  }

  /**
   * Store unlocked note session (in sessionStorage)
   */
  setUnlockedNote(noteId) {
    const unlockedNotes = this.getUnlockedNotes();
    if (!unlockedNotes.includes(noteId)) {
      unlockedNotes.push(noteId);
      sessionStorage.setItem("unlockedNotes", JSON.stringify(unlockedNotes));
    }
  }

  /**
   * Get unlocked notes from session
   */
  getUnlockedNotes() {
    const data = sessionStorage.getItem("unlockedNotes");
    return data ? JSON.parse(data) : [];
  }

  /**
   * Check if note is unlocked in this session
   */
  isNoteUnlocked(noteId) {
    return this.getUnlockedNotes().includes(noteId);
  }

  /**
   * Clear unlocked note from session
   */
  clearUnlockedNote(noteId) {
    const unlockedNotes = this.getUnlockedNotes().filter((id) => id !== noteId);
    sessionStorage.setItem("unlockedNotes", JSON.stringify(unlockedNotes));
  }

  /**
   * Clear all unlocked notes (on logout)
   */
  clearAllUnlockedNotes() {
    sessionStorage.removeItem("unlockedNotes");
  }
}

export default new LockService();
