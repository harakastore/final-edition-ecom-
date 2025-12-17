import { Product, Expense, MonthlyStat, HistoryLog } from './types';

// Helper to safely parse floats from "1 234,56" format
const p = (val: string | number | undefined) => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  // Remove spaces, replace comma with dot
  const clean = val.toString().replace(/\s/g, '').replace(',', '.');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
};

// Data based on the provided CSV
export const PRODUCTS_DATA: Product[] = [
  {
    id: '1', name: 'Exfoliating Glove', market: 'Kenya', status: 'Active', paymentMethod: 'Attijari bankalik',
    totalLeads: 100, stockTotal: 47, totalDelivered: 53, stockAvailable: 36, totalOrders: 47,
    totalRevenue: p("786,1"), serviceFees: p("-270"), cogs: p("-39"), extraFees: p("-44,86"), shippingFees: 0,
    adsFacebook: p("-334"), adsTikTok: 0, totalAdSpend: 334,
    netProfit: p("98,24"), deliveryRate: p("98,24"), confirmationRate: 0, sellingPrice: 0,
    cpdBreakeven: p("2,72"), profitPerOrder: p("12,49"), profitMargin: 0,
    serviceFeePerUnit: 5.74, // Approximate derived from -270/47 orders
    breakEvenDeliveryRate: 0, cpl: 3.34, cpd: 0, cplBreakeven: 0, isTest: false,
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=200'
  }
];

export const TEST_PRODUCTS: Product[] = [];

export const EXPENSES: Expense[] = [];

export const MONTHLY_STATS: MonthlyStat[] = [];

// Generate some mock history for the dashboard to look alive
const generateMockHistory = (): HistoryLog[] => {
  const history: HistoryLog[] = [];
  const today = new Date();
  
  // Generate 30 days of data
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Random daily metrics
    const dailyLeads = Math.floor(Math.random() * 10) + 5;
    const dailyOrders = Math.floor(dailyLeads * 0.4);
    const dailyDelivered = Math.floor(dailyOrders * 0.8);
    const revenue = dailyOrders * 20; // Avg price
    const ads = dailyLeads * 3; // $3 CPL
    const expenses = Math.random() > 0.7 ? 50 : 0; // Occasional expense

    // Metric Log
    history.push({
      id: `m-${i}`,
      date: dateStr,
      type: 'METRIC_UPDATE',
      productId: '1',
      leads: dailyLeads,
      orders: dailyOrders,
      delivered: dailyDelivered,
      revenue: revenue,
      adSpend: ads,
      cogs: dailyDelivered * 2,
      serviceFees: dailyDelivered * 5,
      netProfit: revenue - ads - (dailyDelivered * 7),
    });

    // Expense Log
    if (expenses > 0) {
      history.push({
        id: `e-${i}`,
        date: dateStr,
        type: 'EXPENSE',
        expenseCategory: 'Software',
        expenseAmount: expenses,
        netProfit: -expenses
      });
    }
  }
  return history;
};

export const MOCK_HISTORY: HistoryLog[] = generateMockHistory();
