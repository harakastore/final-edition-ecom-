import React from 'react';
import { useData } from '../context/DataContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

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
       
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Expense Table */}
         <div className="bg-white rounded-xl shadow-sm border border-slate-100">
           <div className="p-6 border-b border-slate-100">
             <h3 className="text-lg font-semibold text-slate-800">Recent Expenses</h3>
           </div>
           <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase font-medium text-xs">
                <tr>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="px-6 py-4 font-medium text-slate-900">{expense.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">{expense.category}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{expense.date}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">${expense.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
           </div>
         </div>

         {/* Charts */}
         <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">Cost Distribution</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 p-4 bg-slate-50 rounded-lg text-sm text-slate-600">
              <p className="font-medium mb-1">Analysis</p>
              <p>Software and tools account for a significant portion of non-ad operational costs. Monitor "Service" fees for freelancers (e.g., Ahmed, Yasmine) to ensure ROI.</p>
            </div>
         </div>
       </div>
    </div>
  );
};
