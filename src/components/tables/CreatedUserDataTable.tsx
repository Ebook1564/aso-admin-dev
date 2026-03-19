"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Search, User, Copy, Eye, EyeOff, RefreshCcw, Check, ShieldAlert } from "lucide-react";

export default function CreatedUserDataTable() {
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPasswords, setShowPasswords] = useState<Record<number, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/created-users");
      const result = await response.json();
      if (result.success) {
        setData(result.data);
        if (result.data.length > 0) {
          setColumns(Object.keys(result.data[0]));
        }
      } else {
        setError(result.error || "Failed to fetch data");
      }
    } catch (err) {
      setError("An error occurred while fetching user data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const lowerQuery = searchQuery.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(lowerQuery)
      )
    );
  }, [data, searchQuery]);

  const togglePassword = (idx: number) => {
    setShowPasswords((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatValue = (col: string, value: any, idx: number) => {
    if (value === null || value === undefined) return "-";

    const valStr = String(value);

    // Format UUIDs/IDs
    if (col.toLowerCase() === "id" && valStr.length > 20) {
      const truncated = `${valStr.substring(0, 6)}...${valStr.substring(valStr.length - 4)}`;
      return (
        <div className="flex items-center gap-2 group/id">
          <span className="font-mono text-xs text-gray-500 cursor-help" title={valStr}>
            {truncated}
          </span>
          <button 
            onClick={() => copyToClipboard(valStr)}
            className="opacity-0 group-hover/id:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded"
          >
            {copiedId === valStr ? <Check size={12} className="text-green-500" /> : <Copy size={12} className="text-gray-400" />}
          </button>
        </div>
      );
    }

    // Mask Passwords
    if (col.toLowerCase().includes("password")) {
      const isVisible = showPasswords[idx];
      return (
        <div className="flex items-center gap-2">
          <span className="font-mono">
            {isVisible ? valStr : "••••••••"}
          </span>
          <button 
            onClick={() => togglePassword(idx)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors"
          >
            {isVisible ? <EyeOff size={14} className="text-gray-400" /> : <Eye size={14} className="text-gray-400" />}
          </button>
        </div>
      );
    }

    // Format Emails
    if (col.toLowerCase() === "email") {
      return (
        <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
          {valStr}
        </span>
      );
    }

    return valStr;
  };

  if (loading) return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm animate-in fade-in duration-500">
      <div className="flex flex-col gap-4">
        <div className="h-8 w-48 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 w-full bg-gray-50 dark:bg-gray-900/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="rounded-3xl border border-red-100 bg-red-50/50 p-8 dark:border-red-900/20 dark:bg-red-900/5 text-center flex flex-col items-center gap-3 animate-in zoom-in-95 duration-300">
      <ShieldAlert className="text-red-500 w-10 h-10" />
      <div>
        <h3 className="text-lg font-bold text-red-800 dark:text-red-400">Connection Error</h3>
        <p className="text-sm text-red-600 dark:text-red-500/80 mt-1">{error}</p>
      </div>
      <button 
        onClick={fetchData}
        className="mt-2 px-6 py-2 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900/30 rounded-full text-sm font-bold text-red-600 hover:bg-red-50 transition-all shadow-sm"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div className="group/container rounded-3xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden shadow-xl shadow-gray-200/20 dark:shadow-none transition-all duration-500 hover:shadow-2xl hover:shadow-brand-500/5">
      {/* Premium Header */}
      <div className="px-6 py-6 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-transparent to-brand-500/[0.02]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/30 group-hover/container:scale-110 transition-transform duration-500">
            <User size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-none">ASO Users</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium uppercase tracking-widest">
              Table: <span className="text-brand-500">asousertable</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group/search">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/search:text-brand-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-72 h-11 pl-11 pr-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none"
            />
          </div>
          <button 
            onClick={fetchData}
            title="Refresh Data"
            className="p-3 bg-gray-50 dark:bg-gray-900/50 hover:bg-brand-50 dark:hover:bg-brand-500/10 border border-gray-100 dark:border-gray-800 rounded-2xl text-gray-500 hover:text-brand-500 transition-all active:rotate-180 duration-500 shadow-sm"
          >
            <RefreshCcw size={20} />
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto custom-scrollbar">
        <Table>
          <TableHeader className="bg-gray-50/50 dark:bg-gray-800/10 backdrop-blur-sm">
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col} isHeader className="px-6 py-5 text-start text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {filteredData.length > 0 ? (
              filteredData.map((row, i) => (
                <TableRow key={i} className="hover:bg-brand-500/[0.02] dark:hover:bg-brand-500/[0.04] transition-colors group/row">
                  {columns.map((col) => (
                    <TableCell key={col} className="px-6 py-5 text-sm">
                      {col.toLowerCase() === "username" ? (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shadow-sm shadow-brand-500/20">
                            {String(row[col]).charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-gray-900 dark:text-white/90 group-hover/row:text-brand-500 transition-colors">
                            {String(row[col])}
                          </span>
                        </div>
                      ) : (
                        <div className="text-gray-600 dark:text-gray-400 font-medium">
                          {formatValue(col, row[col], i)}
                        </div>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length || 1} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-4 grayscale opacity-50">
                    <Search size={48} className="text-gray-300" />
                    <p className="text-sm font-bold text-gray-500 italic uppercase tracking-widest">
                      {searchQuery ? `No results for "${searchQuery}"` : "Database table is empty"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer / Stats */}
      <div className="px-6 py-4 bg-gray-50/30 dark:bg-gray-900/10 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          Showing <span className="text-brand-500">{filteredData.length}</span> of <span className="text-gray-900 dark:text-white">{data.length}</span> Total Records
        </p>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none">Live Connection</span>
        </div>
      </div>
    </div>
  );
}
