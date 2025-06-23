import React from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  selectedRows?: string[];
  onRowSelect?: (id: string) => void;
  onSelectAll?: () => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

function Table<T>({
  columns,
  data,
  keyExtractor,
  onSort,
  sortColumn,
  sortDirection,
  selectedRows = [],
  onRowSelect,
  onSelectAll,
  isLoading = false,
  emptyMessage = 'No data available',
}: TableProps<T>) {
  const showSelection = Boolean(onRowSelect);
  const allSelected = data.length > 0 && selectedRows.length === data.length;

  const handleSort = (key: string) => {
    if (!onSort) return;

    const newDirection =
      sortColumn === key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(key, newDirection);
  };

  const renderSortIcon = (column: Column<T>) => {
    if (!column.sortable) return null;

    if (sortColumn === column.key) {
      return sortDirection === 'asc' ? (
        <ChevronUp className="w-4 h-4" />
      ) : (
        <ChevronDown className="w-4 h-4" />
      );
    }

    return <ChevronsUpDown className="w-4 h-4 text-gray-400" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="w-8 h-8 border-t-2 border-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="min-h-[200px] flex items-center justify-center text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {showSelection && (
              <th scope="col" className="w-12 px-6 py-3">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  checked={allSelected}
                  onChange={onSelectAll}
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  column.width || ''
                }`}
              >
                {column.sortable ? (
                  <button
                    className="group inline-flex items-center space-x-1 hover:text-gray-900"
                    onClick={() => handleSort(column.key)}
                  >
                    <span>{column.header}</span>
                    {renderSortIcon(column)}
                  </button>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => {
            const id = keyExtractor(item);
            const isSelected = selectedRows.includes(id);

            return (
              <tr
                key={id}
                className={`${
                  isSelected ? 'bg-primary-50' : 'hover:bg-gray-50'
                }`}
              >
                {showSelection && (
                  <td className="w-12 px-6 py-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      checked={isSelected}
                      onChange={() => onRowSelect?.(id)}
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td
                    key={`${id}-${column.key}`}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {column.render
                      ? column.render(item)
                      : (item as any)[column.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Table; 