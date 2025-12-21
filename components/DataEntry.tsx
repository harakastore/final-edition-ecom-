
import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { 
  PlusCircle, 
  Save, 
  DollarSign, 
  Package, 
  Megaphone, 
  Truck, 
  CheckCircle, 
  Ship, 
  FileText, 
  TrendingUp, 
  Edit3, 
  AlertTriangle, 
  Upload, 
  X,
  Loader2,
  Beaker,
  Link as LinkIcon,
  Heart,
  Plane,
  Anchor,
  Plus,
  Trash2,
  Globe,
  Tag,
  AlignLeft
} from 'lucide-react';
import { ShipmentItem } from '../types';

type Tab = 'new_product' | 'update_stats' | 'edit_data' | 'add_expense' | 'sourcing';

export const DataEntry: React.FC = () => {
  const { 
    products, 
    addProduct, 
    deleteProduct, 
    updateProductMetrics, 
    editProductDetails, 
    addExpense, 
    addShipment, 
    addInvoice
  } = useData();
  const [activeTab, setActiveTab] = useState<Tab>('update_stats');
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const shipmentFileInputRef = useRef<HTMLInputElement>(null);

  // 1. New Product State
  const [newProd, setNewProd] = useState({ 
    name: '', 
    market: '', 
    stock: 0, 
    cogs: 0, 
    price: 0, 
    serviceFee: 0, 
    isTest: false, 
    imageUrl: '',
    testAdSpend: 0,
    testCpl: 0,
    testResult: 'Pending' as 'Winner' | 'Loser' | 'Pending'
  });
  
  // 2. Update Metrics State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [metrics, setMetrics] = useState({
    fbAds: 0,
    tiktokAds: 0,
    newLeads: 0, 
    confirmedOrders: 0,
    deliveredUnits: 0,
    stockAdded: 0,
    stockCost: 0,
    extraFees: 0,
    shippingFees: 0,
    revenue: 0
  });

  // 3. Edit Product Data State
  const [editData, setEditData] = useState({
    name: '',
    sellingPrice: 0,
    serviceFeePerUnit: 0,
    stockAvailable: 0,
    totalLeads: 0,
    totalOrders: 0,
    totalDelivered: 0,
    totalRevenue: 0,
    adsFacebook: 0,
    adsTikTok: 0,
    cogs: 0,
    extraFees: 0,
    shippingFees: 0,
    imageUrl: ''
  });

  // 4. New Expense State
  const [newExp, setNewExp] = useState({ 
    name: '', 
    category: 'Software', 
    description: '',
    amount: 0, 
    date: new Date().toISOString().split('T')[0] 
  });

  // 5. Sourcing State (Refactored for multi-product)
  const [shipmentItems, setShipmentItems] = useState<ShipmentItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState(0);

  const [shipment, setShipment] = useState({ 
    supplierName: '',
    originCountry: '',
    destinationCountry: '',
    forwarder: '', 
    date: '', 
    status: 'In Transit' as any,
    shipmentMethod: 'Air' as 'Air' | 'Sea',
    imageUrl: '',
    productLink: '',
    trackingNumber: '',
    istikharaDone: false
  });
  const [invoice, setInvoice] = useState({ partner: '', amount: 0, link: '', date: '' });

  // Init selected product
  useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [products]);

  // Load data into edit form when product selected or tab changed
  useEffect(() => {
    if (activeTab === 'edit_data' && selectedProductId) {
      const p = products.find(prod => prod.id === selectedProductId);
      if (p) {
        setEditData({
          name: p.name,
          sellingPrice: p.sellingPrice,
          serviceFeePerUnit: p.serviceFeePerUnit,
          stockAvailable: p.stockAvailable,
          totalLeads: p.totalLeads,
          totalOrders: p.totalOrders,
          totalDelivered: p.totalDelivered,
          totalRevenue: p.totalRevenue,
          adsFacebook: p.adsFacebook,
          adsTikTok: p.adsTikTok,
          cogs: p.cogs,
          extraFees: p.extraFees,
          shippingFees: p.shippingFees,
          imageUrl: p.imageUrl || ''
        });
      }
    }
  }, [selectedProductId, activeTab, products]);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLaunchProduct = () => {
    if (!newProd.name || !newProd.market) return;
    const product: any = { 
      name: newProd.name,
      market: newProd.market,
      status: (newProd.stock > 0 ? 'Active' : 'Out of Stock'),
      totalLeads: 0,
      totalOrders: 0,
      totalDelivered: 0,
      stockAvailable: Number(newProd.stock),
      stockTotal: Number(newProd.stock),
      totalRevenue: 0,
      cogs: Number(newProd.cogs) * Number(newProd.stock),
      serviceFeePerUnit: Number(newProd.serviceFee),
      serviceFees: 0,
      extraFees: 0,
      shippingFees: 0,
      adsFacebook: 0,
      adsTikTok: 0,
      totalAdSpend: newProd.isTest ? Number(newProd.testAdSpend) : 0,
      netProfit: newProd.isTest ? -Number(newProd.testAdSpend) : -(Number(newProd.cogs) * Number(newProd.stock)),
      deliveryRate: 0,
      confirmationRate: 0,
      breakEvenDeliveryRate: 0,
      cpl: newProd.isTest ? Number(newProd.testCpl) : 0,
      cpd: 0,
      sellingPrice: Number(newProd.price),
      isTest: newProd.isTest,
      imageUrl: newProd.imageUrl || '',
      testResult: newProd.isTest ? newProd.testResult : 'Pending',
      isSourced: false,
      cpdBreakeven: 0,
      cplBreakeven: 0,
      profitPerOrder: 0,
      profitMargin: 0
    };
    addProduct(product);
    setNewProd({ 
      name: '', 
      market: '', 
      stock: 0, 
      cogs: 0, 
      price: 0, 
      serviceFee: 0, 
      isTest: false, 
      imageUrl: '',
      testAdSpend: 0,
      testCpl: 0,
      testResult: 'Pending'
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
    showMessage(newProd.isTest ? 'Test Product Added!' : 'Product Launched!');
  };

  const handleDeleteProduct = () => {
      if (!selectedProductId) return;
      if (window.confirm('Are you sure you want to delete this product?')) {
          deleteProduct(selectedProductId);
          setSelectedProductId(''); 
          showMessage('Product removed.');
      }
  };

  const handleUpdateMetrics = () => {
    if (!selectedProductId) return;
    updateProductMetrics(selectedProductId, {
      fbAds: Number(metrics.fbAds),
      tiktokAds: Number(metrics.tiktokAds),
      newLeads: Number(metrics.newLeads),
      confirmedOrders: Number(metrics.confirmedOrders),
      deliveredUnits: Number(metrics.deliveredUnits),
      stockAdded: Number(metrics.stockAdded),
      stockCost: Number(metrics.stockCost),
      extraFees: Number(metrics.extraFees),
      shippingFees: Number(metrics.shippingFees),
      revenue: Number(metrics.revenue)
    });
    setMetrics({ 
        fbAds: 0, tiktokAds: 0, newLeads: 0, confirmedOrders: 0, 
        deliveredUnits: 0, stockAdded: 0, stockCost: 0, extraFees: 0, shippingFees: 0,
        revenue: 0
    });
    showMessage('Metrics updated!');
  };

  const handleEditData = () => {
    if (!selectedProductId) return;
    editProductDetails(selectedProductId, editData);
    showMessage('Data corrected!');
  };

  const handleAddExpense = () => {
    if (!newExp.name || !newExp.amount) return;
    addExpense({
      id: Date.now().toString(),
      name: newExp.name,
      category: newExp.category,
      description: newExp.description,
      amount: Number(newExp.amount),
      date: newExp.date
    });
    setNewExp({ 
      name: '', 
      category: 'Software', 
      description: '',
      amount: 0, 
      date: new Date().toISOString().split('T')[0] 
    });
    showMessage('Expense recorded!');
  };

  const addItemToShipment = () => {
    if (!newItemName || newItemQty <= 0) return;
    setShipmentItems([...shipmentItems, { name: newItemName, quantity: newItemQty }]);
    setNewItemName('');
    setNewItemQty(0);
  };

  const removeItemFromShipment = (index: number) => {
    setShipmentItems(shipmentItems.filter((_, i) => i !== index));
  };

  const handleAddShipment = () => {
    if (shipmentItems.length === 0) {
      alert("Please add at least one product to the shipment list.");
      return;
    }
    addShipment({
      id: Date.now().toString(),
      products: shipmentItems,
      supplierName: shipment.supplierName,
      originCountry: shipment.originCountry,
      destinationCountry: shipment.destinationCountry,
      forwarder: shipment.forwarder,
      dateSent: shipment.date,
      status: shipment.status,
      shipmentMethod: shipment.shipmentMethod,
      imageUrl: shipment.imageUrl,
      productLink: shipment.productLink,
      trackingNumber: shipment.trackingNumber,
      istikharaDone: shipment.istikharaDone
    });
    // Reset state
    setShipment({ 
      supplierName: '',
      originCountry: '',
      destinationCountry: '',
      forwarder: '', 
      date: '', 
      status: 'In Transit', 
      shipmentMethod: 'Air',
      imageUrl: '', 
      productLink: '', 
      trackingNumber: '', 
      istikharaDone: false 
    });
    setShipmentItems([]);
    if (shipmentFileInputRef.current) shipmentFileInputRef.current.value = '';
    showMessage('Shipment tracked!');
  }

  const handleAddInvoice = () => {
    if(!invoice.partner) return;
    addInvoice({
      id: Date.now().toString(),
      partnerName: invoice.partner,
      amount: Number(invoice.amount),
      link: invoice.link,
      date: invoice.date,
      status: 'Unpaid'
    });
    setInvoice({ partner: '', amount: 0, link: '', date: '' });
    showMessage('Invoice added!');
  }

  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-colors whitespace-nowrap
        ${activeTab === id 
          ? 'bg-slate-900 text-white' 
          : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
        }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Data Entry Center</h1>
          <p className="text-slate-500">Log daily performance, fix mistakes, or add new items.</p>
        </div>
        {message && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg animate-fade-in">
            <CheckCircle size={18} />
            <span className="font-medium">{message}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <TabButton id="update_stats" label="Update Metrics" icon={Save} />
        <TabButton id="edit_data" label="Correct / Edit Data" icon={Edit3} />
        <TabButton id="new_product" label="New Product / Test" icon={PlusCircle} />
        <TabButton id="sourcing" label="Sourcing & Partners" icon={Ship} />
        <TabButton id="add_expense" label="Add Expense" icon={DollarSign} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        
        {/* NEW PRODUCT FORM */}
        {activeTab === 'new_product' && (
          <div className="space-y-6">
            <div className="flex gap-4 mb-4">
               <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={newProd.isTest} onChange={e => setNewProd({...newProd, isTest: e.target.checked})} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300" />
                  <span className="text-sm font-medium text-slate-900">This is a Test Product</span>
               </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Product Name</label>
                <input type="text" value={newProd.name} onChange={(e) => setNewProd({...newProd, name: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none" placeholder="e.g. Magic Blender" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Market / Country</label>
                <input type="text" value={newProd.market} onChange={(e) => setNewProd({...newProd, market: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none" placeholder="e.g. Saudi Arabia" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Selling Price</label>
                <input type="number" value={newProd.price} onChange={(e) => setNewProd({...newProd, price: Number(e.target.value)})} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Service Fee Per Order</label>
                <input type="number" value={newProd.serviceFee} onChange={(e) => setNewProd({...newProd, serviceFee: Number(e.target.value)})} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none" placeholder="e.g. 5.00" />
              </div>

              {newProd.isTest ? (
                <>
                  <div className="space-y-2 p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <label className="text-sm font-bold text-purple-900 flex items-center gap-1"><Megaphone size={14}/> Total Ads Spent on Test ($)</label>
                    <input type="number" value={newProd.testAdSpend} onChange={(e) => setNewProd({...newProd, testAdSpend: Number(e.target.value)})} className="w-full px-4 py-2 border border-purple-200 rounded-lg outline-none" placeholder="0.00" />
                  </div>
                  <div className="space-y-2 p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <label className="text-sm font-bold text-purple-900 flex items-center gap-1"><Beaker size={14}/> Test Status</label>
                    <select value={newProd.testResult} onChange={(e) => setNewProd({...newProd, testResult: e.target.value as any})} className="w-full px-4 py-2 border border-purple-200 rounded-lg outline-none bg-white">
                      <option value="Pending">Still Testing (Pending)</option>
                      <option value="Winner">Winner 🏆</option>
                      <option value="Loser">Loser ❌</option>
                    </select>
                  </div>
                  <div className="space-y-2 p-4 bg-purple-50 rounded-xl border border-purple-100 col-span-full">
                    <label className="text-sm font-bold text-purple-900">Cost Per Lead (CPL) during test ($)</label>
                    <input type="number" value={newProd.testCpl} onChange={(e) => setNewProd({...newProd, testCpl: Number(e.target.value)})} className="w-full px-4 py-2 border border-purple-200 rounded-lg outline-none" placeholder="e.g. 1.25" />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Initial Stock</label>
                    <input type="number" value={newProd.stock} onChange={(e) => setNewProd({...newProd, stock: Number(e.target.value)})} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">COGS (Total for Stock)</label>
                    <input type="number" value={newProd.cogs} onChange={(e) => setNewProd({...newProd, cogs: Number(e.target.value)})} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none" placeholder="Total cost" />
                  </div>
                </>
              )}

              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium text-slate-700">Product Image</label>
                <div className="mt-1 flex items-center gap-4 p-4 border-2 border-dashed border-slate-200 rounded-xl hover:border-blue-400 transition-colors">
                  <div className="flex-1">
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleFileChange(e, (url) => setNewProd({...newProd, imageUrl: url}))}
                      className="hidden" 
                      id="product-image-upload"
                    />
                    <label htmlFor="product-image-upload" className="flex items-center justify-center gap-2 cursor-pointer py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">
                      Upload Image
                    </label>
                  </div>
                  {newProd.imageUrl ? (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 shadow-sm group">
                      <img src={newProd.imageUrl} alt="preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => {
                          setNewProd({...newProd, imageUrl: ''});
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-slate-300">
                      <Package size={24} />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button type="button" onClick={handleLaunchProduct} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                {newProd.isTest ? 'Add to Test Lab' : 'Launch Product'}
              </button>
            </div>
          </div>
        )}

        {/* EDIT PRODUCT DATA FORM */}
        {activeTab === 'edit_data' && (
           <div className="space-y-6">
              <div className="p-4 bg-amber-50 text-amber-800 rounded-lg text-sm flex items-center gap-2">
                 <AlertTriangle size={18} />
                 <span>Warning: Overwriting these values will manually adjust totals.</span>
              </div>
              
              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700">Select Product to Correct</label>
                 <select 
                   value={selectedProductId}
                   onChange={(e) => setSelectedProductId(e.target.value)}
                   className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none"
                 >
                   {products.map(p => (
                     <option key={p.id} value={p.id}>{p.name} ({p.market})</option>
                   ))}
                 </select>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  {/* Static Info */}
                  <div className="col-span-full border-b pb-4 mb-2">
                      <h4 className="font-semibold text-slate-800 mb-4">Static Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Name</label>
                            <input type="text" value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} className="w-full px-3 py-1.5 border rounded outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Selling Price</label>
                            <input type="number" value={editData.sellingPrice} onChange={(e) => setEditData({...editData, sellingPrice: Number(e.target.value)})} className="w-full px-3 py-1.5 border rounded outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Service Fee (Per Order)</label>
                            <input type="number" value={editData.serviceFeePerUnit} onChange={(e) => setEditData({...editData, serviceFeePerUnit: Number(e.target.value)})} className="w-full px-3 py-1.5 border rounded outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Stock Avail.</label>
                            <input type="number" value={editData.stockAvailable} onChange={(e) => setEditData({...editData, stockAvailable: Number(e.target.value)})} className="w-full px-3 py-1.5 border rounded outline-none" />
                        </div>
                      </div>
                  </div>

                  {/* Operational Metrics */}
                  <div className="space-y-3">
                      <h4 className="font-semibold text-slate-800 text-sm">Counts</h4>
                      <div className="space-y-1">
                         <label className="text-xs font-medium text-slate-500">Total Leads</label>
                         <input type="number" value={editData.totalLeads} onChange={(e) => setEditData({...editData, totalLeads: Number(e.target.value)})} className="w-full px-3 py-1.5 border rounded outline-none" />
                      </div>
                      <div className="space-y-1">
                         <label className="text-xs font-medium text-slate-500">Confirmed Orders</label>
                         <input type="number" value={editData.totalOrders} onChange={(e) => setEditData({...editData, totalOrders: Number(e.target.value)})} className="w-full px-3 py-1.5 border rounded outline-none" />
                      </div>
                      <div className="space-y-1">
                         <label className="text-xs font-medium text-slate-500">Delivered Units</label>
                         <input type="number" value={editData.totalDelivered} onChange={(e) => setEditData({...editData, totalDelivered: Number(e.target.value)})} className="w-full px-3 py-1.5 border rounded outline-none" />
                      </div>
                  </div>

                  {/* Financials (Income/Ads) */}
                  <div className="space-y-3">
                      <h4 className="font-semibold text-slate-800 text-sm">Income & Ads</h4>
                      <div className="space-y-1">
                         <label className="text-xs font-medium text-slate-500">Total Revenue ($)</label>
                         <input type="number" value={editData.totalRevenue} onChange={(e) => setEditData({...editData, totalRevenue: Number(e.target.value)})} className="w-full px-3 py-1.5 border rounded outline-none" />
                      </div>
                      <div className="space-y-1">
                         <label className="text-xs font-medium text-slate-500">FB Ads Total ($)</label>
                         <input type="number" value={editData.adsFacebook} onChange={(e) => setEditData({...editData, adsFacebook: Number(e.target.value)})} className="w-full px-3 py-1.5 border rounded outline-none" />
                      </div>
                      <div className="space-y-1">
                         <label className="text-xs font-medium text-slate-500">TikTok Ads Total ($)</label>
                         <input type="number" value={editData.adsTikTok} onChange={(e) => setEditData({...editData, adsTikTok: Number(e.target.value)})} className="w-full px-3 py-1.5 border rounded outline-none" />
                      </div>
                  </div>

                   {/* Other Costs */}
                  <div className="space-y-3">
                      <h4 className="font-semibold text-slate-800 text-sm">Other Costs</h4>
                      <div className="space-y-1">
                         <label className="text-xs font-medium text-slate-500">COGS Total ($)</label>
                         <input type="number" value={editData.cogs} onChange={(e) => setEditData({...editData, cogs: Number(e.target.value)})} className="w-full px-3 py-1.5 border rounded outline-none" />
                      </div>
                      <div className="space-y-1">
                         <label className="text-xs font-medium text-slate-500">Extra Fees ($)</label>
                         <input type="number" value={editData.extraFees} onChange={(e) => setEditData({...editData, extraFees: Number(e.target.value)})} className="w-full px-3 py-1.5 border rounded outline-none" />
                      </div>
                      <div className="space-y-1">
                         <label className="text-xs font-medium text-slate-500">Shipping Fees ($)</label>
                         <input type="number" value={editData.shippingFees} onChange={(e) => setEditData({...editData, shippingFees: Number(e.target.value)})} className="w-full px-3 py-1.5 border rounded outline-none" />
                      </div>
                  </div>
               </div>

               <div className="flex justify-between pt-4">
                 <button onClick={handleDeleteProduct} className="px-6 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg font-medium hover:bg-red-100 transition-colors">
                    Remove Product
                 </button>
                 <button onClick={handleEditData} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                   <Save size={18} /> Save & Recalculate
                 </button>
               </div>
           </div>
        )}

        {/* UPDATE STATS FORM */}
        {activeTab === 'update_stats' && (
          <div className="space-y-8">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Select Product to Update</label>
              <select 
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.market})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2 text-slate-800 font-semibold border-b border-slate-200 pb-2">
                  <Megaphone size={18} /> Marketing & Revenue
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-medium text-slate-500 uppercase">Total Revenue ($)</label>
                   <input type="number" value={metrics.revenue} onChange={(e) => setMetrics({...metrics, revenue: Number(e.target.value)})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-500 uppercase">Facebook Ads ($)</label>
                  <input type="number" value={metrics.fbAds} onChange={(e) => setMetrics({...metrics, fbAds: Number(e.target.value)})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-500 uppercase">TikTok Ads ($)</label>
                  <input type="number" value={metrics.tiktokAds} onChange={(e) => setMetrics({...metrics, tiktokAds: Number(e.target.value)})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md outline-none" />
                </div>
              </div>

              <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2 text-slate-800 font-semibold border-b border-slate-200 pb-2">
                  <Truck size={18} /> Operations (Daily)
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500 uppercase">New Leads</label>
                    <input type="number" value={metrics.newLeads} onChange={(e) => setMetrics({...metrics, newLeads: Number(e.target.value)})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500 uppercase">Confirmed Orders</label>
                    <input type="number" value={metrics.confirmedOrders} onChange={(e) => setMetrics({...metrics, confirmedOrders: Number(e.target.value)})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md outline-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-500 uppercase">Delivered Units</label>
                  <input type="number" value={metrics.deliveredUnits} onChange={(e) => setMetrics({...metrics, deliveredUnits: Number(e.target.value)})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md outline-none" />
                </div>
              </div>

              <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2 text-slate-800 font-semibold border-b border-slate-200 pb-2">
                  <Package size={18} /> Costs & Stock
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-500 uppercase">Stock Added</label>
                      <input type="number" value={metrics.stockAdded} onChange={(e) => setMetrics({...metrics, stockAdded: Number(e.target.value)})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-500 uppercase">Stock Cost ($)</label>
                      <input type="number" value={metrics.stockCost} onChange={(e) => setMetrics({...metrics, stockCost: Number(e.target.value)})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md outline-none" />
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-500 uppercase">Extra Fees ($)</label>
                      <input type="number" value={metrics.extraFees} onChange={(e) => setMetrics({...metrics, extraFees: Number(e.target.value)})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-500 uppercase">Shipping Fees ($)</label>
                      <input type="number" value={metrics.shippingFees} onChange={(e) => setMetrics({...metrics, shippingFees: Number(e.target.value)})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md outline-none" />
                    </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button onClick={handleUpdateMetrics} className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2">
                <Save size={18} /> Update Metrics
              </button>
            </div>
          </div>
        )}

        {/* SOURCING FORM */}
        {activeTab === 'sourcing' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="space-y-6">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2"><Ship size={18}/> Shipment Tracking</h3>
                
                {/* Multi-Product List Section */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                   <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                      <Plus size={14} /> Add Products to Shipment
                   </div>
                   <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Product Name" 
                        className="flex-1 px-4 py-2 border rounded-lg outline-none text-sm" 
                        value={newItemName} 
                        onChange={e => setNewItemName(e.target.value)} 
                      />
                      <input 
                        type="number" 
                        placeholder="Qty" 
                        className="w-24 px-4 py-2 border rounded-lg outline-none text-sm" 
                        value={newItemQty} 
                        onChange={e => setNewItemQty(Number(e.target.value))} 
                      />
                      <button 
                        onClick={addItemToShipment}
                        className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                         <Plus size={20} />
                      </button>
                   </div>
                   {shipmentItems.length > 0 && (
                      <div className="space-y-2 mt-2">
                         {shipmentItems.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200 text-sm">
                               <span className="font-medium">{item.name} <span className="text-slate-400">x</span> {item.quantity}</span>
                               <button onClick={() => removeItemFromShipment(idx)} className="text-red-500 hover:text-red-700">
                                  <Trash2 size={16} />
                               </button>
                            </div>
                         ))}
                      </div>
                   )}
                </div>

                <div className="space-y-3">
                   <div className="grid grid-cols-1 gap-3">
                      <input type="text" placeholder="Supplier Name" className="w-full px-4 py-2 border rounded-lg outline-none" value={shipment.supplierName} onChange={e => setShipment({...shipment, supplierName: e.target.value})} />
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input type="text" placeholder="Origin Country" className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none" value={shipment.originCountry} onChange={e => setShipment({...shipment, originCountry: e.target.value})} />
                      </div>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input type="text" placeholder="Destination" className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none" value={shipment.destinationCountry} onChange={e => setShipment({...shipment, destinationCountry: e.target.value})} />
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="Freight Forwarder" className="w-full px-4 py-2 border rounded-lg outline-none" value={shipment.forwarder} onChange={e => setShipment({...shipment, forwarder: e.target.value})} />
                      <input type="date" className="w-full px-4 py-2 border rounded-lg outline-none" value={shipment.date} onChange={e => setShipment({...shipment, date: e.target.value})} />
                   </div>
                   
                   <div className="space-y-2">
                     <label className="text-xs font-semibold text-slate-500 uppercase">Shipment Way & Tracking</label>
                     <div className="grid grid-cols-2 gap-3">
                        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                           <button 
                             onClick={() => setShipment({...shipment, shipmentMethod: 'Air'})}
                             className={`flex-1 flex items-center justify-center gap-1.5 py-1 text-xs font-bold rounded ${shipment.shipmentMethod === 'Air' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                           >
                              <Plane size={14} /> Air
                           </button>
                           <button 
                             onClick={() => setShipment({...shipment, shipmentMethod: 'Sea'})}
                             className={`flex-1 flex items-center justify-center gap-1.5 py-1 text-xs font-bold rounded ${shipment.shipmentMethod === 'Sea' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                           >
                              <Anchor size={14} /> Sea
                           </button>
                        </div>
                        <select value={shipment.status} onChange={e => setShipment({...shipment, status: e.target.value as any})} className="w-full px-4 py-2 border rounded-lg outline-none bg-white">
                          <option value="Sourcing">Sourcing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="In Transit">In Transit</option>
                          <option value="Customs">Customs</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                     </div>
                     <div className="grid grid-cols-2 gap-3 mt-3">
                        <input type="text" placeholder="Tracking Number" className="w-full px-4 py-2 border rounded-lg outline-none" value={shipment.trackingNumber} onChange={e => setShipment({...shipment, trackingNumber: e.target.value})} />
                        <div className="relative">
                           <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                           <input type="text" placeholder="Product Link (URL)" className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none" value={shipment.productLink} onChange={e => setShipment({...shipment, productLink: e.target.value})} />
                        </div>
                     </div>
                   </div>

                   <div className="flex items-center gap-4 py-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={shipment.istikharaDone} onChange={e => setShipment({...shipment, istikharaDone: e.target.checked})} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300" />
                        <span className="text-sm font-medium text-slate-900 flex items-center gap-1">
                          <Heart size={14} className={shipment.istikharaDone ? "fill-red-500 text-red-500" : "text-slate-400"} />
                          Salat Istikhara Done
                        </span>
                      </label>
                   </div>

                   <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Stock Picture</label>
                      <div className="mt-1 flex items-center gap-4 p-4 border-2 border-dashed border-slate-200 rounded-xl hover:border-blue-400 transition-colors">
                        <div className="flex-1">
                          <input 
                            ref={shipmentFileInputRef}
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleFileChange(e, (url) => setShipment({...shipment, imageUrl: url}))}
                            className="hidden" 
                            id="shipment-image-upload"
                          />
                          <label htmlFor="shipment-image-upload" className="flex items-center justify-center gap-2 cursor-pointer py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">
                            <Upload size={16} /> Upload Stock Pic
                          </label>
                        </div>
                        {shipment.imageUrl ? (
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 shadow-sm group">
                            <img src={shipment.imageUrl} alt="preview" className="w-full h-full object-cover" />
                            <button onClick={() => setShipment({...shipment, imageUrl: ''})} className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                              <X size={10} />
                            </button>
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-slate-300">
                            <Package size={20} />
                          </div>
                        )}
                      </div>
                   </div>

                   <button onClick={handleAddShipment} className="w-full py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-900 shadow-md">Track Shipment</button>
                </div>
             </div>

             <div className="space-y-6 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-8">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2"><FileText size={18}/> Partner Invoice</h3>
                <div className="space-y-3">
                   <input type="text" placeholder="Partner Name" className="w-full px-4 py-2 border rounded-lg outline-none" value={invoice.partner} onChange={e => setInvoice({...invoice, partner: e.target.value})} />
                   <input type="number" placeholder="Amount ($)" className="w-full px-4 py-2 border rounded-lg outline-none" value={invoice.amount} onChange={e => setInvoice({...invoice, amount: Number(e.target.value)})} />
                   <input type="text" placeholder="Invoice Link" className="w-full px-4 py-2 border rounded-lg outline-none" value={invoice.link} onChange={e => setInvoice({...invoice, link: e.target.value})} />
                   <input type="date" className="w-full px-4 py-2 border rounded-lg outline-none" value={invoice.date} onChange={e => setInvoice({...invoice, date: e.target.value})} />
                   <button onClick={handleAddInvoice} className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium">Add Invoice</button>
                </div>
             </div>
          </div>
        )}

        {/* ADD EXPENSE FORM */}
        {activeTab === 'add_expense' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                   <FileText size={16} /> Title / Short Name
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Server Hosting" 
                  value={newExp.name} 
                  onChange={(e) => setNewExp({...newExp, name: e.target.value})} 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                   <Tag size={16} /> Category
                </label>
                <input 
                  type="text" 
                  list="expense-categories" 
                  placeholder="Select or type new category" 
                  value={newExp.category} 
                  onChange={(e) => setNewExp({...newExp, category: e.target.value})} 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none" 
                />
                <datalist id="expense-categories">
                   <option value="Software" />
                   <option value="Service" />
                   <option value="Ads" />
                   <option value="Shipping" />
                   <option value="Rent" />
                   <option value="Salaries" />
                   <option value="Other" />
                </datalist>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                   <DollarSign size={16} /> Amount ($)
                </label>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  value={newExp.amount} 
                  onChange={(e) => setNewExp({...newExp, amount: Number(e.target.value)})} 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                   <Save size={16} /> Date
                </label>
                <input 
                  type="date" 
                  value={newExp.date} 
                  onChange={(e) => setNewExp({...newExp, date: e.target.value})} 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none" 
                />
              </div>

              <div className="space-y-2 col-span-full">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                   <AlignLeft size={16} /> Detailed Description
                </label>
                <textarea 
                  placeholder="Enter details about this expense..." 
                  value={newExp.description} 
                  onChange={(e) => setNewExp({...newExp, description: e.target.value})} 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none h-24 resize-none" 
                />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button onClick={handleAddExpense} className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors">Record Expense</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
