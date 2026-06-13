"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/upload", label: "Upload" },
  { href: "/history", label: "History" },
  { href: "/dashboard", label: "Dashboard" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center">
          <Image
            src="/Recolnet%20Logo/Recolnet_Logo.png"
            alt="ReColNet"
            width={130}
            height={36}
            priority
          />
        </Link>

        <nav className="hidden items-center gap-8 text-sm md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground transition hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/upload"
            className={cn(
              buttonVariants(),
              "hidden rounded-full px-5 sm:inline-flex"
            )}
          >
            Upload Photo
          </Link>
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open menu"
                />
              }
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <nav className="mt-6 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <SheetClose
                    key={link.href}
                    render={
                      <Link
                        href={link.href}
                        className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      />
                    }
                  >
                    {link.label}
                  </SheetClose>
                ))}
                <SheetClose
                  render={
                    <Link
                      href="/upload"
                      className={cn(buttonVariants(), "mt-4 rounded-full")}
                    />
                  }
                >
                  Upload Photo
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
