// Folders Service
import api from "../lib/axios";

const FOLDER_ICONS = [
  "📁", "📂", "🗂️", "📑", "📋", "📊", "📈", "📉", "💼", "🎓",
  "🎨", "🎭", "🎪", "🎬", "🎤", "🎧", "🎮", "🎯", "🎲", "🎰",
];

class FoldersService {
  /**
   * Get all folders for user
   */
  async getAllFolders() {
    try {
      const response = await api.get("/api/v1/folders");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch folders";
    }
  }

  /**
   * Create a new folder
   */
  async createFolder(name, parentId = null, icon = null, color = null, isPrivate = false) {
    try {
      const response = await api.post("/api/v1/folders", {
        name: name.trim(),
        parentId: parentId || null,
        icon: icon || FOLDER_ICONS[0],
        color: color || "#4ECDC4",
        isPrivate: !!isPrivate,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to create folder";
    }
  }

  /**
   * Update folder
   */
  async updateFolder(folderId, updates) {
    try {
      const response = await api.put(`/api/v1/folders/${folderId}`, updates);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to update folder";
    }
  }

  /**
   * Delete folder
   */
  async deleteFolder(folderId, moveNotesTo = null) {
    try {
      await api.delete(`/api/v1/folders/${folderId}`, {
        data: { moveNotesTo },
      });
    } catch (error) {
      throw error.response?.data?.message || "Failed to delete folder";
    }
  }

  /**
   * Get folder tree (nested structure)
   */
  buildFolderTree(folders, parentId = null) {
    const children = folders.filter((f) => f.parentId === parentId);
    return children.map((folder) => ({
      ...folder,
      children: this.buildFolderTree(folders, folder._id),
    }));
  }

  /**
   * Get all available icons
   */
  getFolderIcons() {
    return FOLDER_ICONS;
  }

  /**
   * Move notes to folder
   */
  async moveNotesToFolder(noteIds, folderId) {
    try {
      await api.patch(`/api/v1/folders/${folderId}/notes`, {
        noteIds,
      });
    } catch (error) {
      throw error.response?.data?.message || "Failed to move notes";
    }
  }

  /**
   * Get notes in folder (including subfolders)
   */
  async getNotesInFolder(folderId, recursive = true) {
    try {
      const response = await api.get(`/api/v1/folders/${folderId}/notes`, {
        params: { recursive },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch folder notes";
    }
  }
}

export default new FoldersService();
export { FOLDER_ICONS };
