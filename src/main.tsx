import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles.css";
import DashboardLayout from "./App";
import AuthCallback from "./pages/AuthCallback";
import DashboardPage from "./pages/Dashboard";
import SettingsPage from "./pages/SettingsPage";
import MembersPage from "./pages/MembersPage";
import { ThemeProvider } from "@/components/ui/ThemeProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="auth/callback" element={<AuthCallback />} />
          <Route element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="chat" element={<NavigateTo url="https://chat.tirbeo.com" />} />
            <Route path="members" element={<MembersPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);

function NavigateTo({ url }: { url: string }) {
  window.location.href = url;
  return null;
}
