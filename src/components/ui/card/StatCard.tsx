"use client";
import React from "react";
import Badge from "../badge/Badge";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    label: string;
    color: "success" | "error" | "warning" | "info";
  };
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  className = "",
}) => {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-soft hover:shadow-md transition-shadow duration-300 ${className}`}
    >
      <div className="flex items-center justify-center w-12 h-12 bg-gray-50 rounded-xl dark:bg-gray-800 transition-colors duration-300">
        <div className="text-gray-800 dark:text-white/90">
          {icon}
        </div>
      </div>

      <div className="flex items-end justify-between mt-5">
        <div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </span>
          <h4 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {value}
          </h4>
        </div>

        {trend && (
          <Badge color={trend.color} size="sm" variant="light" className="mb-1">
            {trend.value}
            <span className="ml-1 hidden sm:inline">{trend.label}</span>
          </Badge>
        )}
      </div>
    </div>
  );
};

export default StatCard;
