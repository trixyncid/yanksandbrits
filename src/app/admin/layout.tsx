import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Source_Sans_3, Source_Serif_4 } from "next/font/google";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/admin/toast";
import "@/styles/globals.css";
import "@/styles/article.css";
import "@/styles/admin.css";

const sans = Source_Sans_3({ subsets: ["latin"], display: "swap", variable: "--font-source-sans" });
const serif = Source_Serif_4({ subsets: ["latin"], display: "swap", variable: "--font-source-serif" });
// The CMS face: geometric, with numerals that hold up at dashboard sizes.
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], display: "swap", variable: "--font-jakarta" });

// Every admin screen reads the session, so nothing here belongs in a shared static shell.
export const instant = false;

export const metadata: Metadata = {
  title: { default: "CMS", template: "%s · CMS" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${jakarta.variable} h-full antialiased`}>
      <body className="cms min-h-full bg-cms-canvas font-cms text-cms-ink">
        {/* Lives above every admin route so a toast survives the redirect after sign-in. */}
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
