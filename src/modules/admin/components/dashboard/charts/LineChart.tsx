// src/modules/admin/components/dashboard/charts/LineChart.tsx

import React from 'react';

interface LineChartProps {
  data: Array<{
    label: string;
    value: number;
  }>;
  title?: string;
  className?: string;
  width?: number;
  height?: number;
  color?: string;
  showGrid?: boolean;
  showPoints?: boolean;
}

export default function LineChart({ 
  data, 
  title, 
  className = '', 
  width = 400,
  height = 200,
  color = '#3b82f6',
  showGrid = true,
  showPoints = true
}: LineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`p-4 ${className}`}>
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        )}
        <div className="flex items-center justify-center" style={{ height }}>
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }
  
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  
  const maxValue = Math.max(...data.map(item => item.value));
  const minValue = Math.min(...data.map(item => item.value));
  const valueRange = maxValue - minValue || 1;
  
  // Calculate points
  const points = data.map((item, index) => {
    const x = padding + (index / Math.max(data.length - 1, 1)) * chartWidth;
    const y = padding + chartHeight - ((item.value - minValue) / valueRange) * chartHeight;
    return { x, y, ...item };
  });
  
  // Create path for line
  const pathData = points.reduce((path, point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${path} ${command} ${point.x} ${point.y}`;
  }, '');
  
  // Grid lines
  const gridLines = showGrid ? (
    <g className="opacity-20">
      {/* Horizontal grid lines */}
      {Array.from({ length: 5 }, (_, i) => {
        const y = padding + (i / 4) * chartHeight;
        return (
          <line
            key={`h-${i}`}
            x1={padding}
            y1={y}
            x2={width - padding}
            y2={y}
            stroke="#6b7280"
            strokeWidth="1"
          />
        );
      })}
      {/* Vertical grid lines */}
      {Array.from({ length: Math.min(data.length, 6) }, (_, i) => {
        const x = padding + (i / Math.max(Math.min(data.length, 6) - 1, 1)) * chartWidth;
        return (
          <line
            key={`v-${i}`}
            x1={x}
            y1={padding}
            x2={x}
            y2={height - padding}
            stroke="#6b7280"
            strokeWidth="1"
          />
        );
      })}
    </g>
  ) : null;
  
  return (
    <div className={`p-4 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      
      <div className="relative">
        <svg width={width} height={height} className="border rounded">
          {gridLines}
          
          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-sm"
          />
          
          {/* Points */}
          {showPoints && points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill={color}
              stroke="white"
              strokeWidth="2"
              className="hover:r-6 transition-all cursor-pointer"
              title={`${point.label}: ${point.value}`}
            />
          ))}
          
          {/* Y-axis labels */}
          {Array.from({ length: 5 }, (_, i) => {
            const value = minValue + (i / 4) * valueRange;
            const y = padding + chartHeight - (i / 4) * chartHeight;
            return (
              <text
                key={i}
                x={padding - 10}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                className="text-xs fill-gray-600"
              >
                {Math.round(value)}
              </text>
            );
          })}
          
          {/* X-axis labels */}
          {data.map((item, index) => {
            if (index % Math.ceil(data.length / 6) === 0 || index === data.length - 1) {
              const point = points[index];
              return (
                <text
                  key={index}
                  x={point.x}
                  y={height - padding + 20}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                >
                  {item.label}
                </text>
              );
            }
            return null;
          })}
        </svg>
      </div>
      
      {/* Data summary */}
      <div className="mt-4 flex justify-between text-xs text-gray-500">
        <span>Min: {minValue}</span>
        <span>Max: {maxValue}</span>
        <span>Points: {data.length}</span>
      </div>
    </div>
  );
}