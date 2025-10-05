export function pickFields<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  return keys.reduce((acc, key) => {
    acc[key] = obj[key];
    return acc;
  }, {} as Pick<T, K>);
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

export function truncate(str: string, limit: number): string {
  if (str.length <= limit) return str;
  return str.slice(0, limit) + "...";
}

/**
 * Format date string into a human-readable form.
 * - If within 1 minute: "just now"
 * - If within 1 hour: "xx min ago"
 * - If within 24 hours: "xx hr ago"
 * - Else: formatted "HH:mm dd/MM/yy"
 */
export function formatDate(dateStr?: string | Date | null): string {
  if (!dateStr) return "—";

  const date = dateStr instanceof Date ? dateStr : new Date(dateStr);
  if (isNaN(date.getTime())) return "Invalid date";

  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000; // giây

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;

  return date.toLocaleString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

