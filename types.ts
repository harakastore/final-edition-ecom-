
export interface Product {
  id: string;
  name: string;
  market: string; // e.g., Kenya, Uganda
  status: 'Active' | 'Low Stock' | 'Out of Stock';
  paymentMethod?: string;
  
  // Orders & Logistics
  totalLeads: number;
  totalOrders: number;      // New: Confirmed orders
  totalDelivered: number;
  stockAvailable: number;
  stockTotal: number;       // Total unit in stock
  
  // Financials
  sellingPrice: number;     // Prix de vente
  totalRevenue: number;     // Total Amount in $
  
  // Costs
  cogs: number;             // Stock Price $
  serviceFees: number;      // Delivery fees $
  extraFees: number;        // Extra Fees
  shippingFees: number;     // Shipping a $ (Shipping/Transit)
  serviceFeePerUnit: number; // Fee per ORDER (as per user request)
  
  // Marketing
  adsFacebook: number;
  adsTikTok: number;
  totalAdSpend: number;
  
  // Calculated / CSV Metrics
  netProfit: number;
  deliveryRate: number;     // Delivery rate (total leads)
  confirmationRate: number; // Confirmation rate
  breakEvenDeliveryRate: number; 
  cpdBreakeven: number;     // Cost per Delivered (or Order) Breakeven
  cplBreakeven: number;     // Cost Per Lead Breakeven
  cpl: number;              // Cost Per Lead
  cpd: number;              // Cost Per Order (User calls it CPD)
  profitPerOrder: number;
  profitMargin: number;     // PROFIT %
  
  // Test Lab Specifics
  isTest?: boolean;
  testResult?: 'Winner' | 'Loser' | 'Pending';
  isSourced?: boolean;
  imageUrl?: string;
}

export interface Expense {
  id: string;
  name: string;
  category: string; // Changed to string to allow custom categories
  description?: string; // New field for detailed description
  amount: number;
  date: string;
  productId?: string;
}

export interface MonthlyStat {
  name: string;
  revenue: number;
  profit: number;
  orders: number;
}

export interface ShipmentItem {
  name: string;
  quantity: number;
}

export interface Shipment {
  id: string;
  products: ShipmentItem[]; // Multiple products per shipment
  forwarder: string;
  supplierName: string;
  originCountry: string;
  destinationCountry: string;
  shipmentMethod: 'Air' | 'Sea';
  dateSent: string;
  status: 'Sourcing' | 'Shipped' | 'In Transit' | 'Customs' | 'Delivered';
  
  // Metadata
  imageUrl?: string;
  productLink?: string;
  trackingNumber?: string;
  istikharaDone: boolean;
}

export interface Invoice {
  id: string;
  partnerName: string; // e.g., Delivery Company
  amount: number;
  status: 'Unpaid' | 'Paid';
  link: string;
  date: string;
}

// New Interface for Time-Travel/Filtering
export interface HistoryLog {
  id: string;
  date: string; // ISO Date string YYYY-MM-DD
  type: 'METRIC_UPDATE' | 'EXPENSE';
  productId?: string; // If specific to a product
  
  // Deltas (Changes)
  revenue?: number;
  netProfit?: number; // Calculated at time of entry
  leads?: number;
  orders?: number;
  delivered?: number;
  adSpend?: number;
  
  // Specific Costs (Stored as positive values for aggregation)
  cogs?: number;
  serviceFees?: number;
  extraFees?: number;
  shippingFees?: number;
  
  // For Expense Type
  expenseCategory?: string;
  expenseAmount?: number;
}
