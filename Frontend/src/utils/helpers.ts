// Debounce utility for search
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Throttle utility
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastFunc: ReturnType<typeof setTimeout>;
  let lastRan: number;

  return (...args: Parameters<T>) => {
    if (!lastRan) {
      func(...args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

// Highlight text in HTML content
export function highlightMatches(
  text: string,
  query: string,
  className: string = "bg-yellow-300"
): string {
  if (!query.trim()) return text;

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  return text.replace(regex, `<mark class="${className}">$1</mark>`);
}

// Extract text from HTML
export function extractTextFromHTML(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

// Calculate relevance score for search results
export function calculateRelevance(
  query: string,
  titleMatches: number,
  contentMatches: number,
  tagMatches: number
): number {
  return titleMatches * 3 + contentMatches * 1 + tagMatches * 2;
}

// Format date for display
export function formatDateShort(date: string | Date): string {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Generate random color for tags
export function getRandomTagColor(): string {
  const colors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8",
    "#F7DC6F", "#BB8FCE", "#85C1E2", "#F8B88B", "#ABE5D1",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Hash string for comparison
export async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Deep copy object
export function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Compare two objects for equality
export function isDeepEqual(obj1: any, obj2: any): boolean {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}
