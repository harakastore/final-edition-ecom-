import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  CreditCard, 
  Beaker, 
  Menu, 
  Settings,
  LogOut,
  PenTool,
  Ship
} from 'lucide-react';
import { DataProvider } from './context/DataContext'; // Import Provider
import { Dashboard } from './components/Dashboard';
import { ProductTable } from './components/ProductTable';
import { Inventory } from './components/Inventory';
import { Finance } from './components/Finance';
import { TestLab } from './components/TestLab';
import { DataEntry } from './components/DataEntry';
import { Sourcing } from './components/Sourcing';
import { useData } from './context/DataContext';

type View = 'dashboard' | 'products' | 'inventory' | 'finance' | 'testlab' | 'data_entry' | 'sourcing';

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  isActive, 
  onClick 
}: { 
  icon: any, 
  label: string, 
  isActive: boolean, 
  onClick: () => void 
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium
      ${isActive 
        ? 'bg-slate-900 text-white' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`}
  >
    <Icon size={20} />
    <span>{label}</span>
  </button>
);

const AppLayout: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { products } = useData();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const activeProducts = products.filter(p => !p.isTest);

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Product Performance</h1>
            <ProductTable products={activeProducts} title="All Active Products" />
          </div>
        );
      case 'inventory':
        return <Inventory />;
      case 'finance':
        return <Finance />;
      case 'testlab':
        return <TestLab />;
      case 'data_entry':
        return <DataEntry />;
      case 'sourcing':
        return <Sourcing />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">E</div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">E-Com Master</span>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <SidebarItem 
              icon={LayoutDashboard} 
              label="Dashboard" 
              isActive={currentView === 'dashboard'} 
              onClick={() => { setCurrentView('dashboard'); setIsSidebarOpen(false); }} 
            />
            <SidebarItem 
              icon={PenTool} 
              label="Data Entry" 
              isActive={currentView === 'data_entry'} 
              onClick={() => { setCurrentView('data_entry'); setIsSidebarOpen(false); }} 
            />
            <SidebarItem 
              icon={Package} 
              label="Products" 
              isActive={currentView === 'products'} 
              onClick={() => { setCurrentView('products'); setIsSidebarOpen(false); }} 
            />
            <SidebarItem 
              icon={Beaker} 
              label="Test Lab" 
              isActive={currentView === 'testlab'} 
              onClick={() => { setCurrentView('testlab'); setIsSidebarOpen(false); }} 
            />
            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Management</p>
            </div>
            <SidebarItem 
              icon={Ship} 
              label="Sourcing & Finance" 
              isActive={currentView === 'sourcing'} 
              onClick={() => { setCurrentView('sourcing'); setIsSidebarOpen(false); }} 
            />
            <SidebarItem 
              icon={Package} 
              label="Inventory" 
              isActive={currentView === 'inventory'} 
              onClick={() => { setCurrentView('inventory'); setIsSidebarOpen(false); }} 
            />
            <SidebarItem 
              icon={CreditCard} 
              label="Expenses" 
              isActive={currentView === 'finance'} 
              onClick={() => { setCurrentView('finance'); setIsSidebarOpen(false); }} 
            />
          </nav>

          <div className="p-4 border-t border-slate-100">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium">
              <Settings size={20} />
              <span>Settings</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:text-red-700 transition-colors text-sm font-medium">
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8">
          <button 
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden"
            onClick={toggleSidebar}
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center justify-end w-full gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-slate-900">Admin User</p>
              <p className="text-xs text-slate-500">admin@ecommaster.com</p>
            </div>
            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
              U
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <DataProvider>
      <AppLayout />
    </DataProvider>
  );
};

export default App;