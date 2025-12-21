
import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, DollarSign, Package, Activity, Truck, Megaphone, CheckCircle } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

const StatCard = ({ title, value, subtext, icon: Icon, highlight }: any) => (
  <div className={`p-6 rounded-xl shadow-sm border flex items-start justify-between transition-all
    ${highlight ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-900 border-slate-100'}
  `}>
    <div>
      <p className={`text-sm font-medium mb-1 ${highlight ? 'text-slate-300' : 'text-slate-500'}`}>{title}</p>
      <h3 className="text-2xl font-bold">{value}</h3>
      <p className={`text-xs mt-2 ${highlight ? 'text-slate-400' : 'text-slate-400'}`}>{subtext}</p>
    </div>
    <div className={`p-3 rounded-lg ${highlight ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-600'}`}>
      <Icon size={24} />
    </div>
  </div>
);

type Period = 'Today' | 'Yesterday' | 'This Week' | 'This Month' | 'This Year' | 'All Time';

export const Dashboard: React.FC = () => {
  const { history } = useData();
  const [period, setPeriod] = useState<Period>('This Month');

  const filteredData = useMemo(() => {
    if (!history || history.length === 0) return [];
    
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    if (period === 'All Time') return history;

    return history.filter(item => {
      const itemDate = new Date(item.date);
      const itemDateStr = item.date;

      if (period === 'Today') return itemDateStr === todayStr;
      if (period === 'Yesterday') {
        const yest = new Date(now);
        yest.setDate(now.getDate() - 1);
        return itemDateStr === yest.toISOString().split('T')[0];
      }
      if (period === 'This Week') {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0,0,0,0);
        return itemDate >= startOfWeek;
      }
      if (period === 'This Month') {
        return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
      }
      if (period === 'This Year') {
        return itemDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [history, period]);

  const stats = useMemo(() => {
    // Force zero if no data
    if (filteredData.length === 0) {
      return {
        revenue: 0, netProfit: 0, orders: 0, delivered: 0, adSpend: 0,
        expenseChartData: [], totalExpenses: 0, deliveryRate: '0.0', confRate: '0.0'
      };
    }

    let revenue = 0;
    let netProfit = 0;
    let orders = 0;
    let leads = 0;
    let delivered = 0;
    let adSpend = 0;
    const expenseMap: Record<string, number> = {};

    filteredData.forEach(log => {
      revenue += (log.revenue || 0);
      netProfit += (log.netProfit || 0);
      orders += (log.orders || 0);
      leads += (log.leads || 0);
      delivered += (log.delivered || 0);
      adSpend += (log.adSpend || 0);

      if (log.type === 'EXPENSE') {
        const cat = log.expenseCategory || 'Other';
        expenseMap[cat] = (expenseMap[cat] || 0) + (log.expenseAmount || 0);
      } else {
        if (log.cogs) expenseMap['COGS'] = (expenseMap['COGS'] || 0) + Math.abs(log.cogs);
        if (log.shippingFees) expenseMap['Shipping'] = (expenseMap['Shipping'] || 0) + Math.abs(log.shippingFees);
        if (log.adSpend) expenseMap['Ads'] = (expenseMap['Ads'] || 0) + Math.abs(log.adSpend);
      }
    });

    const expenseChartData = Object.keys(expenseMap).map(key => ({
      name: key,
      value: expenseMap[key]
    })).filter(i => i.value > 0);

    return {
      revenue,
      netProfit,
      orders,
      delivered,
      adSpend,
      expenseChartData,
      totalExpenses: Object.values(expenseMap).reduce((a,b) => a+b, 0),
      deliveryRate: leads > 0 ? ((delivered / leads) * 100).toFixed(1) : '0.0',
      confRate: leads > 0 ? ((orders / leads) * 100).toFixed(1) : '0.0'
    };
  }, [filteredData]);

  const PeriodButton = ({ label }: { label: Period }) => (
    <button 
      onClick={() => setPeriod(label)}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors
        ${period === label 
          ? 'bg-slate-900 text-white shadow-md' 
          : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
        }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Business performance summary for <span className="font-semibold text-blue-600">{period}</span></p>
        </div>
        <div className="flex flex-wrap gap-2">
           <PeriodButton label="Today" />
           <PeriodButton label="Yesterday" />
           <PeriodButton label="This Week" />
           <PeriodButton label="This Month" />
           <PeriodButton label="This Year" />
           <PeriodButton label="All Time" />
        </div>
      </div>

      {(history.length === 0 || stats.revenue === 0) && period === 'This Month' && history.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-20 text-center space-y-4">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
             <TrendingUp size={40} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Platform is Clean</h2>
          <p className="text-slate-500 max-w-sm mx-auto">Your business database is at $0. Start adding metrics in Data Entry to see your new performance data.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Revenue" value={`$${stats.revenue.toLocaleString()}`} subtext="Gross Sales" icon={DollarSign} />
            <StatCard title="Net Profit" value={`$${stats.netProfit.toLocaleString()}`} subtext="Net Earnings" icon={Activity} highlight={true} />
            <StatCard title="Total Ad Spend" value={`$${stats.adSpend.toLocaleString()}`} subtext="Marketing Cost" icon={Megaphone} />
            <StatCard title="Total Expenses" value={`$${stats.totalExpenses.toLocaleString()}`} subtext="Ads + COGS + Ops" icon={TrendingUp} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-center justify-between">
                <div><p className="text-xs text-slate-500 font-semibold uppercase">Orders</p><p className="text-xl font-bold mt-1">{stats.orders}</p></div>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Package size={20} /></div>
             </div>
             <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-center justify-between">
                <div><p className="text-xs text-slate-500 font-semibold uppercase">Delivered</p><p className="text-xl font-bold text-emerald-700 mt-1">{stats.delivered}</p></div>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Truck size={20} /></div>
             </div>
             <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-center justify-between">
                <div><p className="text-xs text-slate-500 font-semibold uppercase">Delivery Rate</p><p className="text-xl font-bold mt-1">{stats.deliveryRate}%</p></div>
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Activity size={20} /></div>
             </div>
             <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-center justify-between">
                <div><p className="text-xs text-slate-500 font-semibold uppercase">Conf. Rate</p><p className="text-xl font-bold mt-1">{stats.confRate}%</p></div>
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><CheckCircle size={20} /></div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-1">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Expense Breakdown</h3>
              <div className="h-[300px] w-full relative">
                {stats.expenseChartData.length > 0 ? (
                   <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie data={stats.expenseChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                       {stats.expenseChartData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                     </Pie>
                     <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                     <Legend verticalAlign="bottom" height={36}/>
                   </PieChart>
                 </ResponsiveContainer>
                ) : <div className="flex items-center justify-center h-full text-slate-400 text-sm">Waiting for new expenses...</div>}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-2">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Profit Trend</h3>
              <div className="h-[300px] w-full">
                {filteredData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredData.slice(-10)}> 
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" tickFormatter={(str) => str.substring(5)} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="netProfit" fill="#10b981" name="Net Profit" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="adSpend" fill="#6366f1" name="Ad Spend" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">No chart data for this period.</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
