// src/modules/admin/components/dashboard/charts/BarChart.tsx

import React from 'react';

interface BarChartProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  title?: string;
  className?: string;
  showValues?: boolean;
}

export default function BarChart({ 
  data, 
  title, 
  className = '', 
  showValues = true 
}: BarChartProps) {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div className={`p-4 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      
      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          const color = item.color || `hsl(${(index * 137.5) % 360}, 70%, 50%)`;
          
          return (
            <div key={item.label} className="flex items-center space-x-3">
              <div className="w-20 text-sm text-gray-600 text-right flex-shrink-0">
                {item.label}
              </div>
              <div className="flex-1 relative">
                <div className="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300 ease-out"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: color
                    }}
                  />
                  {showValues && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-white mix-blend-difference">
                        {item.value}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {showValues && (
                <div className="w-12 text-sm font-medium text-gray-900 text-right flex-shrink-0">
                  {item.value}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}