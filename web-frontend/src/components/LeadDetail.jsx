import React from 'react';

export default function LeadDetail({ lead, onClose }) {
  if (!lead) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-11/12 sm:w-2/3 md:w-1/2 p-6 shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold">{lead.name}</h2>
            <div className="text-sm text-gray-600">Score: {lead.lead_score}</div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="mt-4">
          <h3 className="font-medium">Details</h3>
          <p className="text-sm text-gray-700 mt-2">
            {lead.description || 'No description available.'}
          </p>
        </div>

        <div className="mt-6 flex gap-2">
          <button className="px-4 py-2 bg-green-600 text-white rounded">Create Opportunity</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded">Send Email</button>
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
