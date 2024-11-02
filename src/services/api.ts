import { InvoiceData, InvoiceRequestsResponse } from '../types';

const CORS_API_KEY = import.meta.env.VITE_CORS_API_KEY;
const CORS_PROXY = 'https://proxy.cors.sh/';
const BASE_URL = 'https://seller-api.takealot.com/v2';

const formatApiKey = (apiKey: string) => {
  return apiKey.startsWith('Key ') ? apiKey : `Key ${apiKey}`;
};

const getHeaders = (apiKey: string) => ({
  'Authorization': formatApiKey(apiKey),
  'Accept': '*/*',
  'Content-Type': 'application/json',
  'X-Requested-With': 'XMLHttpRequest',
  'x-cors-api-key': CORS_API_KEY
});

export async function fetchInvoice(invoiceNumber: string, apiKey: string): Promise<InvoiceData> {
  try {
    const response = await fetch(
      `${CORS_PROXY}${BASE_URL}/sales/customer_invoice_request/${invoiceNumber}`,
      { 
        method: 'GET', 
        headers: getHeaders(apiKey),
        mode: 'cors'
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch invoice data');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching invoice:', error);
    throw new Error('Failed to fetch invoice data');
  }
}

export async function fetchInvoiceRequests(status: 'open' | 'closed', apiKey: string): Promise<InvoiceRequestsResponse> {
  try {
    const response = await fetch(
      `${CORS_PROXY}${BASE_URL}/communication/customer_invoice_requests/${status}?page_size=100&page_number=1`,
      { 
        method: 'GET', 
        headers: getHeaders(apiKey),
        mode: 'cors'
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch ${status} invoice requests`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching invoice requests:', error);
    throw new Error('Failed to fetch invoice requests');
  }
}