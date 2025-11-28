import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LeadDetail({ lead, onClose }) {
  const { t } = useTranslation();
  if (!lead) return null;
  React.useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const closeRef = React.useRef(null);

  React.useEffect(() => {
    // focus the close button when modal opens
    if (closeRef.current) closeRef.current.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-11/12 sm:w-2/3 md:w-1/2 p-6 shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-title"
        aria-describedby="lead-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start">
          <div>
            <h2 id="lead-title" className="text-xl font-semibold">
              {lead.name}
            </h2>
            <div className="text-sm text-gray-600">
              {t('score_label', { value: lead.lead_score })}
            </div>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded"
            aria-label={t('close')}
          >
            ✕
          </button>
        </div>

        <div className="mt-4">
          <h3 className="font-medium">{t('details')}</h3>
          <p id="lead-desc" className="text-sm text-gray-700 mt-2">
            {lead.description || t('no_description')}
          </p>
        </div>

        <div className="mt-6 flex gap-2">
          <button className="px-4 py-2 bg-green-600 text-white rounded">
            {t('create_opportunity')}
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded">{t('send_email')}</button>
          <button onClick={onClose} className="px-4 py-2 border rounded">
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
}
