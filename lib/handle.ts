export function redirectToLogin() {
  if (typeof window !== 'undefined') {
    const accountsUrl = process.env.NEXT_PUBLIC_ACCOUNTS_URL || 'https://accounts.tirbeo.app';
    window.location.href = `${accountsUrl}/login`;
  }
}
