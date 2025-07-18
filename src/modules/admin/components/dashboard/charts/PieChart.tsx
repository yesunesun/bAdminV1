// src/modules/admin/components/dashboard/charts/PieChart.tsx

import React from 'react';

interface PieChartProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  title?: string;
  className?: string;
  size?: number;
  showLegend?: boolean;
}

export default function PieChart({ 
  data, 
  title, 
  className = '', 
  size = 200,
  showLegend = true 
}: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = size / 2 - 10;
  const center = size / 2;
  
  let cumulativePercentage = 0;
  
  const slices = data.map((item, index) => {
    const percentage = total > 0 ? item.value / total : 0;
    const angle = percentage * 360;
    const startAngle = cumulativePercentage * 360 - 90; // -90 to start from top
    const endAngle = startAngle + angle;
    
    cumulativePercentage += percentage;
    
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const x1 = center + radius * Math.cos(startAngleRad);
    const y1 = center + radius * Math.sin(startAngleRad);
    const x2 = center + radius * Math.cos(endAngleRad);
    const y2 = center + radius * Math.sin(endAngleRad);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const pathData = [
      `M ${center} ${center}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');
    
    const color = item.color || `hsl(${(index * 137.5) % 360}, 70%, 50%)`;
    
    return {
      ...item,
      pathData,
      color,
      percentage: Math.round(percentage * 100)
    };
  });
  
  if (total === 0) {
    return (
      <div className={`p-4 ${className}`}>
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        )}
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`p-4 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      
      <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-6">
        {/* Pie Chart SVG */}
        <div className="flex-shrink-0">
          <svg width={size} height={size} className="transform rotate-0">
            {slices.map((slice, index) => (
              <path
                key={index}
                d={slice.pathData}
                fill={slice.color}
                stroke="white"
                strokeWidth="2"
                className="hover:opacity-80 transition-opacity cursor-pointer"
                title={`${slice.label}: ${slice.value} (${slice.percentage}%)`}
              />
            ))}
          </svg>
        </div>
        
        {/* Legend */}
        {showLegend && (
          <div className="flex-1 space-y-2">
            {slices.map((slice, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: slice.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {slice.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {slice.value} ({slice.percentage}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}