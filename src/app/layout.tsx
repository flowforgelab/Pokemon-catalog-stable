import type { Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { ThemeProvider } from "@/lib/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { MobileNav } from "@/components/mobile-nav"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Pokemon TCG Catalog",
  description: "Track and manage your Pokemon card collection",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-14 items-center">
                <MobileNav />
                <div className="mr-4 flex">
                  <Link href="/" className="mr-6 flex items-center space-x-2">
                    <span className="font-bold text-xl">Pokemon TCG</span>
                  </Link>
                  <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                    <Link href="/cards" className="transition-colors hover:text-foreground/80">
                      Cards
                    </Link>
                    <Link href="/deck-analyzer" className="transition-colors hover:text-foreground/80">
                      AI Analyzer
                    </Link>
                    <Link href="/budget-builder" className="transition-colors hover:text-foreground/80">
                      Budget Builder
                    </Link>
                    <Link href="/build-around" className="transition-colors hover:text-foreground/80">
                      Build Around
                    </Link>
                    <SignedIn>
                      <Link href="/dashboard" className="transition-colors hover:text-foreground/80">
                        Dashboard
                      </Link>
                    </SignedIn>
                  </nav>
                </div>
                <div className="flex flex-1 items-center justify-end space-x-2">
                  <ThemeToggle />
                  <div className="hidden md:flex items-center space-x-2">
                    <SignedOut>
                      <SignInButton mode="modal">
                        <button className="px-4 py-2 text-sm font-medium transition-colors hover:text-foreground/80">
                          Sign In
                        </button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <button className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90">
                          Sign Up
                        </button>
                      </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                      <UserButton />
                    </SignedIn>
                  </div>
                </div>
              </div>
            </header>
            <main>{children}</main>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}