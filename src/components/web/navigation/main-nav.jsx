"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Home, Info, Settings, Phone } from "lucide-react";

const routes = [
  {
    href: "/",
    label: "Головна",
    icon: Home,
  },
  {
    href: "/about",
    label: "Про нас",
    icon: Info,
  },
  {
    href: "/services",
    label: "Сервіси",
    icon: Settings,
  },
  {
    href: "/contact",
    label: "Контакти",
    icon: Phone,
  },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center justify-center space-x-1">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg group hover:bg-yellow-500/10",
            pathname === route.href
              ? "text-yellow-500"
              : "text-muted-foreground hover:text-yellow-500"
          )}
        >
          <div className="flex items-center gap-2">
            <motion.div
              initial={false}
              animate={{
                scale: pathname === route.href ? 1.1 : 1,
                color:
                  pathname === route.href ? "rgb(234 179 8)" : "currentColor",
              }}
              className="flex items-center"
            >
              <route.icon className="w-4 h-4" />
            </motion.div>
            <span>{route.label}</span>
          </div>

          {/* Active Indicator */}
          {pathname === route.href && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500 rounded-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </Link>
      ))}
    </nav>
  );
}
