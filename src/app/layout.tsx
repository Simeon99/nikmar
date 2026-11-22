import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import SmoothScroll from "@/components/motion/SmoothScroll";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
  weight: ["200", "300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NIKMAR GRADNJA | Stambene zgrade u Kruševcu i Vrnjačkoj Banji",
  description: "Gradimo stambene zgrade u Kruševcu i Vrnjačkoj Banji. Pet adresa do sada.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="sr-Latn" className={manrope.variable}>
      <body>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
