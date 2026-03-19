"use client";
import React, { useState, useEffect } from "react";
import { GroupIcon, DollarLineIcon } from "@/icons";
import StatCard from "../ui/card/StatCard";

interface DashboardMetrics {
  todayLogin: number;
  totalLogin: number;
  monthlyRevenue: number;
  activeUsers: number;
}

export const EcommerceMetrics = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    todayLogin: 0,
    totalLogin: 0,
    monthlyRevenue: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch("/api/dashboard/metrics", {
          cache: 'no-store'
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setMetrics(data.data);
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
      <StatCard
        title="Today Login"
        value={loading ? "..." : formatNumber(metrics.todayLogin)}
        icon={<GroupIcon className="size-6" />}
        trend={{ value: "Daily", label: "Refresh", color: "success" }}
      />

      <StatCard
        title="Total Login"
        value={loading ? "..." : formatNumber(metrics.totalLogin)}
        icon={<GroupIcon className="size-6" />}
        trend={{ value: "All", label: "Users", color: "info" }}
      />

      <StatCard
        title="Monthly Revenue"
        value={loading ? "..." : formatCurrency(metrics.monthlyRevenue)}
        icon={<DollarLineIcon className="size-6" />}
        trend={{ value: "Target", label: "Goal", color: "success" }}
      />

      <StatCard
        title="Active Users"
        value={loading ? "..." : formatNumber(metrics.activeUsers)}
        icon={<GroupIcon className="size-6" />}
        trend={{ value: "Active", label: "Now", color: "warning" }}
      />
    </div>
  );
};
