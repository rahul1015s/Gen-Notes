// Search Service
import { Note, SearchResult } from "../types";
import {
  extractTextFromHTML,
  calculateRelevance,
  debounce,
} from "../utils/helpers";

class SearchService {
  /**
   * Search notes across title, content, and tags
   */
  searchNotes(
    notes: Note[],
    query: string,
    options = { limit: 50 }
  ): SearchResult[] {
    if (!query.trim()) return [];

    const queryLower = query.toLowerCase();
    const results: SearchResult[] = [];

    for (const note of notes) {
      const matches: SearchResult["matches"] = [];
      let relevance = 0;

      // Search in title
      const titleLower = note.title.toLowerCase();
      if (titleLower.includes(queryLower)) {
        const titleMatches = this.findMatchPositions(titleLower, queryLower);
        matches.push({
          field: "title",
          positions: titleMatches,
        });
        relevance += calculateRelevance(query, titleMatches.length, 0, 0);
      }

      // Search in content
      const contentText = extractTextFromHTML(note.content).toLowerCase();
      if (contentText.includes(queryLower)) {
        const contentMatches = this.findMatchPositions(contentText, queryLower);
        matches.push({
          field: "content",
          positions: contentMatches,
        });
        relevance += calculateRelevance(query, 0, contentMatches.length, 0);
      }

      // Search in tags
      if (note.tags?.length) {
        const tagMatches = note.tags.filter((tag) =>
          tag.toLowerCase().includes(queryLower)
        ).length;
        if (tagMatches > 0) {
          matches.push({
            field: "tags",
            positions: Array(tagMatches).fill(0),
          });
          relevance += calculateRelevance(query, 0, 0, tagMatches);
        }
      }

      if (matches.length > 0) {
        results.push({ note, matches, relevance });
      }
    }

    // Sort by relevance (highest first) and limit results
    return results
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, options.limit);
  }

  /**
   * Find all positions of query in text
   */
  private findMatchPositions(text: string, query: string): number[] {
    const positions: number[] = [];
    let startIndex = 0;

    while ((startIndex = text.indexOf(query, startIndex)) !== -1) {
      positions.push(startIndex);
      startIndex += query.length;
    }

    return positions;
  }

  /**
   * Get search suggestions based on frequently searched terms
   */
  getSearchSuggestions(history: string[], query: string, limit = 5): string[] {
    const queryLower = query.toLowerCase();
    return history
      .filter((h) => h.toLowerCase().includes(queryLower))
      .slice(0, limit);
  }

  /**
   * Debounced search function
   */
  debounceSearch = debounce((query: string, callback: (results: SearchResult[]) => void) => {
    // This will be called with debounced query
    callback([]);
  }, 200);
}

export default new SearchService();
