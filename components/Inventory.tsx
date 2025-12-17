import React from 'react';
import { useData } from '../context/DataContext';
import { AlertTriangle, Box, Truck } from 'lucide-react';

export const Inventory: React.FC = () => {
  const { products } = useData();

  // Filter only Active items for inventory management (exclude tests if desired, but tests have stock too?)
  // Let's include everything that isn't just a concept.
  const inventoryProducts = products.filter(p => !p.isTest);

  const lowStockItems = inventoryProducts.filter(p => p.stockAvailable > 0 && p.stockAvailable < 20);
  const outOfStockItems = inventoryProducts.filter(p => p.stockAvailable === 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Box size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-900">Total Units In Stock</p>
            <p className="text-2xl font-bold text-blue-700">
              {inventoryProducts.reduce((acc, curr) => acc + curr.stockAvailable, 0).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 p-6 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-900">Low Stock Alerts</p>
            <p className="text-2xl font-bold text-amber-700">{lowStockItems.length}</p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-100 p-6 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-lg">
            <Box size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-red-900">Out of Stock</p>
            <p className="text-2xl font-bold text-red-700">{outOfStockItems.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">Stock Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-medium text-xs">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Market</th>
                <th className="px-6 py-4">Available</th>
                <th className="px-6 py-4">Total Stock</th>
                <th className="px-6 py-4">Delivery Rate</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inventoryProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 font-medium text-slate-900">{product.name}</td>
                  <td className="px-6 py-4 text-slate-500">{product.market}</td>
                  <td className={`px-6 py-4 font-bold ${product.stockAvailable < 10 ? 'text-red-600' : 'text-slate-700'}`}>
                    {product.stockAvailable}
                  </td>
                  <td className="px-6 py-4 text-slate-700">{product.stockTotal}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${product.deliveryRate > 30 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                      {product.deliveryRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center gap-1">
                      <Truck size={14} /> Restock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
