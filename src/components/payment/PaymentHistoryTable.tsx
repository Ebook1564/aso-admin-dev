"use client";

import React, { useState, useEffect, useCallback, useTransition, memo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Modal } from "../ui/modal";
import UserPaymentDetail from "./UserPaymentDetail";
import { Search, RefreshCcw, CreditCard, ChevronRight, CheckCircle2, AlertCircle, Clock, Loader2 } from "lucide-react";

export interface PaymentRecord {
  id: number;
  name: string;
  email: string;
  phonenumber: string;
  country: string;
  amount: string;
  transactionid: string;
  timestamp: string;
  payment_status: string;
  screenshot_url?: string;
  form_status?: number;
}

// Optimized Status Badge Component
const StatusBadge = memo(({ status }: { status: string }) => {
  const s = status?.toLowerCase();
  if (s === "completed" || s === "success") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400 uppercase tracking-wider">
        <CheckCircle2 size={10} />
        {status}
      </span>
    );
  }
  if (s === "pending") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 uppercase tracking-wider">
        <Clock size={10} />
        {status}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-50 text-gray-600 dark:bg-white/10 dark:text-gray-400 uppercase tracking-wider">
      <AlertCircle size={10} />
      {status || "Unknown"}
    </span>
  );
});

StatusBadge.displayName = "StatusBadge";

// Memoized Transaction Row
const PaymentRow = memo(({ 
    record, 
    onClick 
}: { 
    record: PaymentRecord, 
    onClick: (id: number) => void 
}) => (
  <TableRow 
    className="hover:bg-brand-500/[0.01] dark:hover:bg-brand-500/[0.02] transition-colors group/row cursor-pointer"
    onClick={() => onClick(record.id)}
  >
    <TableCell className="px-6 py-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 shrink-0 group-hover/row:border-brand-500/30 transition-colors">
          <CreditCard size={16} />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-900 dark:text-white/90 group-hover/row:text-brand-500 transition-colors">
            {record.name || "Anonymous"}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {record.email}
          </span>
        </div>
      </div>
    </TableCell>
    <TableCell className="px-6 py-5">
      <span className="text-sm font-black text-gray-900 dark:text-white">
        ${parseFloat(record.amount || "0").toFixed(2)}
      </span>
    </TableCell>
    <TableCell className="px-6 py-5">
      <StatusBadge status={record.payment_status} />
    </TableCell>
    <TableCell className="px-6 py-5">
      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
        {new Date(record.timestamp).toLocaleString(undefined, {
          dateStyle: 'medium',
          timeStyle: 'short'
        })}
      </span>
    </TableCell>
    <TableCell className="px-6 py-5">
      <span className="text-xs font-mono text-gray-500 dark:text-gray-500 tracking-tight">
        {record.transactionid}
      </span>
    </TableCell>
    <TableCell className="px-6 py-5 text-end">
      <div className="inline-flex items-center justify-center p-2 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-400 group-hover/row:bg-brand-500 group-hover/row:text-white transition-all">
        <ChevronRight size={16} />
      </div>
    </TableCell>
  </TableRow>
));

PaymentRow.displayName = "PaymentRow";

export default function PaymentHistoryTable() {
  const [data, setData] = useState<PaymentRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isPending, startTransition] = useTransition();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); 
    }, 400); // Faster debounce
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: debouncedSearch
      });
      
      const response = await fetch(`/api/payments-history?${queryParams}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        setTotalRecords(result.total);
      } else {
        setError(result.error || "Failed to fetch payment history");
      }
    } catch (err) {
      setError("An error occurred while fetching payment data");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, itemsPerPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRowClick = useCallback(async (paymentId: number) => {
    setDetailLoading(true);
    try {
      const response = await fetch(`/api/payments-history?id=${paymentId}`);
      const result = await response.json();
      if (result.success) {
        // Use transition for non-blocking state update
        startTransition(() => {
            setSelectedPayment(result.data);
            setIsModalOpen(true);
        });
      } else {
        alert("Failed to load details: " + result.error);
      }
    } catch (err) {
      alert("Error loading transaction data");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleStatusUpdate = useCallback((newStatus: string) => {
    if (selectedPayment) {
      setData((prev) => 
        prev.map((item) => 
          item.id === selectedPayment.id 
            ? { ...item, payment_status: newStatus } 
            : item
        )
      );
      setSelectedPayment((prev) => prev ? { ...prev, payment_status: newStatus } : null);
    }
  }, [selectedPayment]);

  if (loading && data.length === 0) return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm animate-pulse">
      <div className="h-8 w-48 bg-gray-100 dark:bg-gray-800 rounded-lg mb-6" />
      <div className="space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-14 w-full bg-gray-50 dark:bg-gray-900/50 rounded-xl" />)}
      </div>
    </div>
  );

  const totalPages = Math.ceil(totalRecords / itemsPerPage);

  return (
    <div className="group/container rounded-3xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden shadow-xl shadow-gray-200/20 dark:shadow-none transition-all duration-500">
      {/* Detail Loading Overlay */}
      {detailLoading && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-[9999] flex items-center justify-center transition-all">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col items-center gap-4">
             <Loader2 size={40} className="animate-spin text-brand-500" />
             <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white">Optimizing...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-6 py-6 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
            <CreditCard size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-none">Payment History</h3>
            <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">
              Live Database: <span className="text-brand-500">asopayments</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group/search">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/search:text-brand-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search ID, Name or Email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-72 h-11 pl-11 pr-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none"
            />
          </div>
          <button 
            onClick={fetchData}
            title="Refresh"
            className="p-3 bg-gray-50 dark:bg-gray-900/50 hover:bg-brand-50 dark:hover:bg-brand-500/10 border border-gray-100 dark:border-gray-800 rounded-2xl text-gray-500 transition-all flex items-center justify-center"
          >
            {loading ? <Loader2 size={20} className="animate-spin text-brand-500" /> : <RefreshCcw size={20} />}
          </button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto relative">
        <Table>
          <TableHeader className="bg-gray-50/50 dark:bg-gray-800/10">
            <TableRow>
              <TableCell isHeader className="px-6 py-4 text-start text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Customer</TableCell>
              <TableCell isHeader className="px-6 py-4 text-start text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Amount</TableCell>
              <TableCell isHeader className="px-6 py-4 text-start text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Status</TableCell>
              <TableCell isHeader className="px-6 py-4 text-start text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Date</TableCell>
              <TableCell isHeader className="px-6 py-4 text-start text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Transaction ID</TableCell>
              <TableCell isHeader className="px-6 py-4 text-end text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Action</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800/50">
            {data.length > 0 ? (
              data.map((record) => (
                <PaymentRow 
                  key={record.id} 
                  record={record} 
                  onClick={handleRowClick} 
                />
              ))
            ) : !loading ? (
              <TableRow>
                <TableCell colSpan={6} className="px-6 py-20 text-center">
                   <div className="flex flex-col items-center gap-4">
                    <Search size={48} className="text-gray-200 dark:text-gray-800" />
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">No matching transactions found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      <div className="px-6 py-4 bg-gray-50/10 dark:bg-white/[0.02] border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          Record <span className="text-brand-500">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-brand-500">{Math.min(currentPage * itemsPerPage, totalRecords)}</span> of <span className="text-brand-500">{totalRecords}</span>
        </p>
        
        <div className="flex items-center gap-2">
            <button 
                onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.max(1, prev - 1)); }}
                disabled={currentPage === 1 || loading}
                className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-200 dark:border-gray-800 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
            >
                Prev
            </button>
            <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 1))
                  .map((pageNum) => (
                    <button
                        key={pageNum}
                        onClick={(e) => { e.stopPropagation(); setCurrentPage(pageNum); }}
                        disabled={loading}
                        className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${
                            currentPage === pageNum 
                            ? "bg-brand-500 text-white shadow-lg shadow-brand-500/30" 
                            : "text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50"
                        }`}
                    >
                        {pageNum}
                    </button>
                ))}
            </div>
            <button 
                onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.min(totalPages, prev + 1)); }}
                disabled={currentPage === totalPages || totalPages === 0 || loading}
                className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-200 dark:border-gray-800 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
            >
                Next
            </button>
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50/30 dark:bg-gray-900/10 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
          Optimization: <span className="text-brand-500">Peak Performance</span>
        </p>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] animate-pulse">
           Non-Blocking Interactions Active
        </span>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="max-w-[800px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl"
      >
        {selectedPayment && (
          <UserPaymentDetail 
            userName={selectedPayment.name} 
            payment={selectedPayment} 
            onStatusUpdate={handleStatusUpdate}
          />
        )}
      </Modal>
    </div>
  );
}
