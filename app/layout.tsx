import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Web3Provider } from "@/components/providers/web3-provider";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";
import { EnvironmentStoreProvider } from "@/components/context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "deBridge x Story | Royalties Relayer",
  description:
    "deBridge x Story is a royalties relayer that enables creators to settle royalties across chains.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <EnvironmentStoreProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <Web3Provider>
              <Navbar />
              <main className="flex-grow sen">{children}</main>
              <Toaster />
            </Web3Provider>
          </ThemeProvider>
        </EnvironmentStoreProvider>
      </body>
    </html>
  );
}
