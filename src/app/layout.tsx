import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ThemeListener } from '@/components/ThemeListener';
import Header from '@/components/Header';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Inline script to prevent white flash of unstyled content */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="bg-background text-foreground antialiased min-h-screen">
        <AuthProvider>
          <ThemeProvider>
            <ThemeListener />
            <Header />
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
