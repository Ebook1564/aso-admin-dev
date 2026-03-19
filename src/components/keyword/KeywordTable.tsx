"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Download, User, Hash, DollarSign, Package, CheckCircle2, Clock, XCircle, Search, ExternalLink } from "lucide-react";

interface DeliveryRecord {
  id: number;
  user_id: string;
  username: string;
  useremail: string;
  transaction_id: string;
  payment_amount: string;
  payment_status: string;
  keyword_upload: string;
  created_at: string;
  phonenumber?: string;
}

interface KeywordTableProps {
  deliveries: DeliveryRecord[];
  isLoading?: boolean;
}

export default function KeywordTable({ deliveries, isLoading }: KeywordTableProps) {
  
  const getStatusBadge = (status: string | null | undefined) => {
    const s = (status || "UNKNOWN").toUpperCase();
    if (s === "COMPLETED") return (
      <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-green-500/20">
        <CheckCircle2 size={12} />
        Verified
      </div>
    );
    if (s === "PENDING") return (
      <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
        <Clock size={12} />
        Processing
      </div>
    );
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-red-500/20">
        <XCircle size={12} />
        {s}
      </div>
    );
  };

  return (
    <div className="overflow-hidden">
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <Table>
          <TableHeader className="bg-gray-50/50 dark:bg-white/[0.02] border-none">
            <TableRow className="border-none">
              <TableCell isHeader className="px-6 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                Customer & Contact
              </TableCell>
              <TableCell isHeader className="px-6 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                Transaction ID
              </TableCell>
              <TableCell isHeader className="px-6 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                Amount
              </TableCell>
              <TableCell isHeader className="px-6 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                Status
              </TableCell>
              <TableCell isHeader className="px-6 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 text-right">
                Delivery
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-50 dark:divide-white/[0.03]">
            {isLoading ? (
               <TableRow>
                  <TableCell colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                       <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Compiling Delivery Records...</p>
                    </div>
                  </TableCell>
               </TableRow>
            ) : deliveries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-24 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-3xl bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center text-gray-200 dark:text-gray-800">
                       <Package size={40} />
                    </div>
                    <div>
                        <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">No Verified Deliveries Found</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Connect a transaction above to start delivering keywords</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              deliveries.map((item) => (
                <TableRow key={item.id} className="hover:bg-brand-500/[0.01] dark:hover:bg-brand-500/[0.03] transition-all group">
                  <TableCell className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center text-brand-500 shadow-sm border border-gray-100 dark:border-gray-700 group-hover:scale-110 transition-transform">
                        <User size={24} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight group-hover:text-brand-500 transition-colors">
                          {item.username}
                        </span>
                        <div className="flex items-center gap-3 mt-0.5">
                           <span className="text-[10px] font-bold text-gray-400 lowercase italic">{item.useremail}</span>
                           {item.phonenumber && (
                             <span className="text-[9px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest">{item.phonenumber}</span>
                           )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell className="px-6 py-6">
                    <div className="flex flex-col gap-1">
                       <div className="flex items-center gap-2">
                          <Hash size={12} className="text-brand-500" />
                          <span className="text-xs font-black font-mono text-gray-900 dark:text-white">
                            {item.transaction_id}
                          </span>
                       </div>
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {new Date(item.created_at).toLocaleString()}
                       </span>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-6">
                    <div className="inline-flex items-center gap-1 text-sm font-black text-gray-900 dark:text-white italic">
                      <DollarSign size={14} className="text-brand-500 not-italic" />
                      {parseFloat(item.payment_amount).toFixed(2)}
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-6 font-bold">
                    {getStatusBadge(item.payment_status)}
                  </TableCell>

                  <TableCell className="px-6 py-6 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                      {item.keyword_upload ? (
                        <a
                          href={item.keyword_upload}
                          download={`Keywords_${item.transaction_id}.pdf`}
                          className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-600 shadow-lg shadow-brand-500/20 transition-all active:scale-95"
                        >
                          <Download size={14} />
                          Download PDF
                        </a>
                      ) : (
                        <span className="text-[10px] font-black text-gray-300 uppercase italic">Payload Detached</span>
                      )}
                      <button className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-brand-500 transition-all">
                        <ExternalLink size={16} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {deliveries.length > 0 && (
         <div className="px-6 py-4 bg-gray-50 dark:bg-white/[0.01] border-t border-gray-100 dark:border-white/[0.03] flex items-center justify-between">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
               Showing {deliveries.length} total keyword distributions
            </span>
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Vault Sync Active</span>
            </div>
         </div>
      )}
    </div>
  );
}
