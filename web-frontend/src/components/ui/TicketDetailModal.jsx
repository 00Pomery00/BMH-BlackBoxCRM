import React from 'react';

export default function TicketDetailModal({ ticket, onClose }) {
  if (!ticket) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded p-6 w-11/12 max-w-2xl shadow-lg">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold">
            Ticket #{ticket.id} — {ticket.title || ticket.summary}
          </h3>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600">Status</div>
            <div className="font-medium">{ticket.status || 'New'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Assigned</div>
            <div className="font-medium">{ticket.assigned_to || 'Unassigned'}</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="text-sm text-gray-600">Description</div>
          <div className="mt-2 whitespace-pre-wrap text-gray-800">
            {ticket.description || ticket.summary}
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button className="btn-secondary mr-2" onClick={onClose}>
            Close
          </button>
          <button className="btn-primary">Take action</button>
        </div>
      </div>
    </div>
  );
}
