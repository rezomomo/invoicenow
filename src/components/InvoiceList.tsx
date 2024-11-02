import React from 'react';
import { FileText, Loader, ChevronLeft, ChevronRight, MoreHorizontal, Eye, Download, ExternalLink, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { InvoiceRequest } from '../types';
import { Link } from 'react-router-dom';

interface InvoiceListProps {
  title: string;
  invoices: InvoiceRequest[];
  loading: boolean;
  error: string | null;
  onSelectInvoice: (requestId: number) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
  listType: 'open' | 'closed';
  onListTypeChange: (type: 'open' | 'closed') => void;
  viewedInvoices: Set<number>;
  downloadedInvoices: Set<number>;
}

export function InvoiceList({
  title,
  invoices,
  loading,
  error,
  onSelectInvoice,
  currentPage,
  onPageChange,
  itemsPerPage,
  totalItems,
  listType,
  onListTypeChange,
  viewedInvoices,
  downloadedInvoices,
}: InvoiceListProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, invoices.length);
  const currentInvoices = invoices.slice(startIndex, endIndex);

  const getPageNumbers = (current: number, total: number) => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 8;
    
    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    pages.push(1);
    let startPage = Math.max(2, current - 2);
    let endPage = Math.min(total - 1, current + 2);

    if (startPage <= 4) {
      endPage = Math.min(total - 1, 7);
      startPage = 2;
    } else if (endPage >= total - 3) {
      startPage = Math.max(2, total - 6);
      endPage = total - 1;
    }

    if (startPage > 2) pages.push('ellipsis');
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    if (endPage < total - 1) pages.push('ellipsis');
    pages.push(total);

    return pages;
  };

  if (error === 'API_KEY_MISSING') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="text-center py-8">
          <Settings className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">API Key Required</h3>
          <p className="text-gray-500 mb-4">Please set up your Takealot API key to view invoices</p>
          <Link
            to="/settings"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Go to Settings
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-center p-8">
          <Loader className="animate-spin mr-2" />
          <span>Loading invoices...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="text-red-500 p-4">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => onListTypeChange('open')}
              className={`${
                listType === 'open'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Open
            </button>
            <button
              onClick={() => onListTypeChange('closed')}
              className={`${
                listType === 'closed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Closed
            </button>
          </nav>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {listType === 'open' ? (
            <p className="text-lg">No open invoices found</p>
          ) : (
            <p className="text-lg">No closed invoices found</p>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Request ID</th>
                  <th className="px-4 py-2 text-left">Created At</th>
                  <th className="px-4 py-2 text-center">Status</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentInvoices.map((invoice) => (
                  <tr key={invoice.request_id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{invoice.request_id}</td>
                    <td className="px-4 py-2">
                      {format(new Date(invoice.created_at), 'PPp')}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-center gap-2">
                        {viewedInvoices.has(invoice.request_id) && (
                          <div className="flex items-center text-blue-500" title="Viewed">
                            <Eye size={16} className="mr-1" />
                          </div>
                        )}
                        {downloadedInvoices.has(invoice.request_id) && (
                          <div className="flex items-center text-green-500" title="Downloaded">
                            <Download size={16} className="mr-1" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onSelectInvoice(invoice.request_id)}
                          className="inline-flex items-center gap-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        >
                          <FileText size={16} />
                          View
                        </button>
                        <a
                          href={`https://sellers.takealot.com/sales/invoice/${invoice.request_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                        >
                          <ExternalLink size={16} />
                          Takealot
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {endIndex} of {totalItems} results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={20} />
                </button>
                
                {getPageNumbers(currentPage, totalPages).map((page, index) => (
                  page === 'ellipsis' ? (
                    <span key={`ellipsis-${index}`} className="px-3 py-1">
                      <MoreHorizontal size={20} className="text-gray-400" />
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => onPageChange(page)}
                      className={`px-3 py-1 rounded min-w-[32px] ${
                        currentPage === page
                          ? 'bg-blue-500 text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  )
                ))}

                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}