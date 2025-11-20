// Tags Service
import { getRandomTagColor } from "../utils/helpers";
import api from "../lib/axios";

class TagsService {
  /**
   * Create a new tag
   */
  async createTag(name, color = null) {
    try {
      const response = await api.post("/api/v1/tags", {
        name: name.trim(),
        color: color || getRandomTagColor(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to create tag";
    }
  }

  /**
   * Update tag
   */
  async updateTag(tagId, updates) {
    try {
      const response = await api.put(`/api/v1/tags/${tagId}`, updates);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to update tag";
    }
  }

  /**
   * Delete tag
   */
  async deleteTag(tagId) {
    try {
      await api.delete(`/api/v1/tags/${tagId}`);
    } catch (error) {
      throw error.response?.data?.message || "Failed to delete tag";
    }
  }

  /**
   * Get all tags for user
   */
  async getAllTags() {
    try {
      const response = await api.get("/api/v1/tags");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch tags";
    }
  }

  /**
   * Get frequently used tags (for suggestions)
   */
  async getFrequentTags(limit = 10) {
    try {
      const response = await api.get(`/api/v1/tags/frequent?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch frequent tags";
    }
  }

  /**
   * Add tag to note
   */
  async addTagToNote(noteId, tagId) {
    try {
      await api.post(`/api/v1/notes/${noteId}/tags`, { tagId });
    } catch (error) {
      throw error.response?.data?.message || "Failed to add tag to note";
    }
  }

  /**
   * Remove tag from note
   */
  async removeTagFromNote(noteId, tagId) {
    try {
      await api.delete(`/api/v1/notes/${noteId}/tags/${tagId}`);
    } catch (error) {
      throw error.response?.data?.message || "Failed to remove tag from note";
    }
  }

  /**
   * Get tag color
   */
  getTagColor(tag) {
    return tag.color || getRandomTagColor();
  }

  /**
   * Auto-suggest tags based on input
   */
  suggestTags(input, allTags, limit = 5) {
    const inputLower = input.toLowerCase();
    return allTags
      .filter(
        (tag) =>
          tag.name.toLowerCase().includes(inputLower) &&
          tag.name.toLowerCase() !== inputLower
      )
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }
}

export default new TagsService();
