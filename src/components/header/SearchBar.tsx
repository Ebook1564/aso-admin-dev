"use client";
import React, { useEffect, useRef } from "react";
import { Search } from "lucide-react";

const SearchBar: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="hidden lg:block relative group w-full max-w-md">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <Search
          size={18}
          className="text-gray-400 group-focus-within:text-brand-500 transition-colors duration-300"
        />
      </div>
      <input
        ref={inputRef}
        type="text"
        placeholder="Search users, keywords, apps..."
        className="w-full h-11 pl-12 pr-16 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 focus:border-brand-500 dark:focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-xl text-sm transition-all focus:bg-white dark:focus:bg-gray-900"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm pointer-events-none">
        <span className="text-[10px] font-bold text-gray-400 uppercase">
          {typeof window !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0 ? "⌘" : "Ctrl"}
        </span>
        <span className="text-[10px] font-bold text-gray-400 uppercase">K</span>
      </div>
    </div>
  );
};

export default SearchBar;
