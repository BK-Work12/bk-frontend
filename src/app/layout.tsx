import type { Metadata } from 'next';
import { Geist, Geist_Mono, Darker_Grotesque, Noto_Sans, Open_Sans, Manrope } from 'next/font/google';
import { ToastContainer } from '@/components/ui/ToastContainer';
import './globals.css';
import '@/lib/i18n';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/context/AuthContext';
import { StrategiesProvider } from '@/context/StrategiesContext';
import { SidebarProvider } from '@/context/SidebarContext';
import ChatWidget from '@/components/chat/ChatWidget';
import { Web3Provider } from '@/providers/Web3Provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const darkerGrotesque = Darker_Grotesque({
  variable: '--font-darker-grotesque',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

const notoSans = Noto_Sans({
  variable: '--font-noto-sans',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

const openSans = Open_Sans({
  variable: '--font-open-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
});

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Varntix: A Platform for Managing Digital Asset Investments',
  description: 'Earn 20% APR Fixed On Your Crypto',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    images: ['/assets/Thumbnail.webp'],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/assets/Thumbnail.webp'],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(function(){})}`,
          }}
        />
      </head>
      <body
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          ${darkerGrotesque.variable}
          ${notoSans.variable}
          ${openSans.variable}
          ${manrope.variable}
          antialiased
        `}
        style={{ backgroundColor: '#070707' }}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
          <Web3Provider>
            <AuthProvider>
              <StrategiesProvider>
                <SidebarProvider>{children}</SidebarProvider>
                <ChatWidget />
                <ToastContainer />
              </StrategiesProvider>
            </AuthProvider>
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
