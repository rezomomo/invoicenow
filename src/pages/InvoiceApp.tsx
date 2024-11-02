import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Settings } from '../components/Settings';
import { InvoiceInput } from '../components/InvoiceInput';
import { InvoicePreview } from '../components/InvoicePreview';
import { InvoiceList } from '../components/InvoiceList';
import { generatePDF } from '../utils/pdfGenerator';
import { fetchInvoice, fetchInvoiceRequests } from '../services/api';
import type { InvoiceData, InvoiceRequest, UserSettings } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const handleLogout = () => {
    supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/app" className="text-xl font-bold text-gray-800">
            Takealot Invoice Generator
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/app/settings"
              className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
            >
              <SettingsIcon size={20} />
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </nav>
      <div className="max-w-[1600px] mx-auto p-6">
        {children}
      </div>
    </div>
  );
}

interface InvoiceAppProps {
  session: any;
  userSettings: UserSettings | null;
  onSettingsUpdate: (userId: string) => void;
}

export function InvoiceApp({ session, userSettings, onSettingsUpdate }: InvoiceAppProps) {
  const [invoiceNumber, setInvoiceNumber] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [invoiceData, setInvoiceData] = React.useState<InvoiceData | null>(null);
  const [customerNote, setCustomerNote] = React.useState('');
  const [currentRequestId, setCurrentRequestId] = React.useState<number | undefined>(undefined);
  const [invoices, setInvoices] = React.useState<InvoiceRequest[]>([]);
  const [listLoading, setListLoading] = React.useState(false);
  const [listError, setListError] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [listType, setListType] = React.useState<'open' | 'closed'>('open');
  const [totalItems, setTotalItems] = React.useState(0);
  const [viewedInvoices, setViewedInvoices] = React.useState<Set<number>>(new Set());
  const [downloadedInvoices, setDownloadedInvoices] = React.useState<Set<number>>(new Set());

  React.useEffect(() => {
    if (userSettings?.takealot_api_key) {
      loadInvoiceList();
    }
  }, [listType, userSettings?.takealot_api_key]);

  const loadInvoiceList = async () => {
    if (!userSettings?.takealot_api_key) {
      setListError('API_KEY_MISSING');
      return;
    }
    
    setListLoading(true);
    setListError(null);
    try {
      const data = await fetchInvoiceRequests(listType, userSettings.takealot_api_key);
      setInvoices(data.requests);
      setTotalItems(data.page_summary.total);
      setCurrentPage(1);
    } catch (err) {
      setListError('Failed to load invoice lists');
    } finally {
      setListLoading(false);
    }
  };

  const handleFetchInvoice = async (requestId?: number) => {
    if (!userSettings?.takealot_api_key) {
      setError('Please set your Takealot API key in settings first');
      return;
    }

    const invoiceId = requestId || invoiceNumber;
    if (!invoiceId) {
      setError('Please enter an invoice number');
      return;
    }

    setLoading(true);
    setError('');
    setCurrentRequestId(requestId);

    try {
      const data = await fetchInvoice(invoiceId.toString(), userSettings.takealot_api_key);
      setInvoiceData(data);
      if (requestId) {
        setViewedInvoices(prev => new Set([...prev, requestId]));
      }
      if (!requestId) {
        setInvoiceNumber('');
      }
    } catch (err) {
      setError('Error fetching invoice data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (invoiceData && userSettings) {
      generatePDF(invoiceData, customerNote, userSettings);
      if (invoiceData.order_number) {
        setDownloadedInvoices(prev => new Set([...prev, invoiceData.order_number]));
      }
    }
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <InvoiceInput
                  invoiceNumber={invoiceNumber}
                  onInvoiceNumberChange={setInvoiceNumber}
                  onFetch={() => handleFetchInvoice()}
                  loading={loading}
                  error={error}
                  disabled={!userSettings?.takealot_api_key}
                />

                <InvoiceList
                  title="Invoice Requests"
                  invoices={invoices}
                  loading={listLoading}
                  error={listError}
                  onSelectInvoice={handleFetchInvoice}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  itemsPerPage={10}
                  totalItems={totalItems}
                  listType={listType}
                  onListTypeChange={setListType}
                  viewedInvoices={viewedInvoices}
                  downloadedInvoices={downloadedInvoices}
                />
              </div>

              <div className="lg:sticky lg:top-6 h-fit">
                <InvoicePreview
                  invoiceData={invoiceData}
                  customerNote={customerNote}
                  onCustomerNoteChange={setCustomerNote}
                  onDownload={handleDownloadPDF}
                  corsEnabled={true}
                  requestId={currentRequestId}
                />
              </div>
            </div>
          </Layout>
        }
      />
      <Route
        path="/settings"
        element={
          <Layout>
            <Settings onSettingsUpdate={onSettingsUpdate} />
          </Layout>
        }
      />
    </Routes>
  );
}