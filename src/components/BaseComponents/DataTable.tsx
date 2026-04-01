import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';

export interface DataTableColumn<T = any> {
  field: string;
  headerName: string;
  sortable?: boolean;
  sortType?: 'string' | 'date' | 'number';
  renderCell?: (row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface DataTableProps<T = any> {
  columns: DataTableColumn<T>[];
  data: T[];
  keyField?: string;
  isLoading?: boolean;
  errorMessage?: string | null;
  emptyMessage?: string;
  searchPlaceholder?: string;
  searchFields?: string[];
  pageSize?: number;
  defaultSortField?: string;
  defaultSortDirection?: 'asc' | 'desc';
  onRowClick?: (row: T) => void;
  headerRight?: React.ReactNode;
}

function getFieldValue(obj: any, field: string): any {
  return field.split('.').reduce((acc, key) => acc?.[key], obj);
}

function getDefaultDirection(col: DataTableColumn): 'asc' | 'desc' {
  return col.sortType === 'date' ? 'desc' : 'asc';
}

function compareValues(a: any, b: any, sortType: string): number {
  if (sortType === 'date') {
    const timeA = new Date(a || '').getTime();
    const timeB = new Date(b || '').getTime();
    return (Number.isNaN(timeA) ? 0 : timeA) - (Number.isNaN(timeB) ? 0 : timeB);
  }
  if (sortType === 'number') {
    return (Number(a) || 0) - (Number(b) || 0);
  }
  return String(a || '').localeCompare(String(b || ''), undefined, { sensitivity: 'base' });
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyField = 'id',
  isLoading = false,
  errorMessage = null,
  emptyMessage = 'No data available',
  searchPlaceholder = 'Search...',
  searchFields,
  pageSize = 10,
  defaultSortField,
  defaultSortDirection = 'desc',
  onRowClick,
  headerRight,
}: DataTableProps<T>) {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string | undefined>(defaultSortField);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchInput.trim().toLowerCase());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const handleSort = (field: string) => {
    setCurrentPage(1);
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      const col = columns.find((c) => c.field === field);
      setSortField(field);
      setSortDirection(col?.sortType === 'date' ? 'desc' : 'asc');
    }
  };

  const filteredData = useMemo(() => {
    if (!debouncedSearch) return data;
    const fields = searchFields || columns.map((c) => c.field);
    return data.filter((row) =>
      fields.some((f) =>
        String(getFieldValue(row, f) ?? '').toLowerCase().includes(debouncedSearch)));
  }, [data, debouncedSearch, searchFields, columns]);

  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;
    const col = columns.find((c) => c.field === sortField);
    const type = col?.sortType || 'string';
    return [...filteredData].sort((a, b) => {
      const cmp = compareValues(getFieldValue(a, sortField), getFieldValue(b, sortField), type);
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [filteredData, sortField, sortDirection, columns]);

  const totalResults = sortedData.length;
  const totalPages = Math.max(Math.ceil(totalResults / pageSize), 1);
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalResults);
  const paginatedData = sortedData.slice(startIndex, endIndex);
  const colCount = columns.length;

  const renderBody = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={colCount}>
            <Typography variant="body2" color="text.secondary">Loading...</Typography>
          </TableCell>
        </TableRow>
      );
    }
    if (errorMessage) {
      return (
        <TableRow>
          <TableCell colSpan={colCount}>
            <Typography variant="body2" color="error">{errorMessage}</Typography>
          </TableCell>
        </TableRow>
      );
    }
    if (totalResults === 0) {
      return (
        <TableRow>
          <TableCell colSpan={colCount}>
            <Typography variant="body2" color="text.secondary">{emptyMessage}</Typography>
          </TableCell>
        </TableRow>
      );
    }
    return paginatedData.map((row, index) => (
      <TableRow
        key={row[keyField] != null ? row[keyField] : `row-${startIndex + index}`}
        hover
        {...(onRowClick
          ? {
            role: 'button' as const,
            tabIndex: 0,
            onClick: () => onRowClick(row),
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.key === 'Enter') onRowClick(row);
            },
            sx: { cursor: 'pointer' },
          }
          : {})}
      >
        {columns.map((col) => (
          <TableCell
            key={col.field}
            align={col.align || 'left'}
            sx={{
              fontSize: '0.95rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              wordBreak: 'break-word',
            }}
          >
            {col.renderCell
              ? col.renderCell(row)
              : (getFieldValue(row, col.field) ?? '-')}
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  return (
    <div>
      <div className="tw-mb-4 tw-flex tw-flex-col md:tw-flex-row md:tw-items-center md:tw-justify-between tw-gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setDebouncedSearch(searchInput.trim().toLowerCase());
            setCurrentPage(1);
          }}
          className="tw-w-full md:tw-w-96"
        >
          <TextField
            fullWidth
            size="small"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={searchPlaceholder}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </form>
        {headerRight}
      </div>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', mb: 2, overflowX: 'hidden' }}
      >
        <Table size="medium" sx={{ tableLayout: 'fixed', width: '100%' }}>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.field}
                  align={col.align || 'left'}
                  sx={{ fontWeight: 700, fontSize: '0.95rem', ...(col.width ? { width: col.width } : {}) }}
                >
                  {col.sortable ? (
                    <TableSortLabel
                      active={sortField === col.field}
                      direction={sortField === col.field ? sortDirection : getDefaultDirection(col)}
                      onClick={() => handleSort(col.field)}
                      hideSortIcon={false}
                      sx={{ '& .MuiTableSortLabel-icon': { opacity: 1 } }}
                    >
                      {col.headerName}
                    </TableSortLabel>
                  ) : (
                    col.headerName
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {renderBody()}
          </TableBody>
        </Table>
        {!isLoading && !errorMessage && totalResults > 0 && (
          <Box
            sx={{
              borderTop: '1px solid #e5e7eb',
              py: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <IconButton
              size="small"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={safeCurrentPage === 1}
            >
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <Typography variant="caption" color="text.secondary">
              {`Showing ${startIndex + 1}-${endIndex} of ${totalResults}`}
            </Typography>
            <IconButton
              size="small"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={safeCurrentPage === totalPages}
            >
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </TableContainer>
    </div>
  );
}
