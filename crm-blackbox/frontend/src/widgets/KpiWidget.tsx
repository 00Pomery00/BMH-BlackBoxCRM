import React from "react";

export interface KpiWidgetProps {
  title: string;
  value: string | number;
  trend?: number;
}

export const KpiWidget: React.FC<KpiWidgetProps> = ({ title, value, trend }) => {
  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="text-3xl font-bold">{value}</div>
      {typeof trend !== "undefined" && (
        <div className={trend > 0 ? "text-green-600" : "text-red-600"}>{trend}%</div>
      )}
    </div>
  );
};
