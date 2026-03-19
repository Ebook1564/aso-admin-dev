"use client";

import React, { useState } from "react";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import { DownloadIcon, PlusIcon, FileText, Search, CreditCard, CheckCircle2 } from "lucide-react";

interface KeywordFormProps {
  onAddKeyword: (keyword: string, payment?: Record<string, unknown>) => void;
  onUploadKeywords: (keywords: string[]) => void;
  onUploadPDF?: (file: File, paymentId: string) => void;
  onSelectUser: (user: Record<string, unknown>) => void;
  selectedUser: Record<string, unknown> | null;
  payment: Record<string, unknown> | null;
  onPaymentChange: (p: Record<string, unknown> | null) => void;
}

export default function KeywordForm({ onAddKeyword, onUploadKeywords, onUploadPDF, onSelectUser, selectedUser, payment, onPaymentChange }: KeywordFormProps) {
  const [searchPayment, setSearchPayment] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [payments, setPayments] = useState<Record<string, unknown>[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Record<string, unknown> | null>(null);

  const handlePaymentSearch = async () => {
    if (!searchPayment.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchPayment)}`);
      const result = await res.json();
      if (result.success) {
        setPayments(result.data || []);
      }
    } catch (error) {
      console.error("Payment search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserSelect = (u: Record<string, unknown>) => {
    onSelectUser(u);
    const userPayments = (u.payments as Record<string, unknown>[] || []).map((p: Record<string, unknown>) => ({
      // Assuming 'p' has 'id', 'name', 'amount', 'transactionid'
      id: p.id,
      name: p.name,
      amount: p.amount,
      transactionid: p.transactionid,
    }));
    setPayments(userPayments);
    setSearchPayment("");
  };

  const handleSelectTransaction = (payment: Record<string, unknown>) => {
    setSelectedPayment(payment);
    onPaymentChange(payment); // Update the parent component's payment state
    // Also add the plan as a keyword by default if that's the desired behavior
    onAddKeyword(payment.amount + " USD Order", payment);
    setPayments([]);
    setSearchPayment("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === "application/pdf") {
      if (!selectedPayment) {
        alert("Please select a transaction first to link this PDF delivery.");
        e.target.value = "";
        return;
      }
      if (onUploadPDF) {
        onUploadPDF(file, selectedPayment.id as string); // Assuming id is a string
      }
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const keywords = text
          .split(/[\n,]/)
          .map((k) => k.trim())
          .filter((k) => k !== "");
        onUploadKeywords(keywords);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Transaction Selection Section */}
      <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-brand-500" />
          Link to Transaction
        </h3>
        
        <div className="space-y-4">
          {!selectedPayment ? (
            <div className="relative">
              <Label htmlFor="transaction-search">Search Payment Record</Label>
              <div className="flex gap-2 mt-1.5">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by ID, Name or Email..."
                    value={searchPayment}
                    onChange={(e) => setSearchPayment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePaymentSearch()}
                    className="w-full h-11 pl-10 pr-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/10 outline-none transition-all"
                  />
                </div>
                <Button 
                  onClick={handlePaymentSearch} 
                  className="h-11 px-6 bg-brand-500 hover:bg-brand-600 rounded-xl"
                  disabled={isSearching}
                >
                  {isSearching ? "..." : <Search size={18} />}
                </Button>
              </div>

              {payments.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl z-50 max-h-64 overflow-y-auto p-1 animate-in slide-in-from-top-2 duration-200">
                  <div className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-gray-800/50">Select Transaction</div>
                  {payments.map((p: Record<string, unknown>) => (
                    <button
                      key={String(p.id)}
                      onClick={() => handleSelectTransaction(p)}
                      className="w-full text-left p-3 hover:bg-brand-500/5 rounded-xl flex items-center justify-between group transition-all"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-brand-500">{String(p.name)}</span>
                        <span className="text-[10px] text-gray-500 font-mono italic">TXN: {String(p.transactionid)} • ${String(p.amount)}</span>
                      </div>
                      <PlusIcon size={14} className="text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-brand-500/5 border border-brand-500/20 flex items-center justify-between shadow-inner">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white">
                     <CheckCircle2 size={20} />
                  </div>
                   <div className="flex flex-col">
                     <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">{String(selectedPayment['name'] ?? 'N/A')}</span>
                     <span className="text-[10px] text-brand-600 dark:text-brand-400 font-bold uppercase tracking-widest">${String(selectedPayment['amount'] ?? '0')} • {String(selectedPayment['transactionid'] ?? 'N/A')}</span>
                   </div>
               </div>
               <button 
                  onClick={() => setSelectedPayment(null)}
                  className="text-[10px] font-black text-gray-400 hover:text-red-500 uppercase tracking-widest transition-colors"
                >
                  Change
               </button>
            </div>
          )}

          <div className="p-4 bg-gray-50/50 dark:bg-white/[0.01] border border-gray-100 dark:border-gray-800/50 rounded-2xl">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
              Linking a transaction allows you to **Deliver Keywords** as PDF directly to the user dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Actions Section */}
      <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <DownloadIcon className="w-5 h-5 text-brand-500" />
          Keywords & Deliverables
        </h3>
        <div className="space-y-4">
          <div className="relative group">
            <input
              type="file"
              accept=".csv,.txt,.pdf"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              id="file-upload"
            />
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 transition-all group-hover:border-brand-500 group-hover:bg-brand-500/[0.02] bg-gray-50/50 dark:bg-gray-900/20">
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-gray-100 dark:border-gray-700">
                <FileText className="w-8 h-8 text-brand-500" />
              </div>
              <div className="text-center">
                <span className="text-sm font-black text-gray-900 dark:text-white block mb-1 uppercase tracking-tight">
                   Upload Deliverables
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">CSV, TXT (Keywords) or PDF (Delivery)</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
             <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-white/[0.02] rounded-xl border border-gray-100 dark:border-gray-800">
               <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></div>
               <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Keyword Sync</p>
             </div>
             <div className="flex items-center gap-2 p-3 bg-brand-500/5 rounded-xl border border-brand-500/10">
               <div className="w-1.5 h-1.5 rounded-full bg-brand-500"></div>
               <p className="text-[9px] font-black text-brand-500 uppercase tracking-widest">PDF Delivery</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
