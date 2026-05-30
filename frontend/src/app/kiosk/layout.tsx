/**
 * Minimal layout for the Attendance Kiosk.
 *
 * Bypasses both /dashboard and /portal layouts so the kiosk renders
 * full-screen with no top bar, no sidebar, no bottom nav — just the
 * fullscreen attendance UI.
 *
 * Inherits only RootLayout (html shell + theme + toast providers).
 */
export default function KioskLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
