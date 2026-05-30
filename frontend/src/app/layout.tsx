import '@/styles/globals.css';
import { Suspense } from 'react';
import { AuthProvider } from '@/hooks/useAuth';
import { ThemeProvider } from '@/hooks/useTheme';
import { ToastProvider } from '@/components/ui/Toast';
import NavProgress from '@/components/NavProgress';
import { BRAND } from '@/lib/brand';

export const metadata = {
  title: BRAND.metaTitle,
  description: BRAND.metaDescription,
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    shortcut: ['/favicon.svg'],
    apple: ['/favicon.svg'],
  },
  themeColor: '#0b0f1f',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-nova-900 min-h-screen antialiased text-nova-100">
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <Suspense fallback={null}>
                <NavProgress />
              </Suspense>
              {children}
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
