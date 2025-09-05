import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/contexts/WalletContext";
import { ToastProvider } from "@/components/Toast";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FHE Judge - Privacy-Preserving Hackathon Judging",
  description: "The world's first privacy-preserving hackathon judging platform powered by Fully Homomorphic Encryption",
  keywords: "FHE, hackathon, judging, privacy, blockchain, encryption",
  authors: [{ name: "FHE Judge Team" }],
  openGraph: {
    title: "FHE Judge - Privacy-Preserving Hackathon Judging",
    description: "Revolutionize hackathon judging with fully homomorphic encryption",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>
          <ToastProvider>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
              <Navbar />
              {children}
            </div>
          </ToastProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
