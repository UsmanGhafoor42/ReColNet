import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { dashboardLinks } from "@/components/layout/dashboard-links";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-3 sm:px-6">
          <nav className="no-scrollbar flex max-w-[70vw] gap-2 overflow-auto md:hidden">
            {dashboardLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-full border border-border/70 bg-card px-3 py-1 text-xs text-muted-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
