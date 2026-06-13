"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { dashboardLinks } from "@/components/layout/dashboard-links";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function DashboardHeader() {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between gap-3 border-b border-border bg-card px-4 py-3 sm:px-6">
      <div className="flex items-center gap-3">
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
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="border-b border-border px-5 py-5">
              <Link href="/">
                <Image
                  src="/Recolnet%20Logo/Recolnet_Logo.png"
                  alt="ReColNet"
                  width={120}
                  height={32}
                />
              </Link>
            </div>
            <nav className="flex flex-col gap-1 p-3">
              {dashboardLinks.map(({ href, label, icon: Icon }) => (
                <SheetClose
                  key={href}
                  render={
                    <Link
                      href={href}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                        pathname === href
                          ? "bg-brand/10 font-medium text-brand"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    />
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </SheetClose>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        <Link href="/" className="md:hidden">
          <Image
            src="/Recolnet%20Logo/Recolnet_Logo.png"
            alt="ReColNet"
            width={110}
            height={30}
          />
        </Link>
      </div>
      <ThemeToggle />
    </header>
  );
}
