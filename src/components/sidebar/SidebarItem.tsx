"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

interface SidebarItemProps {
  name: string;
  icon: React.ElementType;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
  isExpanded: boolean;
  isHovered: boolean;
  isMobileOpen: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  name,
  icon: Icon,
  path,
  subItems,
  isExpanded,
  isHovered,
  isMobileOpen,
  isOpen,
  onToggle,
}) => {
  const pathname = usePathname();
  const isActive = path === pathname || subItems?.some((item) => item.path === pathname);
  const showFull = isExpanded || isHovered || isMobileOpen;

  const content = (
    <>
      <div className={`relative flex items-center justify-center transition-all duration-300 ${showFull ? "w-6 h-6 mr-3" : "w-10 h-10"}`}>
        <Icon
          size={20}
          className={`transition-colors duration-300 ${
            isActive ? "text-brand-500" : "text-gray-500 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
          }`}
        />
        {/* Active Indicator Bar */}
        {isActive && !showFull && (
          <div className="absolute left-[-16px] w-1 h-6 bg-brand-500 rounded-r-full transition-all duration-300" />
        )}
      </div>
      
      {showFull && (
        <span className={`text-sm font-medium transition-colors duration-300 ${
          isActive ? "text-gray-900 dark:text-white" : "text-gray-600 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
        }`}>
          {name}
        </span>
      )}

      {showFull && subItems && (
        <ChevronDown
          size={16}
          className={`ml-auto transition-transform duration-300 ${isOpen ? "rotate-180" : ""} ${
            isActive ? "text-gray-900 dark:text-white" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
          }`}
        />
      )}

      {/* Active Indicator Bar (Expanded) */}
      {isActive && showFull && (
        <div className="absolute left-0 w-1 h-5 bg-brand-500 rounded-r-full" />
      )}
    </>
  );

  const baseClasses = `relative flex items-center px-3 py-2.5 rounded-xl transition-all duration-300 group
    ${isActive ? "bg-brand-50/50 dark:bg-brand-500/10 shadow-sm" : "hover:bg-gray-50 dark:hover:bg-white/5"}
    ${!showFull ? "justify-center px-0 mx-auto" : "mx-2"}
  `;

  const tooltip = !showFull && (
    <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 dark:bg-gray-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 whitespace-nowrap z-[60] shadow-xl">
      {name}
      {/* Tooltip Arrow */}
      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-800" />
    </div>
  );

  if (subItems) {
    return (
      <div className="w-full">
        <button onClick={onToggle} className={`w-full ${baseClasses}`}>
          {content}
          {tooltip}
        </button>
        {showFull && isOpen && (
          <div className="mt-1 space-y-1 ml-9">
            {subItems.map((subItem) => {
              const subActive = subItem.path === pathname;
              return (
                <Link
                  key={subItem.path}
                  href={subItem.path}
                  className={`flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-300 ${
                    subActive
                      ? "text-brand-500 font-medium"
                      : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                  }`}
                >
                  {subItem.name}
                  {(subItem.new || subItem.pro) && (
                    <span className="flex items-center gap-1 ml-auto">
                      {subItem.new && (
                        <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-brand-500 text-white">
                          New
                        </span>
                      )}
                      {subItem.pro && (
                        <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-indigo-500 text-white">
                          Pro
                        </span>
                      )}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link href={path || "/"} className={baseClasses}>
      {content}
      {tooltip}
    </Link>
  );
};

export default SidebarItem;
