"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSidebar } from "../context/SidebarContext";
import {
  LayoutDashboard,
  Calendar,
  History,
  ChevronLeft,
} from "lucide-react";
import SidebarItem from "@/components/sidebar/SidebarItem";

type NavItem = {
  name: string;
  icon: React.ElementType;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const mainMenuItems: NavItem[] = [
  {
    icon: LayoutDashboard,
    name: "Dashboard",
    path: "/",
  },
  {
    icon: Calendar,
    name: "Calendar",
    path: "/calendar",
  },
  {
    icon: History,
    name: "Payment History",
    path: "/payment-history",
  },
];

// Removed Support Menu Items

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleSidebar } = useSidebar();

  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prev) => (prev === index ? null : index));
  };

  const showFull = isExpanded || isHovered || isMobileOpen;

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out z-50 flex flex-col
        ${showFull ? "w-72" : "w-20"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo Section */}
      <div className={`h-20 flex items-center px-6 mb-2 ${!showFull ? "justify-center" : "justify-between"}`}>
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20 shrink-0">
            <Image
              src="/tailadmin-nextjs/images/logo/logo-icon.svg"
              alt="Logo"
              width={24}
              height={24}
              priority
            />
          </div>
          {showFull && (
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
              TailAdmin
            </span>
          )}
        </Link>
        {showFull && isExpanded && (
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-white"
          >
            <ChevronLeft size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-2 space-y-6 py-4">
        <div>
          <h2 className={`mb-4 px-4 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500 transition-all duration-300 ${!showFull ? "opacity-0 invisible h-0" : "opacity-100 visible h-auto"}`}>
            Main Menu
          </h2>
          <div className="space-y-1">
            {mainMenuItems.map((item, index) => (
              <SidebarItem
                key={item.name}
                {...item}
                isExpanded={isExpanded}
                isHovered={isHovered}
                isMobileOpen={isMobileOpen}
                isOpen={openSubmenu === index}
                onToggle={() => handleSubmenuToggle(index)}
              />
            ))}
          </div>
        </div>

        {/* Support Menu Removed */}
      </div>

      {/* Profile Section */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <div className={`flex items-center gap-3 p-2 rounded-xl transition-all duration-300 ${showFull ? "hover:bg-gray-50 dark:hover:bg-white/5" : "justify-center"}`}>
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
              AD
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-950 rounded-full" />
          </div>
          {showFull && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-gray-900 dark:text-white truncate">Admin User</span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate font-medium uppercase tracking-wider">Super Admin</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
