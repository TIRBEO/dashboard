/**
 * Input sanitization utilities for the Tirbeo dashboard.
 *
 * These are defense-in-depth measures. The API layer should also sanitize
 * inputs server-side. These helpers prevent XSS in client-rendered content.
 */

/**
 * Escape HTML special characters to prevent XSS.
 * Use when rendering user-generated content that might contain HTML.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Strip HTML tags from a string.
 * Use when displaying user content that should be plain text.
 */
export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "");
}

/**
 * Sanitize a URL to prevent javascript: and data: protocol attacks.
 * Returns the URL if safe, or undefined if dangerous.
 */
export function sanitizeUrl(url: string): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim().toLowerCase();
  if (
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("vbscript:")
  ) {
    return undefined;
  }
  return url;
}

/**
 * Validate that a string matches expected patterns.
 * Use for username, email, and other constrained inputs.
 */
export function validateUsername(username: string): boolean {
  return /^[a-zA-Z0-9]([a-zA-Z0-9-]{1,28}[a-zA-Z0-9])?$/.test(username);
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Truncate a string to a maximum length, adding ellipsis if truncated.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + "…";
}

/**
 * Sanitize a filename to prevent path traversal attacks.
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[/\\]/g, "")
    .replace(/\.\./g, "")
    .replace(/[^\w\s.-]/g, "")
    .trim();
}
