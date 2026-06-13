"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

import { dashboardLinks } from "@/components/layout/dashboard-links";
import { cn } from "@/lib/utils";

export function DashboardSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border/60 bg-card/60 px-4 py-5 md:flex md:flex-col">
      <Link href="/" className="mb-8 flex items-center gap-3 px-2">
        <Image
          src="/Recolnet%20Logo/Recolnet_Logo.png"
          alt="ReColNet"
          width={126}
          height={34}
        />
      </Link>
      <nav className="flex flex-col gap-1">
        {dashboardLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
              pathname === href
                ? "bg-brand/10 font-medium text-brand"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
