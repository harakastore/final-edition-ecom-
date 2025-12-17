import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product, Expense, MonthlyStat, Shipment, Invoice, HistoryLog } from '../types';
import { PRODUCTS_DATA, TEST_PRODUCTS, EXPENSES, MONTHLY_STATS, MOCK_HISTORY } from '../constants';

interface DataContextType {
  products: Product[];
  expenses: Expense[];
  monthlyStats: MonthlyStat[];
  shipments: Shipment[];
  invoices: Invoice[];
  history: HistoryLog[]; // New History Log
  addProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  updateProductMetrics: (id: string, metrics: any) => void;
  editProductDetails: (id: string, details: any) => void;
  addExpense: (expense: Expense) => void;
  addShipment: (shipment: Shipment) => void;
  addInvoice: (invoice: Invoice) => void;
  toggleInvoiceStatus: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([...PRODUCTS_DATA, ...TEST_PRODUCTS]);
  const [expenses, setExpenses] = useState<Expense[]>(EXPENSES);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStat[]>(MONTHLY_STATS);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [history, setHistory] = useState<HistoryLog[]>(MOCK_HISTORY);

  const addProduct = (newProduct: Product) => {
    setProducts(prev => [...prev, newProduct]);
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addExpense = (newExpense: Expense) => {
    setExpenses(prev => [newExpense, ...prev]);
    
    // Add to History
    const newLog: HistoryLog = {
      id: Date.now().toString(),
      date: newExpense.date,
      type: 'EXPENSE',
      expenseCategory: newExpense.category,
      expenseAmount: newExpense.amount,
      netProfit: -newExpense.amount // Expenses reduce profit
    };
    setHistory(prev => [...prev, newLog]);
  };

  const addShipment = (shipment: Shipment) => {
    setShipments(prev => [shipment, ...prev]);
  };

  const addInvoice = (invoice: Invoice) => {
    setInvoices(prev => [invoice, ...prev]);
  };

  const toggleInvoiceStatus = (id: string) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === id ? { ...inv, status: inv.status === 'Paid' ? 'Unpaid' : 'Paid' } : inv
    ));
  };

  // Helper to recalculate financials based on current state + changes
  const calculateProductFinancials = (p: Product) => {
    // 1. Costs
    // Service Fees = Total Orders * Fee Per Unit (Per User Request)
    const calculatedServiceFees = Math.abs(p.totalOrders * p.serviceFeePerUnit);
    
    // Total Ad Spend
    const totalAdSpend = Math.abs(p.adsFacebook) + Math.abs(p.adsTikTok);

    // Other Costs (Absolute values)
    const absCogs = Math.abs(p.cogs);
    const absExtra = Math.abs(p.extraFees);
    const absShipping = Math.abs(p.shippingFees);

    const totalCosts = totalAdSpend + calculatedServiceFees + absCogs + absExtra + absShipping;

    // 2. Net Profit
    // Revenue - All Charges
    const netProfit = p.totalRevenue - totalCosts;

    // 3. Metrics
    // CPD (Cost Per Delivered/Order) - User requested CPD be based on Orders
    const cpd = p.totalOrders > 0 ? parseFloat((totalAdSpend / p.totalOrders).toFixed(2)) : 0;
    
    // CPL (Cost Per Lead)
    const cpl = p.totalLeads > 0 ? parseFloat((totalAdSpend / p.totalLeads).toFixed(2)) : 0;
    
    // Profit Per Order = Net Profit / Total Confirmed Orders
    const profitPerOrder = p.totalOrders > 0 ? parseFloat((netProfit / p.totalOrders).toFixed(2)) : 0;

    // Financial Health
    const nonAdCosts = calculatedServiceFees + absCogs + absExtra + absShipping;
    const grossMargin = p.totalRevenue - nonAdCosts; // Revenue remaining to cover Ads + Profit

    // CPD Breakeven (Max Ad Spend per Order to break even)
    const cpdBreakeven = p.totalOrders > 0 ? parseFloat((grossMargin / p.totalOrders).toFixed(2)) : 0;

    // CPL Breakeven (Max Ad Spend per Lead to break even)
    const cplBreakeven = p.totalLeads > 0 ? parseFloat((grossMargin / p.totalLeads).toFixed(2)) : 0;

    const deliveryRate = p.totalLeads > 0 ? parseFloat(((p.totalDelivered / p.totalLeads) * 100).toFixed(1)) : 0;
    const confirmationRate = p.totalLeads > 0 ? parseFloat(((p.totalOrders / p.totalLeads) * 100).toFixed(1)) : 0;

    return {
      serviceFees: -calculatedServiceFees, // Store as negative for consistency with CSV view
      totalAdSpend,
      netProfit,
      cpd,
      cpl,
      profitPerOrder,
      cpdBreakeven,
      cplBreakeven,
      deliveryRate,
      confirmationRate
    };
  };

  const editProductDetails = (id: string, details: any) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== id) return p;
      
      const updatedProduct: Product = {
        ...p,
        name: details.name ?? p.name,
        sellingPrice: Number(details.sellingPrice ?? p.sellingPrice),
        serviceFeePerUnit: Number(details.serviceFeePerUnit ?? p.serviceFeePerUnit),
        stockAvailable: Number(details.stockAvailable ?? p.stockAvailable),
        totalLeads: Number(details.totalLeads ?? p.totalLeads),
        totalOrders: Number(details.totalOrders ?? p.totalOrders),
        totalDelivered: Number(details.totalDelivered ?? p.totalDelivered),
        totalRevenue: Number(details.totalRevenue ?? p.totalRevenue),
        adsFacebook: Number(details.adsFacebook ?? p.adsFacebook),
        adsTikTok: Number(details.adsTikTok ?? p.adsTikTok),
        cogs: Number(details.cogs ?? p.cogs),
        extraFees: Number(details.extraFees ?? p.extraFees),
        shippingFees: Number(details.shippingFees ?? p.shippingFees),
      };

      const financials = calculateProductFinancials(updatedProduct);

      return {
        ...updatedProduct,
        ...financials
      };
    }));
  };

  const updateProductMetrics = (id: string, metrics: {
    fbAds: number;
    tiktokAds: number;
    newLeads: number; 
    confirmedOrders: number;
    deliveredUnits: number;
    stockAdded: number;
    stockCost: number;
    extraFees: number;
    shippingFees: number;
    revenue: number;
  }) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== id) return p;

      // Update Counts
      const updatedTotalLeads = (p.totalLeads || 0) + metrics.newLeads;
      const updatedTotalOrders = (p.totalOrders || 0) + metrics.confirmedOrders;
      const updatedTotalDelivered = p.totalDelivered + metrics.deliveredUnits;
      
      // Update Financials (Additive)
      const updatedTotalRevenue = p.totalRevenue + metrics.revenue;
      const updatedAdsFB = p.adsFacebook - metrics.fbAds;
      const updatedAdsTikTok = p.adsTikTok - metrics.tiktokAds;
      const updatedCogs = p.cogs - metrics.stockCost;
      const updatedExtraFees = (p.extraFees || 0) - metrics.extraFees;
      const updatedShippingFees = (p.shippingFees || 0) - metrics.shippingFees;
      
      // Stock
      const realStockAvailable = p.stockAvailable + metrics.stockAdded - metrics.deliveredUnits;
      const updatedStockTotal = p.stockTotal + metrics.stockAdded;

      const intermediateProduct: Product = {
        ...p,
        totalLeads: updatedTotalLeads,
        totalOrders: updatedTotalOrders,
        totalDelivered: updatedTotalDelivered,
        totalRevenue: updatedTotalRevenue,
        adsFacebook: updatedAdsFB,
        adsTikTok: updatedAdsTikTok,
        cogs: updatedCogs,
        extraFees: updatedExtraFees,
        shippingFees: updatedShippingFees,
        stockAvailable: realStockAvailable,
        stockTotal: updatedStockTotal,
        // Placeholders
        netProfit: 0, cpd: 0, cpl: 0, profitPerOrder: 0, 
        cpdBreakeven: 0, cplBreakeven: 0, serviceFees: 0, totalAdSpend: 0,
        deliveryRate: 0, confirmationRate: 0, breakEvenDeliveryRate: 0, profitMargin: 0
      };

      const financials = calculateProductFinancials(intermediateProduct);

      // --- LOG HISTORY START ---
      // Calculate costs for this specific batch update to log net profit correctly for the day
      // Service fee logic: based on *orders* for this batch
      const batchServiceFees = metrics.confirmedOrders * p.serviceFeePerUnit;
      const batchAdSpend = metrics.fbAds + metrics.tiktokAds;
      const batchCosts = batchAdSpend + batchServiceFees + metrics.stockCost + metrics.extraFees + metrics.shippingFees;
      const batchNetProfit = metrics.revenue - batchCosts;

      const log: HistoryLog = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        type: 'METRIC_UPDATE',
        productId: id,
        leads: metrics.newLeads,
        orders: metrics.confirmedOrders,
        delivered: metrics.deliveredUnits,
        revenue: metrics.revenue,
        adSpend: batchAdSpend,
        cogs: metrics.stockCost,
        extraFees: metrics.extraFees,
        shippingFees: metrics.shippingFees,
        serviceFees: batchServiceFees,
        netProfit: batchNetProfit
      };
      // Must use a functional update for history to access the latest state if needed, 
      // but here we just append.
      setHistory(prev => [...prev, log]);
      // --- LOG HISTORY END ---

      // Status
      let newStatus: Product['status'] = 'Active';
      if (realStockAvailable <= 0) newStatus = 'Out of Stock';
      else if (realStockAvailable < 20) newStatus = 'Low Stock';

      return {
        ...intermediateProduct,
        ...financials,
        status: newStatus
      };
    }));
  };

  return (
    <DataContext.Provider value={{ 
      products, 
      expenses, 
      monthlyStats,
      shipments,
      invoices,
      history,
      addProduct,
      deleteProduct,
      updateProductMetrics,
      editProductDetails,
      addExpense,
      addShipment,
      addInvoice,
      toggleInvoiceStatus
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
