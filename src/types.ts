export interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface InvoiceData {
  order_number: number;
  customer_name: string;
  business_name: string;
  vat_number: string;
  invoice_date: string;
  invoice_items: InvoiceItem[];
  customer_message: string;
}

export interface InvoiceRequest {
  request_id: number;
  context_id: number;
  created_at: string;
  closed_at?: string;
}

export interface InvoiceRequestsResponse {
  requests: InvoiceRequest[];
  page_summary: {
    page_number: number;
    page_size: number;
    total: number;
  };
}

export interface UserSettings {
  id: string;
  user_id: string;
  takealot_api_key: string;
  company_name: string;
  trading_name: string;
  registration_number: string;
  address: string;
  created_at: string;
  updated_at: string;
}