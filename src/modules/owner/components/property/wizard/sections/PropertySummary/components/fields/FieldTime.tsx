// src/modules/owner/components/property/wizard/sections/PropertySummary/components/fields/FieldTime.tsx
// Version: 1.0.0
// Last Modified: 13-07-2025 
// Purpose: Field component for time values with 12-hour format display

import React from 'react';

interface FieldTimeProps {
  label: string;
  value?: string;
  className?: string;
}

// Utility function to convert 24-hour time to 12-hour format
const formatTimeTo12Hour = (time24: string): string => {
  if (!time24 || !time24.includes(':')) {
    return time24;
  }

  const [hours, minutes] = time24.split(':');
  const hour24 = parseInt(hours, 10);
  const minute = minutes || '00';

  if (isNaN(hour24) || hour24 < 0 || hour24 > 23) {
    return time24; // Return original if invalid
  }

  let hour12 = hour24;
  const ampm = hour24 >= 12 ? 'PM' : 'AM';

  if (hour24 === 0) {
    hour12 = 12; // 00:xx becomes 12:xx AM
  } else if (hour24 > 12) {
    hour12 = hour24 - 12; // 13:xx becomes 1:xx PM
  }

  return `${hour12}:${minute} ${ampm}`;
};

export const FieldTime: React.FC<FieldTimeProps> = ({
  label,
  value,
  className = ""
}) => {
  // Don't render if no value
  if (value === undefined || value === null || value === '') {
    return null;
  }
  
  const formattedTime = formatTimeTo12Hour(value);
  
  return (
    <div className={`flex justify-between py-2 border-b border-gray-100 ${className}`}>
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900 font-medium">{formattedTime}</dd>
    </div>
  );
};