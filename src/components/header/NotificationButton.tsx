"use client";
import React, { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";

const NotificationButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-10 h-10 text-gray-500 hover:text-brand-500 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all duration-300 group"
      >
        <Bell size={20} className="group-hover:scale-110 transition-transform duration-300" />
        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-500 border-2 border-white dark:border-gray-950 rounded-full">
          <span className="absolute inset-0 rounded-full bg-brand-500 animate-ping opacity-75"></span>
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl z-50 animate-in fade-in zoom-in duration-200">
          <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-500 bg-brand-50 dark:bg-brand-500/10 px-2 py-0.5 rounded-md">
              3 New
            </span>
          </div>
          
          <div className="max-h-[350px] overflow-y-auto no-scrollbar py-2">
            {[1, 2, 3].map((i) => (
              <button
                key={i}
                className="w-full px-5 py-3 flex gap-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Bell size={18} className="text-blue-500" />
                </div>
                <div className="flex flex-col gap-1 overflow-hidden">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-brand-500 transition-colors">
                    New project assignment
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    You have been assigned to the new &quot;Analytics Dashboard&quot; project.
                  </p>
                  <span className="text-[10px] text-gray-400 font-medium mt-1">2 mins ago</span>
                </div>
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-gray-50 dark:border-gray-800">
            <button className="w-full py-2 text-xs font-bold text-gray-500 hover:text-brand-500 transition-colors text-center">
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationButton;
