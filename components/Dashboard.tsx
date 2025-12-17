import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, DollarSign, Package, Activity, Truck, Megaphone, Calendar, Filter } from 'lucide-react';

// Color palette for Pie Chart
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

const StatCard = ({ title, value, subtext, icon: Icon, colorClass, highlight }: any) => (
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
  const { history, products } = useData();
  const [period, setPeriod] = useState<Period>('This Month');

  // --- FILTER LOGIC ---
  const filteredData = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    // Helper for dates
    const getStartOfWeek = (d: Date) => {
      const date = new Date(d);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      return new Date(date.setDate(diff));
    };

    if (period === 'All Time') return history;

    return history.filter(item => {
      const itemDate = new Date(item.date);
      const itemDateStr = item.date;

      if (period === 'Today') {
        return itemDateStr === todayStr;
      }
      if (period === 'Yesterday') {
        const yest = new Date(now);
        yest.setDate(now.getDate() - 1);
        return itemDateStr === yest.toISOString().split('T')[0];
      }
      if (period === 'This Week') {
        const startOfWeek = getStartOfWeek(now);
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

  // --- AGGREGATION LOGIC ---
  const stats = useMemo(() => {
    let revenue = 0;
    let netProfit = 0;
    let orders = 0;
    let leads = 0;
    let delivered = 0;
    let adSpend = 0;
    
    // Aggregating expenses for Pie Chart
    const expenseMap: Record<string, number> = {};

    filteredData.forEach(log => {
      // Metrics
      revenue += (log.revenue || 0);
      netProfit += (log.netProfit || 0);
      orders += (log.orders || 0);
      leads += (log.leads || 0);
      delivered += (log.delivered || 0);
      adSpend += (log.adSpend || 0);

      // Collect Expenses (Both Type EXPENSE and Cost parts of METRIC_UPDATE)
      if (log.type === 'EXPENSE') {
        const cat = log.expenseCategory || 'Other';
        expenseMap[cat] = (expenseMap[cat] || 0) + (log.expenseAmount || 0);
      } else {
        // Break down costs from metric updates into "COGS", "Shipping", "Fees", "Ads" categories for the chart
        if (log.cogs) expenseMap['COGS'] = (expenseMap['COGS'] || 0) + log.cogs;
        if (log.shippingFees) expenseMap['Shipping'] = (expenseMap['Shipping'] || 0) + log.shippingFees;
        if (log.serviceFees) expenseMap['Service Fees'] = (expenseMap['Service Fees'] || 0) + log.serviceFees;
        if (log.extraFees) expenseMap['Extra Fees'] = (expenseMap['Extra Fees'] || 0) + log.extraFees;
        if (log.adSpend) expenseMap['Ads'] = (expenseMap['Ads'] || 0) + log.adSpend;
      }
    });

    // Rates
    const deliveryRate = leads > 0 ? ((delivered / leads) * 100).toFixed(1) : '0.0';
    const confRate = leads > 0 ? ((orders / leads) * 100).toFixed(1) : '0.0';

    // Pie Chart Data
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
      deliveryRate,
      confRate,
      expenseChartData,
      totalExpenses: Object.values(expenseMap).reduce((a,b) => a+b, 0)
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
      {/* Header & Filter */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Performance for: <span className="font-semibold text-blue-600">{period}</span></p>
        </div>
        <div className="flex flex-wrap gap-2">
           <PeriodButton label="Today" />
           <PeriodButton label="Yesterday" />
           <PeriodButton label="This Week" />
           <PeriodButton label="This Month" />
           <PeriodButton label="All Time" />
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`$${stats.revenue.toLocaleString()}`} 
          subtext="Gross Sales"
          icon={DollarSign}
        />
        <StatCard 
          title="Net Profit" 
          value={`$${stats.netProfit.toLocaleString()}`} 
          subtext="Net Earnings"
          icon={Activity}
          colorClass={stats.netProfit < 0 ? 'text-red-600' : 'text-emerald-600'}
          highlight={true}
        />
        <StatCard 
          title="Total Ad Spend" 
          value={`$${stats.adSpend.toLocaleString()}`} 
          subtext="Marketing Cost"
          icon={Megaphone}
        />
        <StatCard 
          title="Total Expenses" 
          value={`$${stats.totalExpenses.toLocaleString()}`} 
          subtext="Ads + COGS + Ops"
          icon={TrendingUp}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-center justify-between">
            <div>
               <p className="text-xs text-slate-500 font-semibold uppercase">Orders</p>
               <p className="text-xl font-bold text-slate-900 mt-1">{stats.orders}</p>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Package size={20} /></div>
         </div>
         <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-center justify-between">
            <div>
               <p className="text-xs text-slate-500 font-semibold uppercase">Delivered</p>
               <p className="text-xl font-bold text-emerald-700 mt-1">{stats.delivered}</p>
            </div>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Truck size={20} /></div>
         </div>
         <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-center justify-between">
            <div>
               <p className="text-xs text-slate-500 font-semibold uppercase">Delivery Rate</p>
               <p className="text-xl font-bold text-slate-900 mt-1">{stats.deliveryRate}%</p>
            </div>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Activity size={20} /></div>
         </div>
         <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-center justify-between">
            <div>
               <p className="text-xs text-slate-500 font-semibold uppercase">Conf. Rate</p>
               <p className="text-xl font-bold text-slate-900 mt-1">{stats.confRate}%</p>
            </div>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><CheckCircle size={20} /></div>
         </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expenses Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-1">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Expense Breakdown</h3>
          <div className="h-[300px] w-full relative">
            {stats.expenseChartData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={stats.expenseChartData}
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={80}
                   paddingAngle={5}
                   dataKey="value"
                 >
                   {stats.expenseChartData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                 <Legend verticalAlign="bottom" height={36}/>
               </PieChart>
             </ResponsiveContainer>
            ) : (
               <div className="flex items-center justify-center h-full text-slate-400 text-sm">No expenses recorded for this period.</div>
            )}
            
             {/* Center Text Overlay */}
             {stats.expenseChartData.length > 0 && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -mt-6 text-center pointer-events-none">
                  <p className="text-xs text-slate-400">Total</p>
                  <p className="font-bold text-slate-800">${stats.totalExpenses.toLocaleString()}</p>
                </div>
             )}
          </div>
        </div>

        {/* Bar Chart (Daily trend for the selected period if short, or simple items breakdown) */}
        {/* For simplicity in this iteration, displaying Product Performance for the filtered data or just a simple trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Profit vs Ad Spend Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredData.slice(-10)}> 
                {/* Showing last 10 entries of filtered data to avoid overcrowding or need sophisticated grouping logic here */}
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(str) => str.substring(5)} axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  itemStyle={{ color: '#1e293b' }}
                />
                <Legend />
                <Bar dataKey="netProfit" fill="#10b981" name="Net Profit" radius={[4, 4, 0, 0]} />
                <Bar dataKey="adSpend" fill="#6366f1" name="Ad Spend" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">Showing recent transaction entries for the selected period.</p>
        </div>
      </div>
    </div>
  );
};
import { CheckCircle } from 'lucide-react';
