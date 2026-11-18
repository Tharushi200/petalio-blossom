import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

export default function SearchFilter({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filters = [],
  onReset
}) {
  const hasActiveFilters = searchValue || filters.some((f) => f.value && f.value !== 'ALL');

  return (
    <div className="filter-bar">
      {onSearchChange && (
        <div className="filter-input-wrap">
          <Search className="filter-input-icon" size={15} />
          <input
            type="text"
            className="filter-input"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
          />
        </div>
      )}

      {filters.map((filter) => (
        <select
          key={filter.id}
          className="filter-select"
          value={filter.value}
          onChange={(e) => filter.onChange(e.target.value)}
          aria-label={filter.label}
        >
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}

      {hasActiveFilters && onReset && (
        <button
          type="button"
          onClick={onReset}
          className="btn btn-outline btn-sm"
          style={{ height: '36px', padding: '0 0.75rem', gap: '0.35rem' }}
          title="Reset filters"
        >
          <RotateCcw size={13} />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
}

