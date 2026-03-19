"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Download, Globe, Mail, Phone, Calendar, Hash, CreditCard, ShieldCheck, Save, Loader2, CheckCircle2, ExternalLink, FileUp, FileCheck, AlertCircle, Trash2 } from "lucide-react";
import { PaymentRecord } from "./PaymentHistoryTable";
import { Modal } from "../ui/modal";
import Image from "next/image";

interface DeliveryRecord {
  id: number;
  payment_id: string;
  keyword_upload: string;
  created_at: string;
}

interface UserPaymentDetailProps {
  userName: string;
  payment: PaymentRecord;
  onStatusUpdate?: (newStatus: string) => void;
}

interface JSPDFWithAutoTable {
  autoTable: (options: Record<string, unknown>) => void;
  lastAutoTable?: { finalY: number };
}

export default function UserPaymentDetail({ payment, onStatusUpdate }: UserPaymentDetailProps) {
  const [status, setStatus] = useState(payment.payment_status || "PENDING");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  // Keyword Delivery State
  const [keywordFile, setKeywordFile] = useState<File | null>(null);
  const [isDelivering, setIsDelivering] = useState(false);
  const [deliveryRecords, setDeliveryRecords] = useState<DeliveryRecord[]>([]);
  const [isLoadingDeliveries, setIsLoadingDeliveries] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchDeliveryHistory = useCallback(async () => {
    try {
      const response = await fetch(`/api/deliver-keywords?payment_id=${payment.id}`);
      const result = await response.json();
      if (result.success) {
        setDeliveryRecords(result.data);
      }
    } catch {
      console.error("Failed to fetch delivery history");
    } finally {
      setIsLoadingDeliveries(false);
    }
  }, [payment.id]);

  useEffect(() => {
    fetchDeliveryHistory();
  }, [fetchDeliveryHistory]);

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      await import("jspdf-autotable");
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(30, 41, 59);
      doc.text("Transaction Receipt", 14, 25);
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 32, 196, 32);
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(`Transaction ID: ${payment.transactionid}`, 14, 42);
      doc.text(`Date: ${new Date(payment.timestamp).toLocaleString()}`, 14, 48);
      const customerData = [
        ["Customer Name", payment.name || "N/A"],
        ["Email Address", payment.email || "N/A"],
        ["Phone Number", payment.phonenumber || "N/A"],
        ["Country", payment.country || "N/A"],
      ];
      (doc as unknown as JSPDFWithAutoTable).autoTable({
        startY: 55,
        head: [["Field", "Information"]],
        body: customerData,
        theme: "plain",
        headStyles: { fillColor: [248, 250, 252], textColor: [71, 85, 105], fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 4 },
        columnStyles: { 0: { fontStyle: 'bold', width: 50 } }
      });
      const paymentData = [
         ["Amount Paid", `$${parseFloat(payment.amount).toFixed(2)}`],
         ["Payment Status", status.toUpperCase()],
      ];
      const docWithTable = doc as unknown as JSPDFWithAutoTable;
      const lastY = docWithTable.lastAutoTable ? docWithTable.lastAutoTable.finalY + 10 : 70;
      docWithTable.autoTable({
        startY: lastY,
        head: [["Payment Details", "Value"]],
        body: paymentData,
        theme: "grid",
        headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
        styles: { fontSize: 11, cellPadding: 5 },
        columnStyles: { 0: { fontStyle: 'bold' }, 1: { textColor: [79, 70, 229], fontStyle: 'bold' } }
      });
      doc.setFontSize(10);
      doc.setTextColor(150);
      const finalY = docWithTable.lastAutoTable ? docWithTable.lastAutoTable.finalY : 150;
      doc.text("Thank you for your business!", 105, finalY + 20, { align: 'center' });
      doc.save(`Receipt_${payment.transactionid}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleUpdateStatus = async () => {
    setIsUpdating(true);
    setUpdateSuccess(false);
    try {
      const response = await fetch("/api/payments-history/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: payment.id, status }),
      });
      const result = await response.json();
      if (result.success) {
        setUpdateSuccess(true);
        if (onStatusUpdate) onStatusUpdate(status);
        setTimeout(() => setUpdateSuccess(false), 3000);
      } else {
        alert("Error: " + result.error);
      }
    } catch {
      alert("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleKeywordUpload = async () => {
    if (!keywordFile) return;
    setIsDelivering(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64PDF = reader.result as string;
        const response = await fetch("/api/deliver-keywords", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            payment_id: payment.id,
            keyword_pdf: base64PDF
          })
        });
        const result = await response.json();
        if (result.success) {
          alert("Keywords delivered successfully!");
          setKeywordFile(null);
          fetchDeliveryHistory();
        } else {
          alert("Error: " + result.error);
        }
      };
      reader.readAsDataURL(keywordFile);
    } catch {
      alert("Failed to upload keywords");
    } finally {
      setIsDelivering(false);
    }
  };

  const handleDeleteKeyword = async (deliveryId: number) => {
    if (!window.confirm("Are you sure you want to delete this keyword delivery?")) return;
    
    setDeletingId(deliveryId);
    try {
      const response = await fetch(`/api/deliver-keywords?id=${deliveryId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      
      if (result.success) {
        setDeliveryRecords(prev => prev.filter(record => record.id !== deliveryId));
      } else {
        alert("Error: " + result.error);
      }
    } catch {
      alert("Failed to delete keyword delivery");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
      {/* Premium Header */}
      <div className="relative px-8 py-10 bg-brand-600 text-white shrink-0">
        <div className="absolute top-0 right-0 p-8 opacity-5">
            <CreditCard size={120} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-[10px] font-black uppercase tracking-widest text-white mb-2">
               <ShieldCheck size={14} />
               Secure Record
            </div>
            <h4 className="text-3xl font-black tracking-tight leading-none italic">
                {parseFloat(payment.amount).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
            </h4>
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest mt-1">Logged on {new Date(payment.timestamp).toLocaleDateString()}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleDownloadPDF} 
              disabled={isGeneratingPDF}
              className="flex items-center gap-3 px-6 py-3 bg-white text-brand-600 hover:bg-gray-50 transition-all rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg disabled:opacity-50"
            >
              {isGeneratingPDF ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              {isGeneratingPDF ? "..." : "Receipt"}
            </button>
          </div>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Customer & Payment */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-6">
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 flex items-center gap-2">
              <Hash size={14} />
              Customer Details
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {[
                 { icon: Mail, label: "Email", value: payment.email },
                 { icon: Phone, label: "Phone", value: payment.phonenumber },
                 { icon: Globe, label: "Country", value: payment.country },
                 { icon: Calendar, label: "Date", value: new Date(payment.timestamp).toLocaleDateString() }
               ].map((item, i) => (
                 <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-white/5">
                   <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0">
                     <item.icon size={18} />
                   </div>
                   <div className="flex flex-col overflow-hidden">
                     <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{item.label}</span>
                     <span className="text-sm font-bold text-gray-900 dark:text-white truncate">{item.value || "N/A"}</span>
                   </div>
                 </div>
               ))}
            </div>
          </div>

          <div className="space-y-6">
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 flex items-center gap-2">
              <FileUp size={14} />
              Deliver Keywords (PDF)
            </h5>
            
            {payment?.form_status !== 1 && (
               <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 animate-pulse mb-4">
                  <AlertCircle size={20} className="shrink-0" />
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black uppercase tracking-widest leading-none">Form Not Filled</span>
                     <p className="text-[9px] font-bold uppercase tracking-tighter mt-1 opacity-80">Delivery is blocked until user completes the required protocol form</p>
                  </div>
               </div>
            )}

            <div className={`p-6 rounded-3xl ${payment?.form_status === 1 ? "bg-brand-500/[0.03] border-brand-500/20" : "bg-gray-100/50 border-gray-200 opacity-60 grayscale"} border-2 border-dashed flex flex-col items-center gap-5 transition-all`}>
               <div className="w-16 h-16 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500">
                  <FileUp size={32} />
               </div>
               <div className="text-center">
                  <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Select Keyword PDF</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Maximum size 5MB • PDF Only</p>
               </div>
               <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={(e) => setKeywordFile(e.target.files?.[0] || null)}
                  className="hidden" 
                  id="keyword-upload"
               />
               <label 
                  htmlFor="keyword-upload"
                  className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl ${
                    payment?.form_status === 1 
                      ? "bg-white dark:bg-gray-800 border-brand-500/30 text-brand-500 cursor-pointer hover:bg-brand-500 hover:text-white shadow-brand-500/5" 
                      : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
               >
                  {keywordFile ? keywordFile.name : "Choose File"}
               </label>
               {keywordFile && (
                   <button 
                    onClick={handleKeywordUpload}
                    disabled={isDelivering || payment?.form_status !== 1}
                    className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {isDelivering ? <Loader2 size={18} className="animate-spin" /> : <FileCheck size={18} />}
                    {isDelivering ? "Delivering..." : "Deliver Now"}
                  </button>
               )}
            </div>

            {/* Delivery History */}
            <div className="space-y-4">
               <h6 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Delivery History</h6>
               {deliveryRecords.length > 0 ? (
                  <div className="space-y-3">
                     {deliveryRecords.map((delivery) => (
                        <div key={delivery.id} className="flex items-center justify-between p-4 rounded-2xl bg-green-500/5 border border-green-500/20">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center">
                                 <FileCheck size={16} />
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-tight">Keywords Delivered</span>
                                 <span className="text-[10px] text-gray-500 font-bold">{new Date(delivery.created_at).toLocaleString()}</span>
                              </div>
                           </div>
                           <div className="flex items-center gap-3">
                              <a 
                                 href={delivery.keyword_upload} 
                                 download={`Keywords_${payment.transactionid}.pdf`}
                                 className="text-brand-500 hover:text-brand-600 transition-colors"
                                 title="Download PDF"
                              >
                                 <Download size={16} />
                              </a>
                              <button
                                 onClick={() => handleDeleteKeyword(delivery.id)}
                                 disabled={deletingId === delivery.id}
                                 className="text-red-400 hover:text-red-500 transition-colors disabled:opacity-50"
                                 title="Delete Delivery"
                              >
                                 {deletingId === delivery.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
               ) : !isLoadingDeliveries && (
                  <p className="text-[10px] text-gray-400 italic font-bold uppercase tracking-widest">No keywords delivered yet</p>
               )}
            </div>
          </div>
        </div>

        {/* Right Column: Management & Proof */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-6">
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 flex items-center gap-2">
              <CreditCard size={14} />
              Management
            </h5>
            <div className="space-y-4">
              <div className="p-6 rounded-3xl bg-gray-900 text-white border border-white/5 shadow-2xl">
                <div className="flex flex-col gap-5">
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-[10px] text-white/50 uppercase tracking-widest font-black">TXN ID</span>
                    <span className="text-xs font-mono font-bold text-brand-400">{payment.transactionid}</span>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <span className="text-[10px] text-white/50 uppercase tracking-widest font-black">Status Control</span>
                    <div className="flex items-center gap-2">
                      <select 
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none appearance-none"
                      >
                        <option value="PENDING" className="bg-gray-900 text-white">PENDING</option>
                        <option value="COMPLETED" className="bg-gray-900 text-white">COMPLETED</option>
                        <option value="FAILED" className="bg-gray-900 text-white">FAILED</option>
                        <option value="REFUNDED" className="bg-gray-900 text-white">REFUNDED</option>
                      </select>
                      <button 
                        onClick={handleUpdateStatus}
                        disabled={isUpdating || status === payment.payment_status}
                        className={`p-3 rounded-xl transition-all ${
                          updateSuccess ? "bg-green-500" : "bg-brand-500 hover:bg-brand-600"
                        } text-white disabled:opacity-30`}
                      >
                        {isUpdating ? <Loader2 size={18} className="animate-spin" /> : updateSuccess ? <CheckCircle2 size={18} /> : <Save size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {payment.screenshot_url && (
                <div className="relative group/img overflow-hidden rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 aspect-video flex items-center justify-center cursor-zoom-in" onClick={() => setIsLightboxOpen(true)}>
                  <Image 
                    src={payment.screenshot_url} 
                    alt="Payment Proof" 
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="p-3 bg-white text-gray-900 rounded-full shadow-2xl scale-0 group-hover:scale-100 transition-transform">
                          <ExternalLink size={20} />
                      </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        className="max-w-[90vw] max-h-[90vh] p-0 bg-transparent border-none shadow-none"
      >
         <div className="flex flex-col items-center gap-6">
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/10 max-h-[80vh]">
              {payment.screenshot_url && (
                <Image 
                  src={payment.screenshot_url} 
                  alt="Payment Proof Full View"
                  width={800}
                  height={600}
                  className="max-w-full max-h-full object-contain" 
                />
              )}
            </div>
            <button 
               onClick={() => setIsLightboxOpen(false)}
               className="px-8 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all"
            >
               Close Preview
            </button>
         </div>
      </Modal>

      <div className="px-8 py-6 bg-gray-50 dark:bg-gray-800/20 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between mt-auto">
         <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Transaction Record Active</span>
         </div>
         <span className="text-[10px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-[0.2em]">DELIVERY-CORE-V1</span>
      </div>
    </div>
  );
}
