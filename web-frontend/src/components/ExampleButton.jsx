import React from 'react';

export const ExampleButton = ({ label = 'Click me', onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      {label}
    </button>
  );
};

export default ExampleButton;
