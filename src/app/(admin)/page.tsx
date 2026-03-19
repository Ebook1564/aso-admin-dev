import type { Metadata } from "next";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import React from "react";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import KeywordReports from "@/components/user/KeywordReports";
import CreatedUserDataTable from "@/components/tables/CreatedUserDataTable";

export const metadata: Metadata = {
  title:
    "Next.js E-commerce Dashboard | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Home for TailAdmin Dashboard Template",
};

export default function Ecommerce() {
  return (
    <div className="space-y-6">
      {/* Metrics Section */}
      <section>
        <EcommerceMetrics />
      </section>

      {/* Main Analytics Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 xl:col-span-8">
          <MonthlySalesChart />
        </div>
        
        <div className="lg:col-span-5 xl:col-span-4">
          <KeywordReports />
        </div>
      </section>

      {/* User Data Section */}
      <section>
        <CreatedUserDataTable />
      </section>
    </div>
  );
}
