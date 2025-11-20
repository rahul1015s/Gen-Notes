// Pin Notes Service
import api from "../lib/axios";

class PinService {
  /**
   * Toggle pin status of a note
   */
  async togglePin(noteId) {
    try {
      const response = await api.patch(`/api/v1/notes/${noteId}/pin`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to toggle pin";
    }
  }

  /**
   * Pin a note
   */
  async pinNote(noteId) {
    try {
      const response = await api.post(`/api/v1/notes/${noteId}/pin`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to pin note";
    }
  }

  /**
   * Unpin a note
   */
  async unpinNote(noteId) {
    try {
      const response = await api.delete(`/api/v1/notes/${noteId}/pin`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to unpin note";
    }
  }

  /**
   * Get pinned notes (max 3 at top)
   */
  getPinnedNotes(notes) {
    return notes
      .filter((note) => note.isPinned)
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, 3);
  }

  /**
   * Get non-pinned notes
   */
  getUnpinnedNotes(notes) {
    return notes.filter((note) => !note.isPinned);
  }

  /**
   * Reorder pinned notes
   */
  reorderPinnedNotes(pinnedNotes, fromIndex, toIndex) {
    const items = [...pinnedNotes];
    const [movedItem] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, movedItem);
    return items;
  }
}

export default new PinService();
