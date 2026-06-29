import { NavLink } from "react-router-dom";
import { LayoutDashboard, MessageSquare, Settings, Users, LogOut, ChevronLeft, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/chat", label: "Chat", icon: MessageSquare },
  { to: "/members", label: "Members", icon: Users },
  { to: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onLogout: () => void;
  displayName: string;
}

export function Sidebar({ collapsed, onToggle, onLogout, displayName }: SidebarProps) {
  return (
    <div className={cn(
      "flex flex-col border-r border-border bg-card transition-all duration-200",
      collapsed ? "w-16" : "w-56",
    )}>
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        {!collapsed && (
          <span className="font-display text-lg font-semibold tracking-tight">Tirbeo</span>
        )}
        <button onClick={onToggle} className="p-1 text-ink-soft hover:text-foreground">
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {links.map((l) => {
          const Icon = l.icon;
          return (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) => cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-foreground/10 text-foreground"
                  : "text-ink-soft hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{l.label}</span>}
            </NavLink>
          );
        })}
      </nav>
      <div className="p-2 border-t border-border">
        {!collapsed && (
          <div className="px-3 py-2 text-xs text-ink-soft truncate">{displayName}</div>
        )}
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-secondary hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
        {!collapsed && (
          <div className="px-3 py-2 mt-2 border-t border-border/50">
            <div className="flex items-center gap-2 justify-center">
              <Palette className="h-3 w-3 text-ink-soft" />
              <span className="text-xs text-ink-soft">Theme</span>
            </div>
            <ThemeToggle className="mt-1" />
          </div>
        )}
        {collapsed && (
          <div className="px-3 py-1">
            <ThemeToggle className="mx-auto" />
          </div>
        )}
      </div>
    </div>
  );
}
