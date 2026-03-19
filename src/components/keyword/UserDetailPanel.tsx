"use client";
import React, { useState, useEffect } from "react";
import { User, ShieldCheck, Mail, MapPin, Calendar, DollarSign, FileText, CheckCircle2, Package, Download, ExternalLink } from "lucide-react";

interface UserDetailPanelProps {
  user: any;
  onUploadReport: (data: any) => void;
}

const UserDetailPanel: React.FC<UserDetailPanelProps> = ({ user, onUploadReport }) => {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDeliveries = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/deliver-keywords?user_email=${encodeURIComponent(user.useremail || user.username)}`);
        const data = await res.json();
        if (data.success) {
          setDeliveries(data.data || []);
        }
      } catch (error) {
        console.error("Fetch deliveries error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchDeliveries();
  }, [user]);

  if (!user) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-brand-500/20 mb-4">
                {user.username.charAt(0)}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">{user.username}</h3>
              <p className="text-[10px] font-black text-brand-500 bg-brand-500/10 px-3 py-1 rounded-full mt-2 uppercase tracking-widest">Active Partner</p>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-50 dark:border-gray-800">
              <div className="flex items-center gap-3 text-xs">
                <Mail size={16} className="text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400 truncate font-bold uppercase tracking-tight">{user.useremail || "N/A"}</span>
              </div>
              {user.phonenumber && (
                <div className="flex items-center gap-3 text-xs">
                  <Package size={16} className="text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400 font-bold">{user.phonenumber}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-xs">
                <ShieldCheck size={16} className="text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400 font-bold">UID: {user.user_id || "GUEST"}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-brand-500/5 rounded-xl border border-brand-500/10">
                 <span className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest">Total Deliveries</span>
                 <span className="text-xs font-black text-brand-500">{deliveries.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
            <h4 className="text-xs font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2 uppercase tracking-widest">
              <Package size={18} className="text-brand-500" />
              Delivery Status
            </h4>
            <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 text-center">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Last Update</p>
               <p className="text-xs font-bold text-gray-900 dark:text-white">
                  {deliveries.length > 0 ? new Date(deliveries[0].created_at).toLocaleDateString() : "No Deliveries"}
               </p>
            </div>
          </div>
        </div>

        {/* History Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm h-full">
            <h4 className="text-sm font-black text-gray-900 dark:text-white mb-8 flex items-center justify-between uppercase tracking-widest">
              <span className="flex items-center gap-3">
                <FileText size={20} className="text-brand-500" />
                Keyword Delivery History
              </span>
            </h4>
            
            <div className="space-y-4">
              {isLoading ? (
                <div className="py-20 flex flex-col items-center gap-4">
                   <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Syncing with AWS RDS...</p>
                </div>
              ) : deliveries.length === 0 ? (
                 <div className="py-20 text-center flex flex-col items-center gap-4 bg-gray-50 dark:bg-white/[0.01] rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                    <Package size={48} className="text-gray-200 dark:text-gray-800" />
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No delivery record for this account</p>
                 </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {deliveries.map((delivery, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-gray-50 dark:bg-white/[0.02] hover:bg-brand-500/[0.02] rounded-3xl transition-all border border-gray-100 dark:border-gray-800 group">
                      <div className="flex items-center gap-4 mb-4 md:mb-0">
                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-900 shadow-sm flex items-center justify-center text-brand-500 border border-gray-100 dark:border-gray-700 group-hover:scale-110 transition-transform">
                          <FileText size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Keyword Package Delivered</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                             <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1">
                                <Calendar size={12} /> {new Date(delivery.created_at).toLocaleDateString()}
                             </p>
                             <p className="text-[10px] text-brand-500 font-bold uppercase tracking-widest flex items-center gap-1">
                                <DollarSign size={12} /> {delivery.payment_amount} USD
                             </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="flex flex-col items-end mr-3">
                            <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Successful Sync</span>
                            <span className="text-[9px] font-mono text-gray-400">TRX: {delivery.transaction_id}</span>
                         </div>
                         <a 
                           href={delivery.keyword_upload} 
                           download={`Keywords_${delivery.transaction_id}.pdf`}
                           className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20"
                         >
                           <Download size={18} />
                         </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailPanel;
