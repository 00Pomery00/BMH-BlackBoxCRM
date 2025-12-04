import React from 'react';

function WidgetInbox({ config }) {
  return (
    <div className="bg-white p-6 rounded shadow-sm">
      <h3 className="text-lg font-medium mb-4">{config.title || 'My Inbox'}</h3>
      <div className="space-y-2">
        <div className="p-3 bg-gray-50 rounded">Selvia Devis - selviadevis@example.com</div>
        <div className="p-3 bg-gray-50 rounded">Simmons - simmons@example.com</div>
        <div className="p-3 bg-gray-50 rounded">Marvin - marvin@example.com</div>
      </div>
    </div>
  );
}

export default React.memo(WidgetInbox);
