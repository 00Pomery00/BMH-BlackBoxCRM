import React from 'react';

export default function Dropdown({ options = [], value, onChange, placeholder = 'Select...' }) {
  return (
    <select
      className="block w-full rounded border border-gray-300 px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
