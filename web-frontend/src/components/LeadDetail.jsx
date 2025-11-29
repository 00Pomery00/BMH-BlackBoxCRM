import React from 'react';
import { useTranslation } from 'react-i18next';


export default function LeadDetail({ lead, onClose, onDelete }) {
  const { t } = useTranslation();
  const [edit, setEdit] = React.useState(false);
  const [form, setForm] = React.useState(lead);
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

  React.useEffect(() => {
    setForm(lead);
    setEdit(false);
    try { window.__LAST_MODAL = lead; } catch (e) {}
  }, [lead]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === 'lead_score' ? Number(value) : value }));
  }

  function handleSave() {
    // Demo: pouze lokální změna, v reálné app by se volalo API
    Object.assign(lead, form);
    setEdit(false);
  }

  const [confirmDelete, setConfirmDelete] = React.useState(false);
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
            <h2 id="lead-title" data-testid="lead-modal-heading" className="text-xl font-semibold">
              {edit ? (
                <input name="name" value={form.name} onChange={handleChange} className="border rounded px-2 py-1 text-base" />
              ) : (
                lead.name
              )}
            </h2>
            <div className="text-sm text-gray-600">
              {edit ? (
                <input name="lead_score" type="number" value={form.lead_score} onChange={handleChange} className="border rounded px-2 py-1 w-16" />
              ) : (
                t('score_label', { value: lead.lead_score })
              )}
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
          {edit ? (
            <textarea name="description" value={form.description || ''} onChange={handleChange} className="border rounded px-2 py-1 w-full min-h-[60px]" />
          ) : (
            <p id="lead-desc" className="text-sm text-gray-700 mt-2">
              {lead.description || t('no_description')}
            </p>
          )}
        </div>

        <div className="mt-6 flex gap-2 flex-wrap">
          {!edit && !confirmDelete && (
            <>
              <button className="px-4 py-2 bg-green-600 text-white rounded">
                {t('create_opportunity')}
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded">{t('send_email')}</button>
              <button onClick={() => setEdit(true)} className="px-4 py-2 bg-yellow-500 text-white rounded">
                {t('edit') || 'Upravit'}
              </button>
              <button onClick={() => setConfirmDelete(true)} className="px-4 py-2 bg-red-500 text-white rounded">
                {t('delete') || 'Smazat'}
              </button>
            </>
          )}
          {edit && (
            <>
              <button onClick={handleSave} className="px-4 py-2 bg-violet-600 text-white rounded">
                {t('save')}
              </button>
              <button onClick={() => { setEdit(false); setForm(lead); }} className="px-4 py-2 border rounded">
                {t('cancel')}
              </button>
            </>
          )}
          {confirmDelete && (
            <>
              <span className="text-red-600 font-semibold self-center">{t('confirm_delete', 'Opravdu smazat?')}</span>
              <button onClick={() => { onDelete && onDelete(lead.id); setConfirmDelete(false); }} className="px-4 py-2 bg-red-600 text-white rounded">{t('delete') || 'Smazat'}</button>
              <button onClick={() => setConfirmDelete(false)} className="px-4 py-2 border rounded">{t('cancel')}</button>
            </>
          )}
          <button onClick={onClose} className="px-4 py-2 border rounded">
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
}
