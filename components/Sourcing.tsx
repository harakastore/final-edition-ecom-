
import React from 'react';
import { useData } from '../context/DataContext';
import { 
  Ship, 
  CheckCircle, 
  Clock, 
  ExternalLink, 
  FileText, 
  Heart, 
  Truck, 
  Image as ImageIcon,
  PackageSearch
} from 'lucide-react';

export const Sourcing: React.FC = () => {
  const { shipments, invoices, toggleInvoiceStatus } = useData();

  return (
    <div className="space-y-8">
      {/* Shipments Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
           <Ship className="text-blue-600" /> Incoming Stock & Shipments
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
           <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                 <tr>
                    <th className="px-6 py-4">Stock Pic</th>
                    <th className="px-6 py-4">Product / Link</th>
                    <th className="px-6 py-4">Forwarder</th>
                    <th className="px-6 py-4">Tracking #</th>
                    <th className="px-6 py-4">Istikhara</th>
                    <th className="px-6 py-4">Qty</th>
                    <th className="px-6 py-4">Status</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {shipments.length === 0 ? (
                    <tr><td colSpan={7} className="p-10 text-center text-slate-400 italic">No active shipments tracked. Start by adding one in Data Entry.</td></tr>
                 ) : (
                    shipments.map(ship => (
                       <tr key={ship.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                             <div className="w-12 h-12 rounded bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                                {ship.imageUrl ? (
                                   <img src={ship.imageUrl} alt="Stock" className="w-full h-full object-cover" />
                                ) : (
                                   <ImageIcon size={16} className="text-slate-300" />
                                )}
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex flex-col">
                                <span className="font-bold text-slate-800">{ship.productName}</span>
                                {ship.productLink && (
                                   <a 
                                      href={ship.productLink} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className="text-blue-500 hover:underline flex items-center gap-1 text-[10px] mt-1"
                                   >
                                      <ExternalLink size={10} /> Product Link
                                   </a>
                                )}
                             </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600 font-medium">{ship.forwarder}</td>
                          <td className="px-6 py-4">
                             {ship.trackingNumber ? (
                                <div className="flex items-center gap-1.5 text-slate-700 bg-slate-100 px-2 py-1 rounded w-fit text-[11px] font-mono">
                                   <Truck size={12} className="text-slate-400" />
                                   {ship.trackingNumber}
                                </div>
                             ) : (
                                <span className="text-slate-300 italic text-[11px]">N/A</span>
                             )}
                             <p className="text-[10px] text-slate-400 mt-1">{ship.dateSent}</p>
                          </td>
                          <td className="px-6 py-4 text-center">
                             <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${ship.istikharaDone ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                                <Heart size={10} className={ship.istikharaDone ? "fill-emerald-600" : ""} />
                                {ship.istikharaDone ? 'DONE' : 'PENDING'}
                             </div>
                          </td>
                          <td className="px-6 py-4 font-black text-slate-800 tracking-tight">
                             {ship.quantity.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                             <span className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase
                                ${ship.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : 
                                  ship.status === 'In Transit' ? 'bg-blue-100 text-blue-700' : 
                                  ship.status === 'Shipped' ? 'bg-purple-100 text-purple-700' :
                                  'bg-amber-100 text-amber-700'}
                             `}>
                                {ship.status}
                             </span>
                          </td>
                       </tr>
                    ))
                 )}
              </tbody>
           </table>
        </div>
      </div>

      {/* Invoices Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
           <FileText className="text-emerald-600" /> Partner Payments
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {invoices.length === 0 ? (
              <div className="col-span-full bg-white p-8 text-center text-slate-400 rounded-xl border border-slate-100">
                 No invoices recorded. Add one in Data Entry.
              </div>
           ) : (
              invoices.map(inv => (
                 <div key={inv.id} className="bg-white p-5 rounded-xl border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                       <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-slate-800">{inv.partnerName}</h4>
                          <button onClick={() => toggleInvoiceStatus(inv.id)} className={`px-2 py-1 rounded text-xs font-bold border flex items-center gap-1 ${inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                             {inv.status === 'Paid' && <CheckCircle size={10} />}
                             {inv.status}
                          </button>
                       </div>
                       <p className="text-2xl font-bold text-slate-900 mb-1">${inv.amount.toLocaleString()}</p>
                       <p className="text-xs text-slate-400">{inv.date}</p>
                    </div>
                    {inv.link && (
                       <a href={inv.link} target="_blank" rel="noreferrer" className="mt-4 text-blue-600 text-sm flex items-center gap-1 hover:underline font-medium">
                          <ExternalLink size={14} /> View Invoice
                       </a>
                    )}
                 </div>
              ))
           )}
        </div>
      </div>
    </div>
  );
};
