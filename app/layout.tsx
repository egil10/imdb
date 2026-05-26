import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "IMDB Map — explore the cinema network",
  description:
    "Pick a film and see the cloud of every other movie its cast has been in. Play Six Degrees between any two films.",
};

export const viewport: Viewport = {
  themeColor: "#f6f8fc",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
