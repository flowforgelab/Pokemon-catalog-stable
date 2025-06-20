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
      <html lang="en">
        <body className={inter.className}>
          <header className="flex justify-between items-center p-4 bg-white border-b">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-xl font-bold hover:text-gray-700">
                Pokemon TCG Catalog
              </Link>
              <nav className="flex gap-4">
                <Link href="/cards" className="hover:text-gray-700">
                  Cards
                </Link>
                <SignedIn>
                  <Link href="/dashboard" className="hover:text-gray-700">
                    Dashboard
                  </Link>
                </SignedIn>
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                    Sign Up
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </header>
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}