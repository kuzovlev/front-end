"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  LayoutDashboard,
  LogOut,
  Map,
  MapPin,
  Navigation,
  Menu,
  X,
  ChevronLast,
  ChevronFirst,
  Users,
  Bus,
  CalendarDays,
  Receipt,
  Settings,
  CreditCard,
  Building2,
  Sparkles,
  Wallet,
  Users2,
  UserCog,
  Tags,
  DollarSign,
  Database,
  Globe,
} from "lucide-react";
import { useSidebar } from "@/store/use-sidebar";
import { useAuth } from "@/store/use-auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// First, let's organize the admin routes into groups
const adminRoutes = [
  {
    group: "Overview",
    items: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/admin/dashboard",
        color: "text-yellow-500",
      },
    ],
  },
  {
    group: "User Management",
    items: [
      {
        label: "Users",
        icon: Users,
        href: "/admin/users",
        color: "text-yellow-500",
      },
      {
        label: "Vendors",
        icon: Building2,
        href: "/admin/vendors",
        color: "text-yellow-500",
      },
    ],
  },
  {
    group: "Route Management",
    items: [
      {
        label: "Routes",
        icon: Map,
        href: "/admin/routes",
        color: "text-yellow-500",
      },
      {
        label: "Boarding Points",
        icon: MapPin,
        href: "/admin/boarding-points",
        color: "text-yellow-500",
      },
      {
        label: "Dropping Points",
        icon: Navigation,
        href: "/admin/dropping-points",
        color: "text-yellow-500",
      },
    ],
  },
  {
    group: "Vehicle Management",
    items: [
      {
        label: "Bus Layouts",
        icon: Bus,
        href: "/admin/bus-layouts",
        color: "text-yellow-500",
      },
      {
        label: "Vehicles",
        icon: Bus,
        href: "/admin/vehicles",
        color: "text-yellow-500",
      },
      {
        label: "Drivers",
        icon: Users2,
        href: "/admin/drivers",
        color: "text-yellow-500",
      },
      {
        label: "Driver Vehicle Assignments",
        icon: UserCog,
        href: "/admin/driver-vehicle-assignments",
        color: "text-yellow-500",
      },
    ],
  },
  {
    group: "Operations",
    items: [
      {
        label: "Schedules",
        icon: CalendarDays,
        href: "/admin/schedules",
        color: "text-yellow-500",
      },
      {
        label: "Bookings",
        icon: Receipt,
        href: "/admin/bookings",
        color: "text-yellow-500",
      },
      {
        label: "Amenities",
        icon: Sparkles,
        href: "/admin/amenities",
        color: "text-yellow-500",
      },
    ],
  },
  {
    group: "Finance",
    items: [
      {
        label: "Categories",
        icon: Tags,
        href: "/admin/categories",
        color: "text-yellow-500",
      },
      {
        label: "Income & Expenses",
        icon: DollarSign,
        href: "/admin/income-expenses",
        color: "text-yellow-500",
      },
    ],
  },
  {
    group: "Settings",
    items: [
      {
        label: "Custom Fields",
        icon: Database,
        href: "/admin/custom-fields",
        color: "text-yellow-500",
      },
      {
        label: "Website Settings",
        icon: Globe,
        href: "/admin/settings",
        color: "text-yellow-500",
      },
    ],
  },
];

// Organize vendor routes into groups
const vendorRoutes = [
  {
    group: "Overview",
    items: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/admin/dashboard",
        color: "text-yellow-500",
      },
    ],
  },
  {
    group: "Operations",
    items: [
      {
        label: "Vehicles",
        icon: Bus,
        href: "/admin/vehicles",
        color: "text-yellow-500",
      },
      {
        label: "Schedules",
        icon: CalendarDays,
        href: "/admin/schedules",
        color: "text-yellow-500",
      },
      {
        label: "Bookings",
        icon: Receipt,
        href: "/admin/bookings",
        color: "text-yellow-500",
      },
    ],
  },
  {
    group: "Finance",
    items: [
      {
        label: "Categories",
        icon: Tags,
        href: "/admin/categories",
        color: "text-yellow-500",
      },
      {
        label: "Income & Expenses",
        icon: DollarSign,
        href: "/admin/income-expenses",
        color: "text-yellow-500",
      },
    ],
  },
  {
    group: "Settings",
    items: [
      {
        label: "Custom Fields",
        icon: Database,
        href: "/vendor/custom-fields",
        color: "text-yellow-500",
      },
      {
        label: "Website Settings",
        icon: Globe,
        href: "/vendor/website-settings",
        color: "text-yellow-500",
      },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { isOpen, toggle, close } = useSidebar();
  const { user, logout } = useAuth();

  // Determine which routes to show based on user role
  const routes = user?.role === "ADMIN" ? adminRoutes : vendorRoutes;

  return (
    <>
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 border-r transition-all duration-300 ease-in-out flex flex-col",
          "border-border/10 backdrop-blur-xl",
          "bg-white/80 dark:bg-zinc-900/90",
          "shadow-lg shadow-zinc-200/50 dark:shadow-yellow-500/5",
          !isOpen && "md:w-20 -translate-x-full md:translate-x-0",
          isOpen && "translate-x-0"
        )}
      >
        {/* Mobile Header */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-border/10 md:hidden">
          <Link href="/admin/dashboard" className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
              {process.env.NEXT_PUBLIC_APP_NAME}
            </h1>
          </Link>
          <Button variant="ghost" size="icon" onClick={close}>
            <X className="h-4 w-4 text-muted-foreground/50" />
          </Button>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex h-14 items-center justify-between px-4 border-b border-border/10">
          <Link href="/admin/dashboard" className="flex items-center">
            <h1
              className={cn(
                "text-2xl font-bold transition-all bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent",
                !isOpen && "md:hidden"
              )}
            >
              {process.env.NEXT_PUBLIC_APP_NAME}
            </h1>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="h-8 w-8 hover:bg-yellow-500/5"
          >
            {isOpen ? (
              <ChevronFirst className="h-4 w-4 text-muted-foreground/50 transition-transform duration-200" />
            ) : (
              <ChevronLast className="h-4 w-4 text-muted-foreground/50 transition-transform duration-200" />
            )}
          </Button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-[calc(100vh-8rem)]">
          {/* Navigation */}
          <ScrollArea className="flex-1 px-3">
            <div className="space-y-4 py-4">
              {routes.map((group) => (
                <div key={group.group} className="relative">
                  {/* Group Label with gradient background and separator */}
                  <div className="relative">
                    <h2
                      className={cn(
                        "mb-2 px-2 py-1.5 text-xs font-semibold tracking-wider",
                        "bg-gradient-to-r from-yellow-50/50 to-transparent dark:from-yellow-500/5",
                        "rounded-l-md border-l-2 border-yellow-500/50",
                        "text-yellow-800/90 dark:text-yellow-200/90",
                        "uppercase",
                        !isOpen && "md:hidden"
                      )}
                    >
                      {group.group}
                    </h2>
                    <Separator
                      className={cn(
                        "my-2 bg-yellow-500/10",
                        !isOpen && "md:hidden"
                      )}
                    />
                  </div>

                  {/* Menu Items */}
                  <div className="space-y-1">
                    {group.items.map((route) => (
                      <Button
                        key={route.href}
                        variant={
                          pathname === route.href ? "secondary" : "ghost"
                        }
                        className={cn(
                          "w-full justify-start h-9 transition-all duration-200",
                          pathname === route.href &&
                            "bg-yellow-500/5 dark:bg-yellow-500/5 font-medium",
                          !isOpen && "md:justify-center md:p-2",
                          "hover:bg-yellow-500/5 hover:dark:bg-yellow-500/5",
                          "rounded-md"
                        )}
                        asChild
                      >
                        <Link href={route.href}>
                          <route.icon
                            className={cn(
                              "h-4 w-4 transition-all duration-200",
                              isOpen ? "mr-3" : "",
                              pathname === route.href
                                ? "text-yellow-500"
                                : "text-yellow-500/70"
                            )}
                          />
                          <span
                            className={cn(
                              "text-sm transition-all duration-200",
                              !isOpen && "md:hidden",
                              pathname === route.href
                                ? "text-zinc-900 dark:text-white font-medium"
                                : "text-zinc-700 dark:text-white/70"
                            )}
                          >
                            {route.label}
                          </span>
                        </Link>
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t border-border/10 p-2">
            <div
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg transition-all duration-200",
                "hover:dark:bg-yellow-500/5 hover:bg-zinc-500/5",
                !isOpen && "md:justify-center"
              )}
            >
              <div
                className={cn(
                  "flex items-center gap-x-3",
                  !isOpen && "md:hidden"
                )}
              >
                <Avatar className="h-7 w-7">
                  <AvatarImage
                    src={
                      user?.avatar
                        ? `${process.env.NEXT_PUBLIC_ROOT_URL}${user.avatar}`
                        : null
                    }
                    alt={user?.firstName}
                  />
                  <AvatarFallback className="bg-gradient-to-tr from-yellow-300 to-yellow-500 text-white">
                    {user?.firstName?.charAt(0)}
                    {user?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium leading-none text-zinc-900 dark:text-white">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-white/60">
                    {user?.role}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="ml-auto hover:bg-yellow-500/5"
              >
                <LogOut className="h-4 w-4 text-yellow-500" />
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={close}
        />
      )}
    </>
  );
}
