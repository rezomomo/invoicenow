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