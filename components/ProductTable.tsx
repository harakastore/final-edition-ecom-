import React, { useState } from 'react';
import { Product } from '../types';
import { useData } from '../context/DataContext';
import { Trash2, Image as ImageIcon } from 'lucide-react';

interface ProductTableProps {
  products: Product[];
  title: string;
}

export const ProductTable: React.FC<ProductTableProps> = ({ products, title }) => {
  const { deleteProduct } = useData();
  const [filter, setFilter] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(filter.toLowerCase()) || 
    p.market.toLowerCase().includes(filter.toLowerCase())
  );

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) {
        deleteProduct(id);
    }
  };

  // Helper to format currency
  const m = (val: number) => {
    if (!val) return '$0.00';
    return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        <input 
          type="text" 
          placeholder="Search products..." 
          className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none w-full sm:w-64"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-500 uppercase font-medium">
            <tr>
              <th className="px-4 py-3 text-center">Img</th>
              <th className="px-4 py-3 sticky left-0 bg-slate-50 z-10 shadow-sm">Product</th>
              <th className="px-4 py-3 text-center bg-blue-50/50">Total Leads</th>
              <th className="px-4 py-3 text-center">Unit in Stock</th>
              <th className="px-4 py-3 text-center text-emerald-700 bg-emerald-50/30">Delivered</th>
              <th className="px-4 py-3 text-center">Stock Avail</th>
              <th className="px-4 py-3 text-center">Orders</th>
              <th className="px-4 py-3 text-right font-bold text-slate-800 bg-slate-100/50">Revenue $</th>
              <th className="px-4 py-3 text-right text-red-600">Deliv Fees $</th>
              <th className="px-4 py-3 text-right text-red-600">Stock Price $</th>
              <th className="px-4 py-3 text-right text-red-600">Extra Fees</th>
              <th className="px-4 py-3 text-right text-red-600">Shipping $</th>
              <th className="px-4 py-3 text-right text-purple-600">Ads FB</th>
              <th className="px-4 py-3 text-right text-purple-600">Ads TikTok</th>
              <th className="px-4 py-3 text-center">CPD (Order)</th>
              <th className="px-4 py-3 text-right font-bold text-slate-900 bg-yellow-50">Net Profit $</th>
              <th className="px-4 py-3 text-center">Deliv Rate %</th>
              <th className="px-4 py-3 text-center">Conf. Rate %</th>
              <th className="px-4 py-3 text-right">Selling Price</th>
              <th className="px-4 py-3 text-center text-blue-600 font-semibold">CPL BE</th>
              <th className="px-4 py-3 text-center">CPD BE</th>
              <th className="px-4 py-3 text-right">Profit/Order</th>
              <th className="px-4 py-3 text-center">Profit %</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={16} className="text-slate-300" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-slate-900 sticky left-0 bg-white shadow-sm border-r border-slate-100">
                  <div className="truncate max-w-[150px]" title={product.name}>{product.name}</div>
                  <div className="text-[10px] text-slate-500">{product.market}</div>
                </td>
                <td className="px-4 py-3 text-center bg-blue-50/30 font-semibold">{product.totalLeads}</td>
                <td className="px-4 py-3 text-center">{product.stockTotal}</td>
                <td className="px-4 py-3 text-center font-bold text-emerald-700 bg-emerald-50/20">{product.totalDelivered}</td>
                <td className="px-4 py-3 text-center font-medium">{product.stockAvailable}</td>
                <td className="px-4 py-3 text-center">{product.totalOrders}</td>
                <td className="px-4 py-3 text-right font-bold bg-slate-50/50">{m(product.totalRevenue)}</td>
                <td className="px-4 py-3 text-right text-red-500">{m(Math.abs(product.serviceFees))}</td>
                <td className="px-4 py-3 text-right text-red-500">{m(Math.abs(product.cogs))}</td>
                <td className="px-4 py-3 text-right text-red-500">{m(Math.abs(product.extraFees))}</td>
                <td className="px-4 py-3 text-right text-red-500">{m(Math.abs(product.shippingFees))}</td>
                <td className="px-4 py-3 text-right text-purple-600">{m(Math.abs(product.adsFacebook))}</td>
                <td className="px-4 py-3 text-right text-purple-600">{m(Math.abs(product.adsTikTok))}</td>
                <td className="px-4 py-3 text-center">{m(product.cpd)}</td>
                <td className={`px-4 py-3 text-right font-bold bg-yellow-50/50 ${product.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {m(product.netProfit)}
                </td>
                <td className="px-4 py-3 text-center">{product.deliveryRate.toFixed(1)}%</td>
                <td className="px-4 py-3 text-center">{product.confirmationRate.toFixed(1)}%</td>
                <td className="px-4 py-3 text-right">{m(product.sellingPrice)}</td>
                <td className="px-4 py-3 text-center text-blue-600 font-semibold">{m(product.cplBreakeven)}</td>
                <td className="px-4 py-3 text-center">{m(product.cpdBreakeven)}</td>
                <td className="px-4 py-3 text-right">{m(product.profitPerOrder)}</td>
                <td className="px-4 py-3 text-center">{product.profitMargin.toFixed(1)}%</td>
                <td className="px-4 py-3 text-center">
                    <button 
                        onClick={() => handleDelete(product.id, product.name)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete Product"
                    >
                        <Trash2 size={16} />
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && (
          <div className="p-12 text-center text-slate-400">No products found.</div>
        )}
      </div>
    </div>
  );
};
