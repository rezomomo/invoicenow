import React from 'react';

interface InvoiceInputProps {
  invoiceNumber: string;
  onInvoiceNumberChange: (value: string) => void;
  onFetch: () => void;
  loading: boolean;
  error: string;
  disabled: boolean;
}

export function InvoiceInput({
  invoiceNumber,
  onInvoiceNumberChange,
  onFetch,
  loading,
  error,
  disabled,
}: InvoiceInputProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          value={invoiceNumber}
          onChange={(e) => onInvoiceNumberChange(e.target.value)}
          placeholder="Enter Invoice Number"
          className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          onClick={onFetch}
          disabled={loading || disabled}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 flex items-center gap-2"
        >
          {loading ? 'Loading...' : 'Fetch Invoice'}
        </button>
      </div>

      {error && (
        <div className="text-red-500 mb-4">
          {error}
        </div>
      )}
    </div>
  );
}