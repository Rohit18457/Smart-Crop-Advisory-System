/**
 * Reusable DataTable Component
 * Features: search, pagination, sortable columns, empty state.
 */
import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const DataTable = ({ data = [], columns = [], searchKeys = [], pageSize = 20, searchPlaceholder = 'Search...', emptyMessage = 'No data found', emptyIcon: EmptyIcon = Search, actions }) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(row => searchKeys.some(key => String(row[key] ?? '').toLowerCase().includes(q)));
  }, [data, search, searchKeys]);

  const sorted = useMemo(() => {
    if (!sortCol) return filtered;
    return [...filtered].sort((a, b) => {
      const aV = a[sortCol] ?? '', bV = b[sortCol] ?? '';
      const cmp = typeof aV === 'number' ? aV - bV : String(aV).localeCompare(String(bV));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageData = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder={searchPlaceholder} className="input-field pl-10 !py-2.5 text-sm" />
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="overflow-x-auto rounded-xl border border-surface-200 dark:border-surface-700">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="bg-surface-50 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
              {columns.map(col => (
                <th key={col.key} onClick={() => col.sortable !== false && (sortCol === col.key ? setSortDir(d => d === 'asc' ? 'desc' : 'asc') : (setSortCol(col.key), setSortDir('asc')))} className={`text-left py-3 px-4 text-xs font-bold text-surface-500 uppercase tracking-wider ${col.sortable !== false ? 'cursor-pointer hover:text-surface-700 select-none' : ''}`}>
                  {col.label} {sortCol === col.key && <span className="text-primary-500">{sortDir === 'asc' ? '↑' : '↓'}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.length > 0 ? pageData.map((row, idx) => (
              <tr key={row.id || idx} className="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                {columns.map(col => (
                  <td key={col.key} className="py-3 px-4 text-sm text-surface-700 dark:text-surface-300">
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            )) : (
              <tr><td colSpan={columns.length} className="py-16 text-center">
                <EmptyIcon className="h-10 w-10 text-surface-300 mx-auto mb-3" />
                <p className="text-surface-500 font-medium">{emptyMessage}</p>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
      {sorted.length > pageSize && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-surface-500">Showing {((safePage-1)*pageSize)+1}–{Math.min(safePage*pageSize, sorted.length)} of {sorted.length}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(1)} disabled={safePage===1} className="p-2 rounded-lg hover:bg-surface-100 disabled:opacity-30"><ChevronsLeft className="h-4 w-4" /></button>
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={safePage===1} className="p-2 rounded-lg hover:bg-surface-100 disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
            <span className="px-3 py-1 text-sm font-medium">{safePage} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={safePage===totalPages} className="p-2 rounded-lg hover:bg-surface-100 disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
            <button onClick={() => setPage(totalPages)} disabled={safePage===totalPages} className="p-2 rounded-lg hover:bg-surface-100 disabled:opacity-30"><ChevronsRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
