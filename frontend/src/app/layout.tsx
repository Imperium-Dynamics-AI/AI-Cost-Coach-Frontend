import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AppProviders } from "@/app/providers";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "Azure AI Cost Coach",
  description:
    "Turn Azure spend into actionable savings with intelligent cost monitoring and AI-driven recommendations.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${plusJakarta.className} h-full antialiased`}
    >
      <body className="min-h-full bg-white font-sans text-navy">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
