import React from 'react';
import { useData } from '../context/DataContext';
import { Ship, CheckCircle, Clock, ExternalLink, FileText } from 'lucide-react';

export const Sourcing: React.FC = () => {
  const { shipments, invoices, toggleInvoiceStatus } = useData();

  return (
    <div className="space-y-8">
      {/* Shipments Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
           <Ship className="text-blue-600" /> Incoming Stock
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
           <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                 <tr>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Forwarder</th>
                    <th className="px-6 py-4">Date Sent</th>
                    <th className="px-6 py-4">Qty</th>
                    <th className="px-6 py-4">Status</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {shipments.length === 0 ? (
                    <tr><td colSpan={5} className="p-6 text-center text-slate-400">No active shipments tracked.</td></tr>
                 ) : (
                    shipments.map(ship => (
                       <tr key={ship.id}>
                          <td className="px-6 py-4 font-medium">{ship.productName}</td>
                          <td className="px-6 py-4 text-slate-500">{ship.forwarder}</td>
                          <td className="px-6 py-4 text-slate-500">{ship.dateSent}</td>
                          <td className="px-6 py-4 font-bold">{ship.quantity}</td>
                          <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{ship.status}</span></td>
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
                 <div key={inv.id} className="bg-white p-5 rounded-xl border border-slate-100 flex flex-col justify-between">
                    <div>
                       <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-slate-800">{inv.partnerName}</h4>
                          <button onClick={() => toggleInvoiceStatus(inv.id)} className={`px-2 py-1 rounded text-xs font-bold border flex items-center gap-1 ${inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                             {inv.status === 'Paid' && <CheckCircle size={10} />}
                             {inv.status}
                          </button>
                       </div>
                       <p className="text-2xl font-bold text-slate-900 mb-1">${inv.amount}</p>
                       <p className="text-xs text-slate-400">{inv.date}</p>
                    </div>
                    {inv.link && (
                       <a href={inv.link} target="_blank" rel="noreferrer" className="mt-4 text-blue-600 text-sm flex items-center gap-1 hover:underline">
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