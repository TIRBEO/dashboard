"use client";
// Backward-compat re-export — now backed by shared context to avoid N duplicate GET /users/me
export { useScheduledDeletion } from "@/lib/deletion-context";
