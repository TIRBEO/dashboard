"use client";
import useSWR from "swr";
import { api } from "./api";

// Generic fetcher using api.get so auth/csrf/timeout logic is reused
const fetcher = (url: string) => api.get(url);

export function useCurrentUser() {
  return useSWR("/api/users/me", fetcher, { revalidateOnFocus: true, dedupingInterval: 30000, shouldRetryOnError: false });
}
export function useNotifications(limit = 10, offset = 0) {
  return useSWR(`/api/notifications?limit=${limit}&offset=${offset}`, fetcher, { revalidateOnFocus: true, dedupingInterval: 15000 });
}
