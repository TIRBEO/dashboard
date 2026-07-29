export { cn } from "./lib/utils";

// Core components
export { Button, buttonVariants } from "./components/ui/button";
export type { ButtonProps } from "./components/ui/button";

export {
  Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent,
} from "./components/ui/card";

export { Input } from "./components/ui/input";
export type { InputProps } from "./components/ui/input";

export { Badge, badgeVariants } from "./components/ui/badge";
export type { BadgeProps } from "./components/ui/badge";

export { Select } from "./components/ui/select";
export type { SelectProps } from "./components/ui/select";

export { Textarea } from "./components/ui/textarea";
export type { TextareaProps } from "./components/ui/textarea";

export { Toggle } from "./components/ui/toggle";
export type { ToggleProps } from "./components/ui/toggle";

export { Avatar } from "./components/ui/avatar";
export type { AvatarProps } from "./components/ui/avatar";

// Data display
export {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption,
} from "./components/ui/table";

export { KpiCard } from "./components/ui/kpi-card";
export type { KpiCardProps } from "./components/ui/kpi-card";

// Feedback
export { Skeleton, SkeletonCard, SkeletonTable } from "./components/ui/skeleton";
export { Toast, ToastContainer, Toaster, useToastManager } from "./components/ui/notification";
export type { ToastProps, NotificationType, ToastManager } from "./components/ui/notification";

// Dialog
export {
  DialogOverlay, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogBody, DialogFooter, DialogConfirm,
} from "./components/ui/dialog";
export type { DialogContentProps, DialogHeaderProps, DialogConfirmProps } from "./components/ui/dialog";

// Theme
export { ThemeProvider, useTheme } from "./components/theme/ThemeProvider";

// Admin Components
export { AdminShell } from "./components/admin/AdminShell";
export type { NavItem as AdminNavItem } from "./components/admin/AdminShell";
export { AdminSection } from "./components/admin/AdminSection";
export type { Tab as AdminSectionTab } from "./components/admin/AdminSection";
export { EntityPage } from "./components/admin/EntityPage";
export { DataTable } from "./components/admin/DataTable";
export type { Column as DataTableColumn } from "./components/admin/DataTable";
export { StatusBadge } from "./components/admin/StatusBadge";
export { PageToolbar } from "./components/admin/PageToolbar";
export { Breadcrumb } from "./components/admin/Breadcrumb";
