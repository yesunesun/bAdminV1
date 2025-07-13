// src/modules/owner/components/property/wizard/sections/PropertySummary/components/fields/__tests__/FieldTime.test.tsx
// Version: 1.0.0
// Last Modified: 13-07-2025
// Purpose: Test cases for FieldTime component 12-hour format conversion

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FieldTime } from '../FieldTime';

describe('FieldTime Component', () => {
  it('converts 24-hour format to 12-hour format correctly', () => {
    const testCases = [
      { input: '00:00', expected: '12:00 AM' },
      { input: '01:30', expected: '1:30 AM' },
      { input: '12:00', expected: '12:00 PM' },
      { input: '13:45', expected: '1:45 PM' },
      { input: '18:30', expected: '6:30 PM' },
      { input: '23:59', expected: '11:59 PM' },
    ];

    testCases.forEach(({ input, expected }) => {
      const { unmount } = render(<FieldTime label="Test Time" value={input} />);
      expect(screen.getByText(expected)).toBeInTheDocument();
      unmount();
    });
  });

  it('handles missing or invalid time values', () => {
    const { container } = render(<FieldTime label="Test Time" value="" />);
    expect(container.firstChild).toBeNull();

    const { container: container2 } = render(<FieldTime label="Test Time" value={undefined} />);
    expect(container2.firstChild).toBeNull();
  });

  it('renders correctly with valid time', () => {
    render(<FieldTime label="Gate closing time" value="18:30" />);
    
    expect(screen.getByText('Gate closing time')).toBeInTheDocument();
    expect(screen.getByText('6:30 PM')).toBeInTheDocument();
  });
});