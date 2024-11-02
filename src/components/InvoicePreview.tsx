import React, { useState, useEffect } from 'react';
import { FileDown, FileText, Upload, X } from 'lucide-react';
import { format } from 'date-fns';
import { InvoiceData } from '../types';
import { supabase } from '../lib/supabase';

interface InvoicePreviewProps {
  invoiceData: InvoiceData | null;
  customerNote: string;
  onCustomerNoteChange: (note: string) => void;
  onDownload: () => void;
  corsEnabled: boolean;
  requestId?: number;
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pdfUrl: string;
  invoiceData: InvoiceData;
  customerNote: string;
}

function UploadModal({ isOpen, onClose, onConfirm, pdfUrl, invoiceData, customerNote }: UploadModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Confirm Upload to Takealot</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex gap-6">
          {/* Left side - PDF Preview */}
          <div className="flex-1">
            <p className="text-gray-600 mb-4">Please review the PDF before uploading:</p>
            <div className="aspect-[1/1.414] bg-white border rounded-lg shadow-sm overflow-hidden" style={{ maxHeight: '60vh' }}>
              <embed src={pdfUrl} type="application/pdf" className="w-full h-full" />
            </div>
          </div>

          {/* Right side - Customer Information */}
          <div className="w-96 bg-gray-50 p-6 rounded-lg">
            <h4 className="font-semibold text-lg mb-4">Customer Information</h4>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Customer Name</p>
                <p className="font-medium">{invoiceData.customer_name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Business Name</p>
                <p className="font-medium">{invoiceData.business_name}</p>
              </div>

              {invoiceData.vat_number && (
                <div>
                  <p className="text-sm text-gray-500">VAT Number</p>
                  <p className="font-medium">{invoiceData.vat_number}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500">Invoice Date</p>
                <p className="font-medium">
                  {format(new Date(parseInt(invoiceData.invoice_date) * 1000), 'PPP')}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Order Number</p>
                <p className="font-medium">#{invoiceData.order_number}</p>
              </div>

              {invoiceData.customer_message && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Customer Message</p>
                  <p className="font-medium text-red-600 bg-red-50 p-3 rounded-md">
                    {invoiceData.customer_message}
                  </p>
                </div>
              )}

              {customerNote && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Additional Note</p>
                  <p className="font-medium text-red-600 bg-red-50 p-3 rounded-md">
                    {customerNote}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <Upload size={20} />
            Upload to Takealot
          </button>
        </div>
      </div>
    </div>
  );
}

export function InvoicePreview({
  invoiceData,
  customerNote,
  onCustomerNoteChange,
  onDownload,
  corsEnabled,
  requestId,
}: InvoicePreviewProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    onCustomerNoteChange('');
    setPdfUrl(null);
    setUploadError(null);
    setUploadSuccess(false);
  }, [invoiceData?.order_number]);

  const handleDownload = () => {
    onDownload();
    const pdfBlob = new Blob([window.pdfContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(pdfBlob);
    setPdfUrl(url);
  };

  const handleUpload = () => {
    handleDownload();
    setShowUploadModal(true);
  };

  const handleConfirmUpload = async () => {
    if (!requestId || !window.pdfContent) {
      setUploadError('No PDF or request ID available');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data: settings, error: settingsError } = await supabase
        .from('user_settings')
        .select('takealot_api_key')
        .eq('user_id', user.id)
        .maybeSingle();

      if (settingsError) throw settingsError;
      if (!settings?.takealot_api_key) throw new Error('Takealot API key not found');

      const formData = new FormData();
      const pdfBlob = new Blob([window.pdfContent], { type: 'application/pdf' });
      formData.append('invoice', pdfBlob, `invoice-${requestId}.pdf`);

      const response = await fetch(
        `https://proxy.cors.sh/https://seller-api.takealot.com/v2/sales/customer_invoice_request/${requestId}/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': settings.takealot_api_key,
            'Accept': 'application/json, text/plain, */*',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'x-cors-api-key': import.meta.env.VITE_CORS_API_KEY,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.message || 'Failed to upload PDF');
      }

      setUploadSuccess(true);
      setShowUploadModal(false);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload PDF');
    } finally {
      setIsUploading(false);
    }
  };

  if (!corsEnabled) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Invoice Preview</h2>
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <FileText size={48} className="mb-4" />
          <p className="text-center">Enable CORS access to view and generate invoices</p>
        </div>
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Invoice Preview</h2>
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <FileText size={48} className="mb-4" />
          <p className="text-center">Enter an invoice number or select an invoice to preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">Invoice Preview</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="font-semibold">Order Number:</p>
          <p>{invoiceData.order_number}</p>
        </div>
        <div>
          <p className="font-semibold">Invoice Date:</p>
          <p>{format(new Date(parseInt(invoiceData.invoice_date) * 1000), 'PPP')}</p>
        </div>
        <div>
          <p className="font-semibold">Customer:</p>
          <p>{invoiceData.customer_name}</p>
        </div>
        <div>
          <p className="font-semibold">Business:</p>
          <p>{invoiceData.business_name}</p>
        </div>
        {invoiceData.vat_number && (
          <div>
            <p className="font-semibold">VAT Number:</p>
            <p>{invoiceData.vat_number}</p>
          </div>
        )}
      </div>

      {invoiceData.customer_message && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Customer Message:</h3>
          <div className="bg-gray-50 p-4 rounded">
            {invoiceData.customer_message}
          </div>
        </div>
      )}

      <h3 className="font-semibold mb-2">Items:</h3>
      <div className="overflow-x-auto">
        <table className="w-full mb-6">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-right">Quantity</th>
              <th className="px-4 py-2 text-right">Unit Price</th>
              <th className="px-4 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.invoice_items.map((item, index) => (
              <tr key={index} className="border-t">
                <td className="px-4 py-2">{item.description}</td>
                <td className="px-4 py-2 text-right">{item.quantity}</td>
                <td className="px-4 py-2 text-right">R {item.unit_price.toFixed(2)}</td>
                <td className="px-4 py-2 text-right">R {item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-6">
        <label className="block font-semibold mb-2">
          Additional Note:
        </label>
        <textarea
          value={customerNote}
          onChange={(e) => onCustomerNoteChange(e.target.value)}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder="Add a note to the invoice (optional)"
        />
      </div>

      <div className="flex flex-col gap-4">
        <button
          onClick={handleDownload}
          disabled={!invoiceData}
          className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
        >
          <FileDown size={20} /> Generate & Download PDF
        </button>

        {requestId && (
          <button
            onClick={handleUpload}
            disabled={!invoiceData || isUploading}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
          >
            <Upload size={20} />
            {isUploading ? 'Uploading...' : 'Generate & Upload to Takealot'}
          </button>
        )}

        {uploadError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-2">
            <p className="text-red-600 font-medium">Upload Error:</p>
            <p className="text-red-500">{uploadError}</p>
          </div>
        )}

        {uploadSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-2">
            <p className="text-green-600">Successfully uploaded to Takealot!</p>
          </div>
        )}

        {pdfUrl && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-semibold mb-2">Generated PDF Preview</h4>
            <div className="aspect-[1/1.414] bg-white border rounded-lg shadow-sm overflow-hidden">
              <embed
                src={pdfUrl}
                type="application/pdf"
                className="w-full h-full"
              />
            </div>
          </div>
        )}
      </div>

      {invoiceData && (
        <UploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onConfirm={handleConfirmUpload}
          pdfUrl={pdfUrl || ''}
          invoiceData={invoiceData}
          customerNote={customerNote}
        />
      )}
    </div>
  );
}