"use client";
import React from "react";
import { Menu, X } from "lucide-react";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import { useSidebar } from "@/context/SidebarContext";
import SearchBar from "@/components/header/SearchBar";
import UserMenu from "@/components/header/UserMenu";
import NotificationButton from "@/components/header/NotificationButton";

const AppHeader: React.FC = () => {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  return (
    <header className="sticky top-0 z-40 flex w-full bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="flex items-center justify-between w-full px-4 lg:px-8 h-20">
        {/* Left Section: Sidebar Toggle & Search */}
        <div className="flex items-center gap-4 flex-1">
          <button
            className="flex items-center justify-center w-10 h-10 text-gray-500 hover:text-brand-500 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all duration-300 border border-gray-100 dark:border-gray-800"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <SearchBar />
        </div>

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center gap-2 lg:gap-4">
          <div className="flex items-center gap-1">
            <NotificationButton />
            <ThemeToggleButton />
          </div>
          
          <div className="hidden sm:block w-px h-6 bg-gray-100 dark:bg-gray-800 mx-1"></div>
          
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
