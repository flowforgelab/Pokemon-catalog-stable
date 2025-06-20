"use client"

import { Menu } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs"

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <div className="px-7">
          <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
            <span className="font-bold">Pokemon TCG</span>
          </Link>
        </div>
        <div className="mt-8 flex flex-col space-y-3 px-7">
          <Link href="/cards" onClick={() => setOpen(false)} className="text-sm font-medium">
            Cards
          </Link>
          <SignedIn>
            <Link href="/dashboard" onClick={() => setOpen(false)} className="text-sm font-medium">
              Dashboard
            </Link>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm font-medium text-left">Sign In</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="text-sm font-medium text-left">Sign Up</button>
            </SignUpButton>
          </SignedOut>
        </div>
      </SheetContent>
    </Sheet>
  )
}