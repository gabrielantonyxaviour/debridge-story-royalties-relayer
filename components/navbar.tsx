"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DynamicWidget, useDynamicContext } from "@dynamic-labs/sdk-react-core";

export function Navbar() {
  return (
    <header className="sen sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between w-full max-w-full">
        <div className="flex items-center gap-2 mr-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/debridge.png"
              alt="Debridge Logo"
              width={32}
              height={32}
              className="rounded-full"
            />
            <Image
              src="/story.png"
              alt="Story Logo"
              width={32}
              height={32}
              className="rounded-full"
            />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme toggle always visible */}
          <ThemeToggle />

          {/* Connect wallet button on desktop */}
          <div className="hidden md:flex">
            <DynamicWidget />
          </div>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col">
              <div className="mt-auto pb-8">
                <DynamicWidget />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
