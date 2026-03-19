import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import PaymentHistoryTable from "@/components/payment/PaymentHistoryTable";

export const metadata: Metadata = {
  title: "Payment History | TailAdmin - Next.js Dashboard Template",
  description: "Payment History page for TailAdmin Dashboard",
};

export default function PaymentHistoryPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Payment History" />
      
      <div className="grid grid-cols-1 gap-6">
        <PaymentHistoryTable />
      </div>
    </div>
  );
}
