import type { Metadata } from "next";
import { Source_Sans_3, Merriweather } from "next/font/google";
import { Header } from "@/frontend/layout/Header";
import { getMenuItems } from "@/backend/modules/navigation/actions";
import { Footer } from "@/frontend/layout/Footer";
import { SessionProvider } from "@/frontend/providers/SessionProvider";
import { SkipLink } from "@/frontend/ui/SkipLink";
import { BackToTop } from "@/frontend/ui/BackToTop";
import { ReadingProgress } from "@/frontend/ui/ReadingProgress";
import { ThemeProvider } from "@/frontend/providers/ThemeProvider";
import { AccessibilityProvider } from "@/frontend/providers/AccessibilityProvider";
import { ToastProvider } from "@/frontend/ui/toast/ToastProvider";
import { ToastContainer } from "@/frontend/ui/toast/Toast";
import { CommandMenu } from "@/frontend/layout/CommandMenu";
import { ProgressBar } from "@/frontend/ui/ProgressBar";
import { GoogleAnalytics } from "@/frontend/ui/GoogleAnalytics";
import { PublicOnly } from "@/frontend/layout/PublicOnly";
import { PwaInstallPrompt } from "@/frontend/ui/PwaInstallPrompt";
import { generateOrganizationSchema, serializeJsonLd, SITE_URL } from "@/backend/modules/content/seo";
import "./globals.css";
import "@/frontend/styles/admin.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  weight: ["400", "700"],
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Hayattan.Net - Hayatın Engelsiz Tarafı",
    template: "%s | Hayattan.Net",
  },
  description: "Hayattan.Net - Hayatın Engelsiz Tarafı",
  keywords: ["kültür", "sanat", "edebiyat", "deneme", "engelsiz yaşam", "blog", "dergi", "yazar", "şair", "fotoğraf"],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Hayattan.Net",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: SITE_URL,
    siteName: "Hayattan.Net",
    title: "Hayattan.Net - Hayatın Engelsiz Tarafı",
    description: "Hayattan.Net - Hayatın Engelsiz Tarafı",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hayattan.Net - Hayatın Engelsiz Tarafı",
    description: "Hayattan.Net - Hayatın Engelsiz Tarafı",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    types: {
      "application/rss+xml": `${SITE_URL}/feed.xml`,
    },
  },
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = generateOrganizationSchema();
  const menuItems = await getMenuItems();

  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${sourceSans.variable} ${merriweather.variable} flex min-h-screen flex-col antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationSchema) }}
        />
        <ToastProvider>
          <ThemeProvider>
            <AccessibilityProvider>
              <SessionProvider>
                <CommandMenu />
                <SkipLink />
                <ProgressBar />
                <PublicOnly>
                  <Header navItems={menuItems} />
                  <ReadingProgress />
                </PublicOnly>
                <main id="main-content" className="min-h-full flex-1 bg-background">
                  {children}
                </main>
                <PublicOnly>
                  <Footer />
                  <BackToTop />
                  <PwaInstallPrompt />
                </PublicOnly>
                <ToastContainer />
                <GoogleAnalytics />
              </SessionProvider>
            </AccessibilityProvider>
          </ThemeProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
