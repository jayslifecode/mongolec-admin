import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { ApolloProvider } from '@/components/providers/apollo-provider'
import { ThemeProvider } from '@/context/theme-provider'
import { AuthProvider } from '@/context/auth-provider'
import { Toaster } from '@/components/ui/sonner'
import { themeInitScript } from '@/lib/theme-script'

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mongolec Admin",
  description: "Admin dashboard for Mongolec CMS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={manrope.variable} suppressHydrationWarning>
      <head>
        {/* Applies light/dark before the first paint (no flash of the wrong theme). */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>
          <ApolloProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ApolloProvider>
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
