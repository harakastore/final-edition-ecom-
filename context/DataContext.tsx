
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc,
  query,
  orderBy,
  FirestoreError
} from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { Product, Expense, MonthlyStat, Shipment, Invoice, HistoryLog } from '../types';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDnclwGNEea9CTIdFN31fbuvz7eJSGcbrI",
  authDomain: "ecom-empire-ae98b.firebaseapp.com",
  projectId: "ecom-empire-ae98b",
  storageBucket: "ecom-empire-ae98b.firebasestorage.app",
  messagingSenderId: "564752058610",
  appId: "1:564752058610:web:51989cc355d80be047a86b",
  measurementId: "G-2JZWEH13JH"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

interface DataContextType {
  products: Product[];
  expenses: Expense[];
  monthlyStats: MonthlyStat[];
  shipments: Shipment[];
  invoices: Invoice[];
  history: HistoryLog[];
  addProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateProductMetrics: (id: string, metrics: any) => Promise<void>;
  editProductDetails: (id: string, details: any) => Promise<void>;
  addExpense: (expense: Expense) => Promise<void>;
  addShipment: (shipment: Shipment) => Promise<void>;
  addInvoice: (invoice: Invoice) => Promise<void>;
  toggleInvoiceStatus: (id: string) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStat[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [history, setHistory] = useState<HistoryLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Firestore Error Handler
  const handleFirestoreError = (error: FirestoreError, context: string) => {
    if (error.code === 'permission-denied') {
      console.warn(`Firestore: Permission denied for ${context}. Ensure you are logged in.`);
    } else {
      console.error(`Firestore Error [${context}]:`, error);
    }
  };

  // Auth Listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false); // Stop loading to show login screen
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Data Listeners (Gated by Auth)
  useEffect(() => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    console.log('User verified. Initializing data listeners...');

    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product)));
    }, (error) => handleFirestoreError(error, 'products'));

    const unsubExpenses = onSnapshot(query(collection(db, 'expenses'), orderBy('date', 'desc')), (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Expense)));
    }, (error) => handleFirestoreError(error, 'expenses'));

    const unsubShipments = onSnapshot(collection(db, 'shipments'), (snapshot) => {
      setShipments(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Shipment)));
    }, (error) => handleFirestoreError(error, 'shipments'));

    const unsubInvoices = onSnapshot(collection(db, 'invoices'), (snapshot) => {
      setInvoices(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Invoice)));
    }, (error) => handleFirestoreError(error, 'invoices'));

    const unsubHistory = onSnapshot(query(collection(db, 'history'), orderBy('date', 'desc')), (snapshot) => {
      setHistory(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as HistoryLog)));
      setIsLoading(false);
    }, (error) => handleFirestoreError(error, 'history'));

    return () => {
      unsubProducts();
      unsubExpenses();
      unsubShipments();
      unsubInvoices();
      unsubHistory();
    };
  }, [isAuthenticated]);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const logout = async () => {
    await signOut(auth);
    setProducts([]);
    setExpenses([]);
    setShipments([]);
    setInvoices([]);
    setHistory([]);
  };

  const calculateProductFinancials = (p: Product) => {
    const totalOrders = p.totalOrders || 0;
    const serviceFeePerUnit = p.serviceFeePerUnit || 0;
    const adsFacebook = p.adsFacebook || 0;
    const adsTikTok = p.adsTikTok || 0;
    const cogs = p.cogs || 0;
    const extraFees = p.extraFees || 0;
    const shippingFees = p.shippingFees || 0;
    const totalRevenue = p.totalRevenue || 0;
    const totalLeads = p.totalLeads || 0;
    const totalDelivered = p.totalDelivered || 0;

    const calculatedServiceFees = Math.abs(totalOrders * serviceFeePerUnit);
    const totalAdSpend = Math.abs(adsFacebook) + Math.abs(adsTikTok);
    const absCogs = Math.abs(cogs);
    const absExtra = Math.abs(extraFees);
    const absShipping = Math.abs(shippingFees);
    const totalCosts = totalAdSpend + calculatedServiceFees + absCogs + absExtra + absShipping;
    const netProfit = totalRevenue - totalCosts;

    const cpd = totalOrders > 0 ? parseFloat((totalAdSpend / totalOrders).toFixed(2)) : 0;
    const cpl = totalLeads > 0 ? parseFloat((totalAdSpend / totalLeads).toFixed(2)) : 0;
    const profitPerOrder = totalOrders > 0 ? parseFloat((netProfit / totalOrders).toFixed(2)) : 0;
    const nonAdCosts = calculatedServiceFees + absCogs + absExtra + absShipping;
    const grossMargin = totalRevenue - nonAdCosts;

    const cpdBreakeven = totalOrders > 0 ? parseFloat((grossMargin / totalOrders).toFixed(2)) : 0;
    const cplBreakeven = totalLeads > 0 ? parseFloat((grossMargin / totalLeads).toFixed(2)) : 0;
    const deliveryRate = totalLeads > 0 ? parseFloat(((totalDelivered / totalLeads) * 100).toFixed(1)) : 0;
    const confirmationRate = totalLeads > 0 ? parseFloat(((totalOrders / totalLeads) * 100).toFixed(1)) : 0;
    const profitMargin = totalRevenue > 0 ? parseFloat(((netProfit / totalRevenue) * 100).toFixed(1)) : 0;

    return {
      serviceFees: -calculatedServiceFees,
      totalAdSpend,
      netProfit,
      cpd,
      cpl,
      profitPerOrder,
      cpdBreakeven,
      cplBreakeven,
      deliveryRate,
      confirmationRate,
      profitMargin
    };
  };

  // PERSISTENCE ACTIONS
  const addProduct = async (newProduct: Product) => {
    if (!isAuthenticated) return;
    try {
      await addDoc(collection(db, 'products'), newProduct);
    } catch (e) {
      console.error('Add Product Failed:', e);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!isAuthenticated) return;
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (e) {
      console.error('Delete Product Failed:', e);
    }
  };

  const editProductDetails = async (id: string, details: any) => {
    if (!isAuthenticated) return;
    try {
      const p = products.find(prod => prod.id === id);
      if (!p) return;
      const financials = calculateProductFinancials({ ...p, ...details } as Product);
      await updateDoc(doc(db, 'products', id), { ...details, ...financials });
    } catch (e) {
      console.error('Edit Product Failed:', e);
    }
  };

  const updateProductMetrics = async (id: string, metrics: any) => {
    if (!isAuthenticated) return;
    try {
      const p = products.find(prod => prod.id === id);
      if (!p) return;

      const updatedData = {
        totalLeads: (p.totalLeads || 0) + metrics.newLeads,
        totalOrders: (p.totalOrders || 0) + metrics.confirmedOrders,
        totalDelivered: (p.totalDelivered || 0) + metrics.deliveredUnits,
        totalRevenue: (p.totalRevenue || 0) + metrics.revenue,
        adsFacebook: (p.adsFacebook || 0) - metrics.fbAds,
        adsTikTok: (p.adsTikTok || 0) - metrics.tiktokAds,
        cogs: (p.cogs || 0) - metrics.stockCost,
        extraFees: (p.extraFees || 0) - metrics.extraFees,
        shippingFees: (p.shippingFees || 0) - metrics.shippingFees,
        stockAvailable: (p.stockAvailable || 0) + metrics.stockAdded - metrics.deliveredUnits,
        stockTotal: (p.stockTotal || 0) + metrics.stockAdded
      };

      const financials = calculateProductFinancials({ ...p, ...updatedData } as Product);
      const batchAdSpend = metrics.fbAds + metrics.tiktokAds;
      const batchCosts = batchAdSpend + (metrics.confirmedOrders * (p.serviceFeePerUnit || 0)) + metrics.stockCost + metrics.extraFees + metrics.shippingFees;

      await addDoc(collection(db, 'history'), {
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
        netProfit: metrics.revenue - batchCosts
      });

      let status: Product['status'] = 'Active';
      if (updatedData.stockAvailable <= 0) status = 'Out of Stock';
      else if (updatedData.stockAvailable < 20) status = 'Low Stock';

      await updateDoc(doc(db, 'products', id), { ...updatedData, ...financials, status });
    } catch (e) {
      console.error('Update Metrics Failed:', e);
    }
  };

  const addExpense = async (newExpense: Expense) => {
    if (!isAuthenticated) return;
    try {
      await addDoc(collection(db, 'expenses'), newExpense);
      await addDoc(collection(db, 'history'), {
        date: newExpense.date,
        type: 'EXPENSE',
        expenseCategory: newExpense.category,
        expenseAmount: newExpense.amount,
        netProfit: -newExpense.amount
      });
    } catch (e) {
      console.error('Add Expense Failed:', e);
    }
  };

  const addShipment = async (shipment: Shipment) => {
    if (!isAuthenticated) return;
    try {
      await addDoc(collection(db, 'shipments'), shipment);
    } catch (e) {
      console.error('Add Shipment Failed:', e);
    }
  };

  const addInvoice = async (invoice: Invoice) => {
    if (!isAuthenticated) return;
    try {
      await addDoc(collection(db, 'invoices'), invoice);
    } catch (e) {
      console.error('Add Invoice Failed:', e);
    }
  };

  const toggleInvoiceStatus = async (id: string) => {
    if (!isAuthenticated) return;
    try {
      const inv = invoices.find(i => i.id === id);
      if (inv) {
        await updateDoc(doc(db, 'invoices', id), { status: inv.status === 'Paid' ? 'Unpaid' : 'Paid' });
      }
    } catch (e) {
      console.error('Toggle Invoice Failed:', e);
    }
  };

  return (
    <DataContext.Provider value={{ 
      products, expenses, monthlyStats, shipments, invoices, history,
      addProduct, deleteProduct, updateProductMetrics, editProductDetails,
      addExpense, addShipment, addInvoice, toggleInvoiceStatus, 
      login, logout, isAuthenticated, isLoading, user
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) throw new Error('useData must be used within a DataProvider');
  return context;
};
