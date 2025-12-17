import React from 'react';
import { useData } from '../context/DataContext';
import { Beaker, ThumbsUp, ThumbsDown, Clock, Search } from 'lucide-react';

export const TestLab: React.FC = () => {
  const { products } = useData();
  const testProducts = products.filter(p => p.isTest);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
          <Beaker size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Product Testing Lab</h1>
          <p className="text-slate-500">Track winners, losers, and sourcing status.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testProducts.length === 0 ? (
             <div className="col-span-full text-center text-slate-500 py-10 bg-white rounded-xl border border-slate-100">
               No test products currently active. Add one in Data Entry!
             </div>
          ) : (
             testProducts.map((product) => (
            <div key={product.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-40 bg-slate-100 relative">
                 <img src={product.imageUrl || 'https://via.placeholder.com/400x200?text=No+Image'} alt={product.name} className="w-full h-full object-cover" />
                 <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded backdrop-blur-sm">
                    {product.market}
                 </div>
              </div>
              <div className="p-5">
                 <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-900">{product.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold border 
                       ${product.testResult === 'Winner' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : ''}
                       ${product.testResult === 'Loser' ? 'bg-red-100 text-red-700 border-red-200' : ''}
                       ${product.testResult === 'Pending' ? 'bg-amber-100 text-amber-700 border-amber-200' : ''}
                    `}>{product.testResult || 'Pending'}</span>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4 my-4 text-sm">
                    <div>
                       <p className="text-slate-400 text-xs">Total Spent</p>
                       <p className="font-semibold text-slate-800">${product.totalAdSpend}</p>
                    </div>
                    <div>
                       <p className="text-slate-400 text-xs">CPA/Cost</p>
                       <p className="font-semibold text-slate-800">${product.cpl}</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                    <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded ${product.isSourced ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                       <Search size={14} />
                       {product.isSourced ? 'Sourced' : 'Not Sourced'}
                    </div>
                    <div className="flex-1 flex justify-end gap-1">
                       <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded"><ThumbsUp size={18}/></button>
                       <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"><ThumbsDown size={18}/></button>
                    </div>
                 </div>
              </div>
            </div>
          )))}
      </div>
    </div>
  );
};