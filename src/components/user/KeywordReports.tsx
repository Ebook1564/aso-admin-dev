"use client";
import React, { useState, useEffect } from "react";
import { FileText, Download, Clock, ExternalLink, Search, CheckCircle2 } from "lucide-react";

const KeywordReports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        // Simulating current user ID = 1
        const userId = 1;
        const res = await fetch(`/api/keyword/user-reports?userId=${userId}`);
        const data = await res.json();
        if (data.success) {
          setReports(data.data);
        }
      } catch (error) {
        console.error("Fetch reports error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  const filteredReports = reports.filter(report => 
    report.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (report.payment_id && report.payment_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (report.payment_plan && report.payment_plan.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText size={20} className="text-brand-500" />
            Keyword Reports
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Access reports linked to your payments</p>
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search reports or payments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-10 pr-4 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-gray-500 animate-pulse">Fetching your reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-300 mb-4">
              <FileText size={32} />
            </div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">No reports found</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[200px]">Reports linked to your payments will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {filteredReports.map((report) => (
              <div key={report.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-all group gap-4">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500 shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <FileText size={24} />
                  </div>
                  <div className="flex flex-col gap-1 overflow-hidden">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-brand-500 transition-colors">
                      {report.file_name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(report.created_at).toLocaleDateString()}
                      </span>
                      {report.payment_id && (
                        <>
                          <span>•</span>
                          <span className="text-brand-500 flex items-center gap-1">
                            <CheckCircle2 size={12} className="text-brand-500" />
                            {report.payment_plan} (#{report.payment_id})
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <a 
                    href={report.pdf_url} 
                    download
                    className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-[11px] font-bold rounded-xl shadow-lg shadow-brand-500/20 transition-all hover:-translate-y-0.5"
                  >
                    <Download size={14} />
                    <span>DOWNLOAD</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-50 dark:bg-gray-950/50 border-t border-gray-50 dark:border-gray-800 text-center">
        <button className="text-[10px] font-bold text-gray-400 hover:text-brand-500 transition-colors uppercase tracking-[0.2em]">
          Request Custom Analysis
        </button>
      </div>
    </div>
  );
};

export default KeywordReports;
