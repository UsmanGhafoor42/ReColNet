"use client";

import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3 font-semibold">
          <Image
            src="/Recolnet%20Logo/Recolnet_Logo.png"
            alt="ReColNet"
            width={146}
            height={40}
            className="hidden sm:block"
          />
        </Link>
        <nav className="hidden gap-1 rounded-full border border-border/70 bg-card/70 p-1 text-sm md:flex">
          <Link href="/upload" className="rounded-full px-4 py-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground">Upload</Link>
          <Link href="/history" className="rounded-full px-4 py-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground">History</Link>
          <Link href="/admin" className="rounded-full px-4 py-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground">Admin</Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/upload" className={cn(buttonVariants(), "rounded-full px-5")}>
            Start Colorizing
          </Link>
        </div>
      </div>
    </header>
  );
}
