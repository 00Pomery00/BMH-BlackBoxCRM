import React, { useEffect, useState } from 'react';
import DataTable from './DataTable';
import TicketDetailModal from './TicketDetailModal';

export default function AdvancedDataGrid({ fetchPage }) {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.resolve(fetchPage(page, pageSize, { filter }))
      .then((res) => {
        if (!mounted) return;
        setRows(res.items || []);
        setTotal(res.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => (mounted = false);
  }, [page, pageSize, fetchPage]);

  return (
    <div>
      <div className="mb-2 flex items-center space-x-2">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter..."
          className="border rounded p-1 flex-1"
        />
        <button className="btn-primary px-3 py-1" onClick={() => setPage(1)}>
          Apply
        </button>
      </div>
      <DataTable data={rows} loading={loading} onRowClick={(r) => setSelected(r)} />
      <div className="flex items-center justify-between mt-2">
        <div className="text-sm text-gray-600">Total: {total}</div>
        <div className="space-x-2">
          <button
            className="btn-primary px-3 py-1"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <button className="btn-primary px-3 py-1" onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      </div>
      <TicketDetailModal ticket={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
