export function redirectToLogin() {
  if (typeof window !== 'undefined') {
    const accountsUrl = process.env.NEXT_PUBLIC_ACCOUNTS_URL || 'http://localhost:3002';
    window.location.href = `${accountsUrl}/login`;
  }
}
