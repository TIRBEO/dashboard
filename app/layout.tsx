import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./components";
import { ToastProvider } from "./components/ToastProvider";

export const metadata: Metadata = {
  title: "Dashboard — Tirbeo",
  description: "Manage your Tirbeo account",
};

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body style={{ background: "#000" }}>
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
