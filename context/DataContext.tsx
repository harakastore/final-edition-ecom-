
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
  getDocs,
  writeBatch,
  FirestoreError
} from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { Product, Expense, MonthlyStat, Shipment, Invoice, HistoryLog } from '../types';

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
  clearAllData: () => Promise<void>;
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

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
        setIsLoading(false);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product)));
    });

    const unsubExpenses = onSnapshot(query(collection(db, 'expenses'), orderBy('date', 'desc')), (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Expense)));
    });

    const unsubShipments = onSnapshot(collection(db, 'shipments'), (snapshot) => {
      setShipments(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Shipment)));
    });

    const unsubInvoices = onSnapshot(collection(db, 'invoices'), (snapshot) => {
      setInvoices(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Invoice)));
    });

    const unsubHistory = onSnapshot(query(collection(db, 'history'), orderBy('date', 'desc')), (snapshot) => {
      setHistory(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as HistoryLog)));
    });

    return () => {
      unsubProducts(); unsubExpenses(); unsubShipments(); unsubInvoices(); unsubHistory();
    };
  }, [isAuthenticated]);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const logout = async () => {
    await signOut(auth);
    setProducts([]); setExpenses([]); setShipments([]); setInvoices([]); setHistory([]);
  };

  const clearAllData = async () => {
    if (!isAuthenticated) {
      console.warn("User not authenticated, cannot clear data.");
      return;
    }
    
    // 1. Immediately clear local state to show 0 in UI
    setProducts([]); setHistory([]); setExpenses([]); setShipments([]); setInvoices([]);
    
    const collections = ['products', 'expenses', 'shipments', 'invoices', 'history'];
    try {
      for (const collName of collections) {
        const querySnapshot = await getDocs(collection(db, collName));
        if (querySnapshot.empty) continue;
        
        const docsToDelete = querySnapshot.docs;
        // Process in smaller batches for maximum reliability
        for (let i = 0; i < docsToDelete.length; i += 100) {
          const batch = writeBatch(db);
          const chunk = docsToDelete.slice(i, i + 100);
          chunk.forEach((d) => batch.delete(doc(db, collName, d.id)));
          await batch.commit();
        }
      }
      console.log("Database successfully purged.");
    } catch (e) {
      console.error("Master Purge Failed:", e);
      throw e;
    }
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
    const totalCosts = totalAdSpend + calculatedServiceFees + Math.abs(cogs) + Math.abs(extraFees) + Math.abs(shippingFees);
    const netProfit = totalRevenue - totalCosts;

    return {
      serviceFees: -calculatedServiceFees,
      totalAdSpend,
      netProfit,
      cpd: totalOrders > 0 ? parseFloat((totalAdSpend / totalOrders).toFixed(2)) : 0,
      cpl: totalLeads > 0 ? parseFloat((totalAdSpend / totalLeads).toFixed(2)) : 0,
      profitPerOrder: totalOrders > 0 ? parseFloat((netProfit / totalOrders).toFixed(2)) : 0,
      deliveryRate: totalLeads > 0 ? parseFloat(((totalDelivered / totalLeads) * 100).toFixed(1)) : 0,
      confirmationRate: totalLeads > 0 ? parseFloat(((totalOrders / totalLeads) * 100).toFixed(1)) : 0,
      profitMargin: totalRevenue > 0 ? parseFloat(((netProfit / totalRevenue) * 100).toFixed(1)) : 0,
      cpdBreakeven: 0,
      cplBreakeven: 0
    };
  };

  const addProduct = async (newProduct: Product) => {
    if (!isAuthenticated) return;
    try {
      const docRef = await addDoc(collection(db, 'products'), newProduct);
      if (newProduct.cogs) {
        await addDoc(collection(db, 'history'), {
          date: new Date().toISOString().split('T')[0],
          type: 'METRIC_UPDATE',
          productId: docRef.id,
          cogs: newProduct.cogs,
          netProfit: -newProduct.cogs
        });
      }
    } catch (e) { console.error('Add Product Failed:', e); }
  };

  const deleteProduct = async (id: string) => {
    if (!isAuthenticated) return;
    try { await deleteDoc(doc(db, 'products', id)); } catch (e) { console.error('Delete Product Failed:', e); }
  };

  const editProductDetails = async (id: string, details: any) => {
    if (!isAuthenticated) return;
    try {
      const oldProduct = products.find(prod => prod.id === id);
      if (!oldProduct) return;

      const financials = calculateProductFinancials({ ...oldProduct, ...details } as Product);
      const updatedProduct = { ...details, ...financials };

      const deltaRevenue = (updatedProduct.totalRevenue || 0) - (oldProduct.totalRevenue || 0);
      const deltaProfit = (updatedProduct.netProfit || 0) - (oldProduct.netProfit || 0);

      await updateDoc(doc(db, 'products', id), updatedProduct);

      if (deltaRevenue !== 0 || deltaProfit !== 0) {
        await addDoc(collection(db, 'history'), {
          date: new Date().toISOString().split('T')[0],
          type: 'METRIC_UPDATE',
          productId: id,
          revenue: deltaRevenue,
          netProfit: deltaProfit,
          isCorrection: true
        });
      }
    } catch (e) { console.error('Edit Product Failed:', e); }
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
      const batchCosts = -(metrics.fbAds + metrics.tiktokAds + (metrics.confirmedOrders * (p.serviceFeePerUnit || 0)) + metrics.stockCost + metrics.extraFees + metrics.shippingFees);
      const batchProfit = metrics.revenue + batchCosts;

      await addDoc(collection(db, 'history'), {
        date: new Date().toISOString().split('T')[0],
        type: 'METRIC_UPDATE',
        productId: id,
        leads: metrics.newLeads,
        orders: metrics.confirmedOrders,
        delivered: metrics.deliveredUnits,
        revenue: metrics.revenue,
        adSpend: metrics.fbAds + metrics.tiktokAds,
        cogs: metrics.stockCost,
        netProfit: batchProfit
      });

      await updateDoc(doc(db, 'products', id), { ...updatedData, ...financials });
    } catch (e) { console.error('Update Metrics Failed:', e); }
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
    } catch (e) { console.error('Add Expense Failed:', e); }
  };

  const addShipment = async (shipment: Shipment) => {
    if (!isAuthenticated) return;
    try { await addDoc(collection(db, 'shipments'), shipment); } catch (e) { console.error('Add Shipment Failed:', e); }
  };

  const addInvoice = async (invoice: Invoice) => {
    if (!isAuthenticated) return;
    try { await addDoc(collection(db, 'invoices'), invoice); } catch (e) { console.error('Add Invoice Failed:', e); }
  };

  const toggleInvoiceStatus = async (id: string) => {
    if (!isAuthenticated) return;
    try {
      const inv = invoices.find(i => i.id === id);
      if (inv) await updateDoc(doc(db, 'invoices', id), { status: inv.status === 'Paid' ? 'Unpaid' : 'Paid' });
    } catch (e) { console.error('Toggle Invoice Failed:', e); }
  };

  return (
    <DataContext.Provider value={{ 
      products, expenses, monthlyStats, shipments, invoices, history,
      addProduct, deleteProduct, updateProductMetrics, editProductDetails,
      addExpense, addShipment, addInvoice, toggleInvoiceStatus, clearAllData,
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
