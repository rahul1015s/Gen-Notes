// Global Search Component with instant debounced search
import React, { useState, useCallback, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { debounce, extractTextFromHTML } from "../../utils/helpers";
import searchService from "../../services/searchService";
import "./Search.css";

/**
 * @param {Object} props
 * @param {import("../../types").Note[]} props.notes
 * @param {Function} props.onSelectNote
 * @param {Function} [props.onClose]
 */
export default function GlobalSearch({ notes, onSelectNote, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem("searchHistory");
    if (history) setSearchHistory(JSON.parse(history));
  }, []);

  // Debounced search function (200ms delay)
  const performSearch = useCallback(
    debounce((q) => {
      setIsSearching(true);
      try {
        const searchResults = searchService.searchNotes(notes, q);
        setResults(searchResults);

        // Save to search history
        if (q.trim()) {
          const updated = [
            q,
            ...searchHistory.filter((item) => item !== q),
          ].slice(0, 10);
          setSearchHistory(updated);
          localStorage.setItem("searchHistory", JSON.stringify(updated));
        }
      } finally {
        setIsSearching(false);
      }
    }, 200),
    [notes, searchHistory]
  );

  const handleSearchChange = (value) => {
    setQuery(value);
    performSearch(value);
  };

  const handleSelectResult = (note) => {
    onSelectNote(note);
    onClose?.();
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("searchHistory");
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-8">
      <div className="bg-base-100 rounded-lg shadow-2xl w-full max-w-2xl mx-4">
        {/* Search Input */}
        <div className="p-4 border-b border-base-200 relative">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-base-content/50 flex-shrink-0" />
            <input
              autoFocus
              type="text"
              placeholder="Search by title, content, tags, dates..."
              className="input input-bordered w-full input-sm"
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  onClose?.();
                }
              }}
            />
            {query && (
              <button
                className="btn btn-ghost btn-circle btn-sm"
                onClick={clearSearch}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {isSearching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          )}
        </div>

        {/* Search Results or History */}
        <div className="max-h-96 overflow-y-auto">
          {query ? (
            results.length > 0 ? (
              <div className="divide-y divide-base-200">
                {results.map(({ note, matches }) => (
                  <button
                    key={note._id}
                    className="w-full text-left p-4 hover:bg-base-200 transition"
                    onClick={() => handleSelectResult(note)}
                  >
                    <div className="font-semibold text-sm line-clamp-1">
                      {note.title}
                    </div>
                    <div className="text-xs text-base-content/60 line-clamp-2 mt-1">
                      {extractTextFromHTML(note.content)}
                    </div>
                    <div className="flex gap-1 flex-wrap mt-2">
                      {matches.map((match, idx) => (
                        <span
                          key={idx}
                          className="badge badge-xs badge-primary"
                        >
                          {match.field}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-base-content/50">
                <div className="text-sm">No results found for "{query}"</div>
              </div>
            )
          ) : (
            // Search History
            searchHistory.length > 0 && (
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-base-content/60 uppercase">
                    Recent Searches
                  </span>
                  <button
                    className="text-xs text-error hover:text-error/80"
                    onClick={clearHistory}
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((item, idx) => (
                    <button
                      key={idx}
                      className="badge badge-outline cursor-pointer hover:badge-primary"
                      onClick={() => handleSearchChange(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )
          )}
        </div>

        {/* Footer Info */}
        {results.length > 0 && (
          <div className="p-3 border-t border-base-200 text-xs text-base-content/50">
            Found {results.length} result{results.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}
