// Journal Service
import api from "../lib/axios";

class JournalService {
  /**
   * Get or create today's journal entry
   */
  async getTodayJournal() {
    try {
      const response = await api.get("/api/v1/journal/today");
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // No entry for today
      }
      throw error.response?.data?.message || "Failed to fetch journal";
    }
  }

  /**
   * Create or update morning entry
   */
  async saveMorningEntry(content) {
    try {
      const response = await api.post("/api/v1/journal/morning", { content });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to save morning entry";
    }
  }

  /**
   * Create or update evening entry
   */
  async saveEveningEntry(content) {
    try {
      const response = await api.post("/api/v1/journal/evening", { content });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to save evening entry";
    }
  }

  /**
   * Get journal entries for date range
   */
  async getJournalEntries(startDate, endDate) {
    try {
      const response = await api.get("/api/v1/journal/entries", {
        params: { startDate, endDate },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch journal entries";
    }
  }

  /**
   * Get templates available for journal
   */
  async getTemplates() {
    try {
      const response = await api.get("/api/v1/journal/templates");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch templates";
    }
  }

  /**
   * Get default morning template
   */
  getMorningTemplate() {
    return `
<h2>Good Morning! ☀️</h2>
<p><strong>Today's Goals:</strong></p>
<ul>
  <li>Goal 1</li>
  <li>Goal 2</li>
  <li>Goal 3</li>
</ul>
<p><strong>Gratitude (3 things I'm grateful for):</strong></p>
<ol>
  <li></li>
  <li></li>
  <li></li>
</ol>
    `;
  }

  /**
   * Get default evening template
   */
  getEveningTemplate() {
    return `
<h2>Evening Reflection 🌙</h2>
<p><strong>Today's Accomplishments:</strong></p>
<ul>
  <li></li>
  <li></li>
  <li></li>
</ul>
<p><strong>What I learned today:</strong></p>
<p></p>
<p><strong>How I felt today:</strong></p>
<p></p>
<p><strong>Tomorrow's intentions:</strong></p>
<p></p>
    `;
  }

  /**
   * Check if user has already created a journal entry today
   */
  async hasJournalForToday() {
    try {
      const journal = await this.getTodayJournal();
      return !!journal;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get streak (consecutive days with journal entries)
   */
  getStreak(journals) {
    if (!journals || journals.length === 0) return 0;

    let streak = 1;
    const sorted = journals.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    for (let i = 0; i < sorted.length - 1; i++) {
      const curr = new Date(sorted[i].createdAt);
      const next = new Date(sorted[i + 1].createdAt);

      const diffDays = Math.floor((curr - next) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }
}

export default new JournalService();
