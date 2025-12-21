
import React from 'react';
import { useData } from '../context/DataContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AlignLeft, Tag } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ec4899', '#6366f1'];

export const Finance: React.FC = () => {
  const { expenses } = useData();

  // Group expenses by category
  const expenseSummary = expenses.reduce((acc: any, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const pieData = Object.keys(expenseSummary).map((key) => ({
    name: key,
    value: parseFloat(expenseSummary[key].toFixed(2)),
  }));

  return (
    <div className="space-y-6">
       <h1 className="text-2xl font-bold text-slate-900">Financial Breakdown</h1>
       
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Expense Table */}
         <div className="bg-white rounded-xl shadow-sm border border-slate-100 lg:col-span-2">
           <div className="p-6 border-b border-slate-100 flex justify-between items-center">
             <h3 className="text-lg font-semibold text-slate-800">Recent Expenses</h3>
             <span className="text-xs font-bold text-slate-400 uppercase">Total Logged: {expenses.length}</span>
           </div>
           <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase font-medium text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Expense</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.length === 0 ? (
                  <tr><td colSpan={4} className="p-10 text-center text-slate-400 italic">No expenses recorded yet.</td></tr>
                ) : (
                  expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                           <span className="font-bold text-slate-900">{expense.name}</span>
                           {expense.description && (
                              <p className="text-xs text-slate-500 flex items-start gap-1 mt-1 max-w-[300px]">
                                 <AlignLeft size={12} className="mt-0.5 shrink-0" />
                                 {expense.description}
                              </p>
                           )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase border border-slate-200">
                           <Tag size={10} />
                           {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs font-medium">{expense.date}</td>
                      <td className="px-6 py-4 text-right font-black text-slate-900 tracking-tight">${expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
           </div>
         </div>

         {/* Charts */}
         <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 h-fit">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">Cost Distribution</h3>
            <div className="h-[350px] w-full">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={110}
                      innerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={5}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: number) => `$${val.toLocaleString()}`} />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-300 italic text-sm">No distribution data.</div>
              )}
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-xl text-xs text-blue-700 border border-blue-100">
              <p className="font-bold mb-1 flex items-center gap-1 uppercase tracking-wider">Insights</p>
              <p className="leading-relaxed">Monitoring different categories helps identify where your budget is being consumed most. Use descriptions to track specific invoices or service providers for better audit trails.</p>
            </div>
         </div>
       </div>
    </div>
  );
};
