import type { Metadata } from "next";
import "./globals.css";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: {
    default: `${brand.name} | ${brand.descriptor}`,
    template: `%s | ${brand.name}`,
  },
  description: brand.description,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
