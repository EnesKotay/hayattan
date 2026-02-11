import type { Metadata } from "next";
import { Source_Sans_3, Merriweather } from "next/font/google";
import { Header } from "@/components/Header";
import { getMenuItems } from "@/app/admin/actions";
import { Footer } from "@/components/Footer";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { PageTransition } from "@/components/PageTransition";
import { SkipLink } from "@/components/SkipLink";
import { BackToTop } from "@/components/BackToTop";
import { ReadingProgress } from "@/components/ReadingProgress";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/Toast/ToastProvider";
import { ToastContainer } from "@/components/Toast/Toast";
import { CommandMenu } from "@/components/CommandMenu";
import { ProgressBar } from "@/components/ProgressBar";
import "./globals.css";
import "@/styles/admin.css";

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

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hayattan.net";
const siteUrl = rawSiteUrl.startsWith("http") ? rawSiteUrl : `https://${rawSiteUrl}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Hayattan.Net - Hayatın Engelsiz Tarafı",
    template: "%s | Hayattan.Net",
  },
  description: "Hayattan.Net - Hayatın Engelsiz Tarafı",
  keywords: ["kültür", "sanat", "edebiyat", "deneme", "engelsiz yaşam", "blog", "dergi", "yazar", "şair", "fotoğraf"],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: siteUrl,
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
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navItems = await getMenuItems();
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${sourceSans.variable} ${merriweather.variable} flex min-h-screen flex-col antialiased`}
      >
        <ToastProvider>
          <ThemeProvider>
            <SessionProvider>
              <CommandMenu />
              <SkipLink />
              <ProgressBar />
              <Header navItems={navItems} />
              <ReadingProgress />
              <main id="main-content" className="min-h-full flex-1 bg-background">
                <PageTransition>{children}</PageTransition>
              </main>
              <Footer />
              <BackToTop />
              <ToastContainer />
            </SessionProvider>
          </ThemeProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
