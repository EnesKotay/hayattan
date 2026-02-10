"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "@/components/admin/Icons";
import { motion } from "framer-motion";

const navItems = [
  { href: "/admin", label: "Ana Sayfa", icon: Icons.Home, badge: null },
  { href: "/admin/haberler", label: "Haberler", icon: Icons.News, badge: null },
  { href: "/admin/yazilar", label: "Yazılar", icon: Icons.Article, badge: null },
  { href: "/admin/yazarlar", label: "Yazarlar", icon: Icons.User, badge: null },
  { href: "/admin/kategoriler", label: "Kategoriler", icon: Icons.Tag, badge: null },
  { href: "/admin/sayfalar", label: "Sayfalar", icon: Icons.Magazine, badge: null },
  { href: "/admin/reklam", label: "Reklam", icon: Icons.Ad, badge: null },
  { href: "/admin/hakkimizda", label: "Hakkımızda", icon: Icons.Info, badge: null },
  { href: "/admin/profil", label: "Profil", icon: Icons.Lock, badge: null },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="relative border-t border-gray-100 bg-white/95 px-4 backdrop-blur-sm">
      <div className="container mx-auto flex flex-wrap gap-1 py-2">
        {navItems.map((item, index) => {
          const isActive =
            pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative group"
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.2 }}
                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${isActive
                  ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="hidden sm:inline">{item.label}</span>
                {item.badge && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </motion.div>

              {/* Active indicator bar */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
