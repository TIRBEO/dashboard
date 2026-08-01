import { TirbeoThemeProvider } from '@tirbeo/theme';
import DashboardClientLayout from './client-layout';

export const dynamic = 'force-dynamic';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <TirbeoThemeProvider>
      <DashboardClientLayout>{children}</DashboardClientLayout>
    </TirbeoThemeProvider>
  );
}
