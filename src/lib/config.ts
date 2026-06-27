const isLocal = typeof window !== "undefined" && window.location.hostname === "localhost";

export const ACCOUNTS_URL = import.meta.env.VITE_ACCOUNTS_URL
  ?? (isLocal ? "http://localhost:5174" : "https://account.tirbeo.bishnuneupane13.com.np");
