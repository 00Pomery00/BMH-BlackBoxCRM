import React, { useState } from 'react';

export default function DataTable({ columns = [], rows = [], pageSize = 10 }) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const start = page * pageSize;
  const pageRows = rows.slice(start, start + pageSize);

  return (
    <div>
      <div className="card overflow-auto">
        <table className="min-w-full divide-y">
          <thead className="text-left text-sm text-gray-600">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="px-3 py-2">
                  {c.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm text-gray-800">
            {pageRows.map((r, i) => (
              <tr key={start + i} className="border-t">
                {columns.map((c) => (
                  <td key={c.key} className="px-3 py-2">
                    {c.render ? c.render(r) : r[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
        <div>Rows: {rows.length}</div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 border rounded"
            onClick={() => setPage(0)}
            disabled={page === 0}
          >
            First
          </button>
          <button
            className="px-3 py-1 border rounded"
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
          >
            Prev
          </button>
          <span>
            Page {page + 1} / {totalPages}
          </span>
          <button
            className="px-3 py-1 border rounded"
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
          >
            Next
          </button>
          <button
            className="px-3 py-1 border rounded"
            onClick={() => setPage(totalPages - 1)}
            disabled={page >= totalPages - 1}
          >
            Last
          </button>
        </div>
      </div>
    </div>
  );
}
