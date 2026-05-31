import '@/styles/globals.css';
import { Suspense } from 'react';
import { AuthProvider } from '@/hooks/useAuth';
import { ThemeProvider } from '@/hooks/useTheme';
import { WorkspaceProvider } from '@/hooks/useWorkspace';
import { RoleProvider } from '@/hooks/useRole';
import { ToastProvider } from '@/components/ui/Toast';
import NavProgress from '@/components/NavProgress';
import { BRAND } from '@/lib/brand';

export const metadata = {
  title: BRAND.metaTitle,
  description: BRAND.metaDescription,
  icons: {
    // SVG favicon stays for the browser-tab mark (square, scales well).
    // The full official lockup is used in-app and for social cards.
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/branding/nextnova-logo.png', type: 'image/png' },
    ],
    shortcut: ['/favicon.svg'],
    apple: [{ url: '/branding/nextnova-logo.png', sizes: '180x180' }],
  },
  themeColor: '#0F172A',
  openGraph: {
    title: BRAND.metaTitle,
    description: BRAND.metaDescription,
    siteName: BRAND.name,
    images: [{ url: '/branding/nextnova-logo.png', width: 1536, height: 1024, alt: BRAND.name }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: BRAND.metaTitle,
    description: BRAND.metaDescription,
    images: ['/branding/nextnova-logo.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-nova-900 min-h-screen antialiased text-nova-100">
        <ThemeProvider>
          <WorkspaceProvider>
            <RoleProvider>
              <ToastProvider>
                <AuthProvider>
                  <Suspense fallback={null}>
                    <NavProgress />
                  </Suspense>
                  {children}
                </AuthProvider>
              </ToastProvider>
            </RoleProvider>
          </WorkspaceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
