import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Chess Kingdom - Learn Chess the Medieval Way!",
  description:
    "An educational chess game for kids featuring a Medieval Knights theme. Learn the rules, solve puzzles, and challenge the AI or your friends!",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#1a1714",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="medieval-bg" />
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "linear-gradient(135deg, #3a3530, #1a1714)",
              color: "#f4e4b8",
              border: "1px solid rgba(245,197,24,0.3)",
              fontFamily: "Cinzel, serif",
              borderRadius: "12px",
            },
          }}
        />
      </body>
    </html>
  );
}
