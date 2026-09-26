import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Digitano PRD Builder: Autonomous Multi-Agent SDLC Engine",
  description:
    "Deploy a 7-agent AI Scrum team to analyze project briefs, generate PRDs, schemas, API contracts, and Vibe-Coder prompts in < 120 seconds.",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0B0F17] text-[#F8FAFC] antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
