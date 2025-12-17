
import { Product, Expense, MonthlyStat, HistoryLog } from './types';

// Helper to safely parse floats from "1 234,56" format
export const p = (val: string | number | undefined) => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  // Remove spaces, replace comma with dot
  const clean = val.toString().replace(/\s/g, '').replace(',', '.');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
};

// Data is now fetched exclusively from Firestore
export const PRODUCTS_DATA: Product[] = [];
export const TEST_PRODUCTS: Product[] = [];
export const EXPENSES: Expense[] = [];
export const MONTHLY_STATS: MonthlyStat[] = [];
export const MOCK_HISTORY: HistoryLog[] = [];
