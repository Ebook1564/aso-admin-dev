"use client";
import React, { useState, useEffect, useRef } from "react";
import { Search, User } from "lucide-react";

interface UserSearchResult {
  username: string;
  useremail: string;
  delivery_count: number;
}

interface UserSearchProps {
  onSelectUser: (user: UserSearchResult) => void;
}

const UserSearch: React.FC<UserSearchProps> = ({ onSelectUser }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim()) {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
          const data = await res.json();
          if (data.success) {
            setResults(data.data);
            setIsOpen(true);
          }
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search users by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          className="w-full h-12 pl-12 pr-4 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none"
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {results.map((user: UserSearchResult, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSelectUser(user);
                setQuery(user.username);
                setIsOpen(false);
              }}
              className="w-full px-5 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-500">
                  <User size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900 dark:text-white group-hover:text-brand-500 transition-colors uppercase tracking-tight text-xs">
                    {user.username}
                  </span>
                  <span className="text-[10px] text-gray-400">{user.useremail}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-black text-brand-500 bg-brand-500/10 px-2 py-1 rounded-md uppercase">
                {user.delivery_count} Pkts
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSearch;
