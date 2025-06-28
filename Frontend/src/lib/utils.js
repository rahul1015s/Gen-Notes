export function formatDate(date) {
  if (!date) return 'N/A';
  const parsedDate = new Date(date);
  if (isNaN(parsedDate)) return 'Invalid Date';

  return parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}


// The error TypeError: date.toLocaleDateString is not a function means that the date you're passing to formatDate is not a valid Date object, but likely a string, null, undefined, or some other type.

// Common Cause:
// If you're getting the date from an API or database, it's probably a string, like "2025-06-28T08:53:00.000Z". Strings don't have toLocaleDateString, so you must convert it to a Date object first.