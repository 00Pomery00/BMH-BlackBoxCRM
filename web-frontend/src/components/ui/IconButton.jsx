import React from 'react';

export default function IconButton({ icon, label, onClick, title }) {
  return (
    <button
      className="inline-flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      onClick={onClick}
      title={title || label}
    >
      {icon}
      {label ? <span className="text-sm text-gray-700">{label}</span> : null}
    </button>
  );
}
